"""
FastAPI integration and endpoint validation tests using TestClient.
"""

import unittest
import pandas as pd
from fastapi.testclient import TestClient

from src.backend.main import app


class TestBackendAPI(unittest.TestCase):
    """Test suite for FastAPI REST endpoints."""

    @classmethod
    def setUpClass(cls):
        """Set up test client within the lifespan context."""
        cls.client_context = TestClient(app)
        cls.client = cls.client_context.__enter__()

        # Load holdout sample and ground truth
        holdout_raw = pd.read_csv("data/processed/holdout_raw.csv")
        holdout_biz = pd.read_csv("data/processed/holdout_business_data.csv")
        cls.holdout_full = holdout_raw.merge(holdout_biz, on="customer_id")
        cls.holdout_truth = pd.read_csv("results/final_holdout_retention_prioritization.csv")

    @classmethod
    def tearDownClass(cls):
        """Clean up test client context."""
        cls.client_context.__exit__(None, None, None)

    def test_root_endpoint(self):
        """GET / must return API information."""
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "running")
        self.assertEqual(data["docs"], "/docs")
        self.assertIn("Soft E-commerce", data["name"])

    def test_health_endpoint(self):
        """GET /api/health must report system status without leaking file paths."""
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])
        self.assertEqual(data["algorithm"], "Fuzzy C-Means")
        self.assertEqual(data["n_clusters"], 4)

        # Ensure no filesystem path leaking
        self.assertNotIn(":\\", str(data))
        self.assertNotIn("/Users/", str(data))

    def test_clusters_endpoint(self):
        """GET /api/clusters must return 4 customer segment profiles."""
        resp = self.client.get("/api/clusters")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["n_clusters"], 4)
        self.assertEqual(len(data["clusters"]), 4)

        cluster_names = [c["cluster_name"] for c in data["clusters"]]
        self.assertIn("Inactive / High-Churn-Risk Customers", cluster_names)
        self.assertIn("Low-Purchase High-Conversion Customers", cluster_names)
        self.assertIn("High-Value Active Customers", cluster_names)
        self.assertIn("Low-Engagement Customers", cluster_names)

    def test_predict_holdout_reproduction(self):
        """
        POST /api/predict with real holdout customer.
        Must reproduce results/final_holdout_retention_prioritization.csv exactly.
        """
        test_row = self.holdout_full.iloc[0].to_dict()
        truth_row = self.holdout_truth.iloc[0].to_dict()

        resp = self.client.post("/api/predict", json=test_row)
        self.assertEqual(resp.status_code, 200)
        pred = resp.json()

        # Metadata & Cluster
        self.assertEqual(pred["customer_id"], truth_row["customer_id"])
        self.assertEqual(pred["assigned_cluster"], truth_row["assigned_cluster"])
        self.assertEqual(pred["cluster_name"], truth_row["cluster_name"])

        # Memberships
        for c in range(1, 5):
            self.assertAlmostEqual(
                pred["memberships"][f"cluster_{c}"],
                truth_row[f"cluster_{c}_membership"],
                delta=1e-10,
            )

        # Ambiguity
        self.assertAlmostEqual(pred["segment_ambiguity_score"], truth_row["segment_ambiguity_score"], delta=1e-10)
        self.assertEqual(pred["ambiguity_level"], truth_row["ambiguity_level"])

        # Retention
        self.assertAlmostEqual(pred["retention_priority_score"], truth_row["retention_priority_score"], delta=1e-10)
        self.assertEqual(pred["retention_priority"], truth_row["retention_priority"])
        self.assertEqual(pred["recommendation"], truth_row["recommendation"])

        # Check no filesystem leak
        self.assertNotIn(":\\", str(pred))

    def _get_valid_sample(self):
        """Helper to get a valid customer input payload."""
        return {
            "customer_id": "TEST-001",
            "tenure_months": 24,
            "total_purchases": 15,
            "avg_order_value_usd": 120.50,
            "days_since_last_purchase": 10,
            "return_count": 1,
            "complaint_count": 0,
            "satisfaction_score": 4,
            "email_open_rate": 0.25,
            "click_through_rate": 0.05,
            "conversion_rate": 0.02,
            "shopping_channel": "Online",
            "device_used": "Mobile",
            "customer_lifetime_value_usd": 45000.0,
            "churn_risk_score": 25.0,
        }

    def test_missing_required_field_422(self):
        """Missing field must return 422 Unprocessable Entity."""
        data = self._get_valid_sample()
        del data["total_purchases"]
        resp = self.client.post("/api/predict", json=data)
        self.assertEqual(resp.status_code, 422)

    def test_invalid_churn_risk_422(self):
        """Churn risk score outside [0, 100] must return 422."""
        data = self._get_valid_sample()
        data["churn_risk_score"] = 105.0
        resp = self.client.post("/api/predict", json=data)
        self.assertEqual(resp.status_code, 422)

        data["churn_risk_score"] = -1.0
        resp = self.client.post("/api/predict", json=data)
        self.assertEqual(resp.status_code, 422)

    def test_invalid_rate_422(self):
        """Rate fields outside [0.0, 1.0] must return 422."""
        data = self._get_valid_sample()
        data["conversion_rate"] = 1.5
        resp = self.client.post("/api/predict", json=data)
        self.assertEqual(resp.status_code, 422)

    def test_invalid_shopping_channel_422(self):
        """Unrecognized shopping channel must return 422 validation error."""
        data = self._get_valid_sample()
        data["shopping_channel"] = "PhoneCall"
        resp = self.client.post("/api/predict", json=data)
        self.assertEqual(resp.status_code, 422)

    def test_invalid_device_422(self):
        """Unrecognized device must return 422 validation error."""
        data = self._get_valid_sample()
        data["device_used"] = "SmartWatch"
        resp = self.client.post("/api/predict", json=data)
        self.assertEqual(resp.status_code, 422)

    def test_batch_prediction_valid(self):
        """POST /api/predict/batch with valid customer records."""
        records = [self._get_valid_sample() for _ in range(5)]
        for i, r in enumerate(records):
            r["customer_id"] = f"BATCH-{i:03d}"

        resp = self.client.post("/api/predict/batch", json={"customers": records})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["count"], 5)
        self.assertEqual(len(data["predictions"]), 5)
        self.assertEqual(data["predictions"][0]["customer_id"], "BATCH-000")

    def test_empty_batch_rejected_422(self):
        """Empty batch list must return 422."""
        resp = self.client.post("/api/predict/batch", json={"customers": []})
        self.assertEqual(resp.status_code, 422)

    def test_oversized_batch_rejected_422(self):
        """Batch exceeding 1,000 customers must return 422."""
        oversized = [self._get_valid_sample() for _ in range(1001)]
        resp = self.client.post("/api/predict/batch", json={"customers": oversized})
        self.assertEqual(resp.status_code, 422)


if __name__ == "__main__":
    unittest.main()
