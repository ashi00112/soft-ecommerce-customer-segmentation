"""
Configuration and artifact path management for backend inference.
Resolves paths dynamically relative to the repository root.
"""

from pathlib import Path

# Resolve repository root: src/backend/config.py -> parents[2] is the repo root
REPO_ROOT = Path(__file__).resolve().parents[2]

# Standard project directories
MODELS_DIR = REPO_ROOT / "models"
RESULTS_DIR = REPO_ROOT / "results"
DATA_DIR = REPO_ROOT / "data"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

# Deployment artifact paths
PREPROCESSOR_PATH = MODELS_DIR / "modelling_preprocessor.pkl"
FCM_MODEL_PATH = MODELS_DIR / "final_fcm_model.pkl"
CLV_REFERENCE_PATH = MODELS_DIR / "development_clv_reference.npy"
DEPLOYMENT_METADATA_PATH = MODELS_DIR / "deployment_metadata.json"
RETENTION_CONFIG_PATH = RESULTS_DIR / "retention_prioritization_config.json"
CLUSTER_PROFILES_PATH = RESULTS_DIR / "fcm_cluster_profiles.csv"

# Input feature schema definition
RAW_CLUSTERING_FEATURES = [
    "tenure_months",
    "total_purchases",
    "avg_order_value_usd",
    "days_since_last_purchase",
    "return_count",
    "complaint_count",
    "satisfaction_score",
    "email_open_rate",
    "click_through_rate",
    "conversion_rate",
    "shopping_channel",
    "device_used",
]

BUSINESS_FEATURES = [
    "customer_lifetime_value_usd",
    "churn_risk_score",
]

ALL_REQUIRED_INPUT_FIELDS = RAW_CLUSTERING_FEATURES + BUSINESS_FEATURES
EXPECTED_TRANSFORMED_FEATURE_COUNT = 18

VALID_SHOPPING_CHANNELS = ["In-Store", "Marketplace", "Mobile App", "Online"]
VALID_DEVICES = ["Desktop", "Mobile", "Multiple", "Tablet"]
