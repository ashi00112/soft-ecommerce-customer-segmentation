"""
Core customer segmentation and retention prioritization inference engine.
Encapsulates artifact loading, input validation, feature transformation,
soft FCM clustering, ambiguity scoring, and rule-based recommendations.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import joblib
import numpy as np
import pandas as pd

from src.backend.config import (
    ALL_REQUIRED_INPUT_FIELDS,
    CLV_REFERENCE_PATH,
    DEPLOYMENT_METADATA_PATH,
    EXPECTED_TRANSFORMED_FEATURE_COUNT,
    FCM_MODEL_PATH,
    PREPROCESSOR_PATH,
    RAW_CLUSTERING_FEATURES,
    RETENTION_CONFIG_PATH,
    VALID_DEVICES,
    VALID_SHOPPING_CHANNELS,
)
from src.utils.entropy import (
    assign_ambiguity_level,
    compute_max_membership,
    compute_membership_margin,
    compute_segment_ambiguity_score,
)
from src.utils.fcm import compute_fcm_memberships
from src.utils.reference_data import calculate_clv_component, load_clv_reference


class CustomerSegmentationPipeline:
    """
    Production-ready inference pipeline for Soft E-commerce Customer Segmentation
    and Retention Prioritization. Pre-loads all required model and reference
    artifacts once during instantiation.
    """

    def __init__(
        self,
        preprocessor_path: Optional[Union[str, Path]] = None,
        fcm_model_path: Optional[Union[str, Path]] = None,
        clv_reference_path: Optional[Union[str, Path]] = None,
        retention_config_path: Optional[Union[str, Path]] = None,
        metadata_path: Optional[Union[str, Path]] = None,
    ):
        """
        Load and validate all deployment artifacts once at pipeline initialization.
        """
        self.preprocessor_path = Path(preprocessor_path or PREPROCESSOR_PATH)
        self.fcm_model_path = Path(fcm_model_path or FCM_MODEL_PATH)
        self.clv_reference_path = Path(clv_reference_path or CLV_REFERENCE_PATH)
        self.retention_config_path = Path(retention_config_path or RETENTION_CONFIG_PATH)
        self.metadata_path = Path(metadata_path or DEPLOYMENT_METADATA_PATH)

        self._load_artifacts()

    def _load_artifacts(self) -> None:
        """Load and cache artifacts into memory."""
        # 1. Preprocessor
        if not self.preprocessor_path.exists():
            raise FileNotFoundError(f"Preprocessor artifact not found at: {self.preprocessor_path}")
        self.preprocessor = joblib.load(self.preprocessor_path)

        # 2. FCM model dictionary
        if not self.fcm_model_path.exists():
            raise FileNotFoundError(f"FCM model artifact not found at: {self.fcm_model_path}")
        self.fcm_artifact = joblib.load(self.fcm_model_path)
        self.fcm_centers = np.asarray(self.fcm_artifact["centers"], dtype=np.float64)
        self.fcm_m = float(self.fcm_artifact["m"])
        self.expected_feature_names = self.fcm_artifact["feature_names"]

        # 3. Development CLV reference distribution
        self.clv_reference = load_clv_reference(self.clv_reference_path)

        # 4. Retention prioritization configuration
        if not self.retention_config_path.exists():
            raise FileNotFoundError(f"Retention config not found at: {self.retention_config_path}")
        with open(self.retention_config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)

        # Extract weights
        score_cfg = self.config["retention_score"]
        self.clv_weight = float(score_cfg["clv_weight"])
        self.churn_weight = float(score_cfg["churn_weight"])
        self.ambiguity_weight = float(score_cfg["ambiguity_weight"])

        # Extract thresholds
        priority_cfg = self.config["priority_thresholds"]
        self.medium_threshold = float(priority_cfg["medium_threshold"])
        self.high_threshold = float(priority_cfg["high_threshold"])
        self.high_ambiguity_threshold = float(self.config["ambiguity"]["high_ambiguity_threshold"])

        # Cluster definitions
        self.cluster_names: Dict[int, str] = {
            1: "Inactive / High-Churn-Risk Customers",
            2: "Low-Purchase High-Conversion Customers",
            3: "High-Value Active Customers",
            4: "Low-Engagement Customers",
        }

    def validate_input(self, customer_data: Dict[str, Any]) -> None:
        """
        Validate input schema, data types, and allowed value ranges.

        Raises
        ------
        ValueError
            If missing required fields, non-finite values, or out-of-bounds values.
        """
        if not isinstance(customer_data, dict):
            raise ValueError(f"Expected customer_data to be a dictionary, got: {type(customer_data)}")

        # Check required fields
        missing_fields = [f for f in ALL_REQUIRED_INPUT_FIELDS if f not in customer_data]
        if missing_fields:
            raise ValueError(f"Missing required input field(s): {', '.join(missing_fields)}")

        # Numeric non-negative fields
        non_negative_fields = [
            "tenure_months",
            "total_purchases",
            "avg_order_value_usd",
            "days_since_last_purchase",
            "return_count",
            "complaint_count",
            "customer_lifetime_value_usd",
        ]
        for field in non_negative_fields:
            val = customer_data[field]
            if not isinstance(val, (int, float, np.number)) or not np.isfinite(val):
                raise ValueError(f"Field '{field}' must be a finite numerical value, got: {val}")
            if val < 0:
                raise ValueError(f"Field '{field}' cannot be negative, got: {val}")

        # Satisfaction score (survey rating between 1 and 5)
        sat = customer_data["satisfaction_score"]
        if not isinstance(sat, (int, float, np.number)) or not np.isfinite(sat):
            raise ValueError(f"Field 'satisfaction_score' must be a finite numeric rating, got: {sat}")
        if sat < 1 or sat > 5:
            raise ValueError(f"Field 'satisfaction_score' must be between 1 and 5, got: {sat}")

        # Rate fields [0.0, 1.0]
        rate_fields = ["email_open_rate", "click_through_rate", "conversion_rate"]
        for field in rate_fields:
            val = customer_data[field]
            if not isinstance(val, (int, float, np.number)) or not np.isfinite(val):
                raise ValueError(f"Field '{field}' must be a finite rate between 0.0 and 1.0, got: {val}")
            if val < 0.0 or val > 1.0:
                raise ValueError(f"Field '{field}' must be in the range [0.0, 1.0], got: {val}")

        # Churn risk score [0.0, 100.0]
        churn = customer_data["churn_risk_score"]
        if not isinstance(churn, (int, float, np.number)) or not np.isfinite(churn):
            raise ValueError(f"Field 'churn_risk_score' must be a finite numeric score in [0, 100], got: {churn}")
        if churn < 0.0 or churn > 100.0:
            raise ValueError(f"Field 'churn_risk_score' must be in the range [0, 100], got: {churn}")

        # Categorical fields
        channel = customer_data["shopping_channel"]
        if channel not in VALID_SHOPPING_CHANNELS:
            raise ValueError(
                f"Invalid 'shopping_channel': '{channel}'. Valid options: {', '.join(VALID_SHOPPING_CHANNELS)}"
            )

        device = customer_data["device_used"]
        if device not in VALID_DEVICES:
            raise ValueError(f"Invalid 'device_used': '{device}'. Valid options: {', '.join(VALID_DEVICES)}")

    def _generate_recommendation(
        self,
        retention_priority: str,
        cluster_name: str,
        ambiguity_level: str,
    ) -> str:
        """
        Generate deterministic rule-based business recommendation exactly
        matching the project analytical definition in notebook 07.
        """
        # High-priority + high-ambiguity
        if retention_priority == "High" and ambiguity_level == "High":
            return (
                "High retention priority with uncertain segment membership. "
                "Review mixed customer characteristics and use a personalized "
                "retention strategy."
            )

        # High-priority + normal ambiguity
        if retention_priority == "High":
            if cluster_name == "Inactive / High-Churn-Risk Customers":
                return (
                    "High retention priority. Prioritize re-engagement and "
                    "churn-prevention actions."
                )
            elif cluster_name == "High-Value Active Customers":
                return (
                    "High retention priority. Protect customer value through "
                    "loyalty benefits and personalized retention offers."
                )
            elif cluster_name == "Low-Engagement Customers":
                return (
                    "High retention priority. Use targeted engagement campaigns "
                    "to strengthen customer activity."
                )
            elif cluster_name == "Low-Purchase High-Conversion Customers":
                return (
                    "High retention priority. Encourage repeat purchases using "
                    "relevant personalized offers."
                )

        # Medium priority
        if retention_priority == "Medium":
            return (
                "Medium retention priority. Monitor the customer and use "
                "targeted engagement where appropriate."
            )

        # Low priority
        return (
            "Low retention priority. Maintain standard engagement and "
            "continue monitoring."
        )

    def predict(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute end-to-end inference for a single customer observation.

        Parameters
        ----------
        customer_data : Dict[str, Any]
            Dictionary containing the 12 raw clustering features, 2 business features,
            and optional 'customer_id'.

        Returns
        -------
        Dict[str, Any]
            Complete serializable inference results.
        """
        # 1. Validate inputs
        self.validate_input(customer_data)

        # 2. Extract 12 clustering features into a 1-row DataFrame
        clustering_dict = {feat: [customer_data[feat]] for feat in RAW_CLUSTERING_FEATURES}
        df_clustering = pd.DataFrame(clustering_dict)

        # 3. Transform via preprocessor
        X_trans = self.preprocessor.transform(df_clustering)
        if X_trans.shape != (1, EXPECTED_TRANSFORMED_FEATURE_COUNT):
            raise RuntimeError(
                f"Expected transformed shape (1, {EXPECTED_TRANSFORMED_FEATURE_COUNT}), got: {X_trans.shape}"
            )

        # 4. Pure NumPy FCM membership calculation
        memberships_arr = compute_fcm_memberships(X_trans, self.fcm_centers, m=self.fcm_m)

        # 5. Cluster assignment and profiling
        assigned_cluster = int(np.argmax(memberships_arr[0]) + 1)
        cluster_name = self.cluster_names[assigned_cluster]
        max_membership = float(compute_max_membership(memberships_arr[0]))
        membership_margin = float(compute_membership_margin(memberships_arr[0]))

        # 6. Ambiguity calculation
        segment_ambiguity_score = float(compute_segment_ambiguity_score(memberships_arr[0]))
        ambiguity_level = str(assign_ambiguity_level(segment_ambiguity_score, self.high_ambiguity_threshold))

        # 7. Retention components
        clv_val = float(customer_data["customer_lifetime_value_usd"])
        churn_val = float(customer_data["churn_risk_score"])

        clv_component = float(calculate_clv_component(clv_val, self.clv_reference))
        churn_component = float(churn_val / 100.0)
        ambiguity_component = segment_ambiguity_score

        # 8. Retention score calculation
        retention_priority_score = float(
            100.0
            * (
                self.clv_weight * clv_component
                + self.churn_weight * churn_component
                + self.ambiguity_weight * ambiguity_component
            )
        )

        # 9. Priority category assignment
        if retention_priority_score >= self.high_threshold:
            retention_priority = "High"
        elif retention_priority_score >= self.medium_threshold:
            retention_priority = "Medium"
        else:
            retention_priority = "Low"

        # 10. Business recommendation
        recommendation = self._generate_recommendation(
            retention_priority=retention_priority,
            cluster_name=cluster_name,
            ambiguity_level=ambiguity_level,
        )

        # Assemble result
        result: Dict[str, Any] = {
            "assigned_cluster": assigned_cluster,
            "cluster_name": cluster_name,
            "memberships": {
                "cluster_1": float(memberships_arr[0, 0]),
                "cluster_2": float(memberships_arr[0, 1]),
                "cluster_3": float(memberships_arr[0, 2]),
                "cluster_4": float(memberships_arr[0, 3]),
            },
            "max_membership": max_membership,
            "membership_margin": membership_margin,
            "segment_ambiguity_score": segment_ambiguity_score,
            "ambiguity_level": ambiguity_level,
            "customer_lifetime_value_usd": clv_val,
            "churn_risk_score": churn_val,
            "clv_component": clv_component,
            "churn_component": churn_component,
            "ambiguity_component": ambiguity_component,
            "retention_priority_score": retention_priority_score,
            "retention_priority": retention_priority,
            "recommendation": recommendation,
        }

        # Preserve customer_id if provided
        if "customer_id" in customer_data and customer_data["customer_id"] is not None:
            result["customer_id"] = str(customer_data["customer_id"])

        return result

    def predict_batch(self, customers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Execute prediction on a batch list of customer dictionaries.
        """
        return [self.predict(cust) for cust in customers]
