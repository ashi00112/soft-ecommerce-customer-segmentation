"""
Unit tests for pure NumPy FCM membership inference utility.
"""

import unittest
import numpy as np
import pandas as pd
import joblib

from src.backend.config import FCM_MODEL_PATH
from src.utils.fcm import compute_fcm_memberships


class TestFCMInference(unittest.TestCase):
    """Test suite for compute_fcm_memberships."""

    @classmethod
    def setUpClass(cls):
        """Load fitted FCM model artifacts for testing."""
        cls.fcm_artifact = joblib.load(FCM_MODEL_PATH)
        cls.centers = np.asarray(cls.fcm_artifact["centers"], dtype=np.float64)
        cls.m = float(cls.fcm_artifact["m"])

    def test_membership_output_shape(self):
        """Verify output shape matches (n_samples, n_clusters)."""
        n_samples = 15
        n_features = self.centers.shape[1]
        n_clusters = self.centers.shape[0]

        X = np.random.randn(n_samples, n_features)
        u = compute_fcm_memberships(X, self.centers, m=self.m)

        self.assertEqual(u.shape, (n_samples, n_clusters))

    def test_row_sums_approximately_one(self):
        """Verify that memberships for every observation sum to 1.0."""
        X = np.random.randn(25, self.centers.shape[1])
        u = compute_fcm_memberships(X, self.centers, m=self.m)

        row_sums = u.sum(axis=1)
        self.assertTrue(np.allclose(row_sums, 1.0, atol=1e-12))

    def test_values_within_unit_interval(self):
        """Verify all membership degrees lie strictly in [0.0, 1.0]."""
        X = np.random.randn(30, self.centers.shape[1])
        u = compute_fcm_memberships(X, self.centers, m=self.m)

        self.assertTrue(np.all(u >= 0.0))
        self.assertTrue(np.all(u <= 1.0))

    def test_zero_distance_handling(self):
        """
        When an observation exactly coincides with centroid k,
        membership in cluster k must be 1.0 and 0.0 in all others.
        """
        # Create an input containing exact centroids
        X = self.centers.copy()
        u = compute_fcm_memberships(X, self.centers, m=self.m)

        expected_identity = np.eye(self.centers.shape[0])
        self.assertTrue(np.allclose(u, expected_identity, atol=1e-12))

    def test_invalid_m_rejected(self):
        """Fuzziness parameter m <= 1.0 or non-finite must raise ValueError."""
        X = np.random.randn(5, self.centers.shape[1])

        with self.assertRaises(ValueError):
            compute_fcm_memberships(X, self.centers, m=1.0)

        with self.assertRaises(ValueError):
            compute_fcm_memberships(X, self.centers, m=0.5)

        with self.assertRaises(ValueError):
            compute_fcm_memberships(X, self.centers, m=float("nan"))

    def test_invalid_dimensions_rejected(self):
        """Mismatched feature dimensions or non-2D arrays must raise ValueError."""
        # 1D X
        with self.assertRaises(ValueError):
            compute_fcm_memberships(np.random.randn(self.centers.shape[1]), self.centers, m=self.m)

        # Mismatched features
        with self.assertRaises(ValueError):
            compute_fcm_memberships(np.random.randn(5, self.centers.shape[1] + 2), self.centers, m=self.m)

    def test_nan_inf_rejected(self):
        """Inputs containing NaN or Inf must raise ValueError."""
        X = np.random.randn(5, self.centers.shape[1])
        X[0, 0] = np.nan

        with self.assertRaises(ValueError):
            compute_fcm_memberships(X, self.centers, m=self.m)

        X[0, 0] = np.inf
        with self.assertRaises(ValueError):
            compute_fcm_memberships(X, self.centers, m=self.m)

    def test_holdout_numerical_reproduction(self):
        """
        Compare memberships on the first 100 holdout records against
        saved results/fcm_holdout_memberships.csv.
        """
        holdout_prep = pd.read_csv("data/processed/holdout_preprocessed.csv").drop(columns=["customer_id"])
        holdout_fcm = pd.read_csv("results/fcm_holdout_memberships.csv")

        X_sample = holdout_prep.iloc[:100].to_numpy()
        expected_u = holdout_fcm.iloc[:100][
            ["cluster_1_membership", "cluster_2_membership", "cluster_3_membership", "cluster_4_membership"]
        ].to_numpy()

        u_calc = compute_fcm_memberships(X_sample, self.centers, m=self.m)

        max_diff = np.max(np.abs(u_calc - expected_u))
        self.assertLess(max_diff, 1e-10)
        self.assertTrue(np.allclose(u_calc, expected_u, atol=1e-10))


if __name__ == "__main__":
    unittest.main()
