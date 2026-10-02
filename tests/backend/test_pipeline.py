"""
Unit and integration test suite for CustomerSegmentationPipeline.
Validates input validation edge cases and exact numerical reproduction against holdout data.
"""

import unittest
import numpy as np
import pandas as pd

from src.backend.pipeline import CustomerSegmentationPipeline


class TestCustomerSegmentationPipeline(unittest.TestCase):
    """Test suite for CustomerSegmentationPipeline."""

    @classmethod
    def setUpClass(cls):
        """Instantiate pipeline once for testing."""
        cls.pipeline = CustomerSegmentationPipeline()

        # Load raw holdout data merged with business data
        holdout_raw = pd.read_csv("data/processed/holdout_raw.csv")
        holdout_biz = pd.read_csv("data/processed/holdout_business_data.csv")
        cls.holdout_full = holdout_raw.merge(holdout_biz, on="customer_id")

        # Load ground truth holdout results
        cls.holdout_truth = pd.read_csv("results/final_holdout_retention_prioritization.csv")

    def test_critical_holdout_reproduction(self):
        """
        Critical reproduction test:
        Sample 100 customers from holdout population across all segments,
        run them through CustomerSegmentationPipeline.predict(), and verify
        that every metric, category, and recommendation matches ground truth exactly.
        """
        # Select 100 diverse rows across the holdout set (every 100th record)
        sample_indices = list(range(0, 10000, 100))
        sample_input_df = self.holdout_full.iloc[sample_indices]
        sample_truth_df = self.holdout_truth.iloc[sample_indices]

        for (_, input_row), (_, truth_row) in zip(sample_input_df.iterrows(), sample_truth_df.iterrows()):
            customer_payload = input_row.to_dict()

            pred = self.pipeline.predict(customer_payload)

            # Metadata
            self.assertEqual(pred["customer_id"], truth_row["customer_id"])
            self.assertEqual(pred["assigned_cluster"], int(truth_row["assigned_cluster"]))
            self.assertEqual(pred["cluster_name"], truth_row["cluster_name"])

            # Memberships
            for c_idx in range(1, 5):
                pred_mem = pred["memberships"][f"cluster_{c_idx}"]
                truth_mem = truth_row[f"cluster_{c_idx}_membership"]
                self.assertAlmostEqual(pred_mem, truth_mem, delta=1e-10)

            # Uncertainty metrics
            self.assertAlmostEqual(pred["max_membership"], truth_row["max_membership"], delta=1e-10)
            self.assertAlmostEqual(pred["membership_margin"], truth_row["membership_margin"], delta=1e-10)
            self.assertAlmostEqual(pred["segment_ambiguity_score"], truth_row["segment_ambiguity_score"], delta=1e-10)
            self.assertEqual(pred["ambiguity_level"], truth_row["ambiguity_level"])

            # Components
            self.assertAlmostEqual(pred["clv_component"], truth_row["clv_component"], delta=1e-10)
            self.assertAlmostEqual(pred["churn_component"], truth_row["churn_component"], delta=1e-10)
            self.assertAlmostEqual(pred["ambiguity_component"], truth_row["ambiguity_component"], delta=1e-10)

            # Final scores & categories
            self.assertAlmostEqual(pred["retention_priority_score"], truth_row["retention_priority_score"], delta=1e-10)
            self.assertEqual(pred["retention_priority"], truth_row["retention_priority"])
            self.assertEqual(pred["recommendation"], truth_row["recommendation"])

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

    def test_missing_required_field(self):
        """Missing required input field must raise ValueError."""
        data = self._get_valid_sample()
        del data["tenure_months"]
        with self.assertRaises(ValueError) as ctx:
            self.pipeline.predict(data)
        self.assertIn("Missing required input field", str(ctx.exception))

    def test_invalid_churn_score(self):
        """Churn risk score outside [0, 100] must raise ValueError."""
        data = self._get_valid_sample()
        data["churn_risk_score"] = 150.0
        with self.assertRaises(ValueError):
            self.pipeline.predict(data)

        data["churn_risk_score"] = -5.0
        with self.assertRaises(ValueError):
            self.pipeline.predict(data)

    def test_invalid_rate(self):
        """Rates outside [0.0, 1.0] must raise ValueError."""
        data = self._get_valid_sample()
        data["email_open_rate"] = 1.25
        with self.assertRaises(ValueError):
            self.pipeline.predict(data)

        data["email_open_rate"] = -0.1
        with self.assertRaises(ValueError):
            self.pipeline.predict(data)

    def test_negative_numeric_value(self):
        """Negative values for count/money/tenure fields must raise ValueError."""
        data = self._get_valid_sample()
        data["total_purchases"] = -1
        with self.assertRaises(ValueError):
            self.pipeline.predict(data)

        data = self._get_valid_sample()
        data["avg_order_value_usd"] = -50.0
        with self.assertRaises(ValueError):
            self.pipeline.predict(data)

    def test_invalid_shopping_channel(self):
        """Unrecognized shopping channel category must raise ValueError."""
        data = self._get_valid_sample()
        data["shopping_channel"] = "Catalog"
        with self.assertRaises(ValueError) as ctx:
            self.pipeline.predict(data)
        self.assertIn("Invalid 'shopping_channel'", str(ctx.exception))

    def test_invalid_device(self):
        """Unrecognized device category must raise ValueError."""
        data = self._get_valid_sample()
        data["device_used"] = "SmartTV"
        with self.assertRaises(ValueError) as ctx:
            self.pipeline.predict(data)
        self.assertIn("Invalid 'device_used'", str(ctx.exception))

    def test_invalid_satisfaction_score(self):
        """Satisfaction score outside [1, 5] must raise ValueError."""
        data = self._get_valid_sample()
        data["satisfaction_score"] = 6
        with self.assertRaises(ValueError):
            self.pipeline.predict(data)

        data["satisfaction_score"] = 0
        with self.assertRaises(ValueError):
            self.pipeline.predict(data)

    def test_optional_customer_id(self):
        """Inference succeeds with and without customer_id."""
        data = self._get_valid_sample()
        del data["customer_id"]
        pred = self.pipeline.predict(data)
        self.assertNotIn("customer_id", pred)

        data["customer_id"] = "CUST-999999"
        pred = self.pipeline.predict(data)
        self.assertEqual(pred["customer_id"], "CUST-999999")


if __name__ == "__main__":
    unittest.main()
