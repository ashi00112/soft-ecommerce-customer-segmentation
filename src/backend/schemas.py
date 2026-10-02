"""
Pydantic request and response schemas for Customer Segmentation & Retention Prioritization API.
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

from src.backend.config import VALID_DEVICES, VALID_SHOPPING_CHANNELS


class CustomerInput(BaseModel):
    """Input payload for a single customer observation."""

    customer_id: Optional[str] = Field(
        default=None,
        description="Optional customer identifier. Never passed into model clustering features.",
        examples=["CUST-000001"],
    )

    # 10 Numerical clustering features
    tenure_months: int = Field(..., ge=0, description="Customer relationship tenure in months", examples=[24])
    total_purchases: int = Field(..., ge=0, description="Total purchase transaction count", examples=[15])
    avg_order_value_usd: float = Field(..., ge=0.0, description="Average order value in USD", examples=[120.50])
    days_since_last_purchase: int = Field(..., ge=0, description="Days elapsed since last purchase", examples=[10])
    return_count: int = Field(..., ge=0, description="Total number of returned items", examples=[1])
    complaint_count: int = Field(..., ge=0, description="Total customer complaints logged", examples=[0])
    satisfaction_score: int = Field(
        ..., ge=1, le=5, description="Customer satisfaction rating between 1 and 5", examples=[4]
    )
    email_open_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Marketing email open rate in [0.0, 1.0]", examples=[0.25]
    )
    click_through_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Email click-through rate in [0.0, 1.0]", examples=[0.05]
    )
    conversion_rate: float = Field(
        ..., ge=0.0, le=1.0, description="Web/App browsing conversion rate in [0.0, 1.0]", examples=[0.02]
    )

    # 2 Categorical clustering features
    shopping_channel: str = Field(
        ...,
        description=f"Primary shopping channel. Must be one of: {', '.join(VALID_SHOPPING_CHANNELS)}",
        examples=["Online"],
    )
    device_used: str = Field(
        ...,
        description=f"Primary device used. Must be one of: {', '.join(VALID_DEVICES)}",
        examples=["Mobile"],
    )

    # 2 Business prioritization features
    customer_lifetime_value_usd: float = Field(
        ..., ge=0.0, description="Estimated customer lifetime value in USD", examples=[45000.0]
    )
    churn_risk_score: float = Field(
        ..., ge=0.0, le=100.0, description="Estimated churn risk probability on a 0-100 scale", examples=[25.0]
    )

    @field_validator("shopping_channel")
    @classmethod
    def validate_channel(cls, v: str) -> str:
        if v not in VALID_SHOPPING_CHANNELS:
            raise ValueError(f"Invalid shopping_channel '{v}'. Allowed values: {VALID_SHOPPING_CHANNELS}")
        return v

    @field_validator("device_used")
    @classmethod
    def validate_device(cls, v: str) -> str:
        if v not in VALID_DEVICES:
            raise ValueError(f"Invalid device_used '{v}'. Allowed values: {VALID_DEVICES}")
        return v


class ClusterMemberships(BaseModel):
    """FCM cluster membership probabilities summing to 1.0."""

    cluster_1: float = Field(..., description="Membership degree in Cluster 1")
    cluster_2: float = Field(..., description="Membership degree in Cluster 2")
    cluster_3: float = Field(..., description="Membership degree in Cluster 3")
    cluster_4: float = Field(..., description="Membership degree in Cluster 4")


class PredictionResponse(BaseModel):
    """Comprehensive prediction response for a single customer."""

    customer_id: Optional[str] = None
    assigned_cluster: int = Field(..., description="Assigned cluster index (1-indexed: 1, 2, 3, 4)")
    cluster_name: str = Field(..., description="Interpretable customer segment profile name")
    memberships: ClusterMemberships = Field(..., description="Fuzzy membership degrees across all 4 clusters")
    max_membership: float = Field(..., description="Strength of the dominant cluster membership")
    membership_margin: float = Field(..., description="Difference between highest and 2nd highest memberships")
    segment_ambiguity_score: float = Field(..., description="Normalized Shannon entropy in [0.0, 1.0]")
    ambiguity_level: str = Field(..., description="Categorical ambiguity: 'High' vs 'Normal'")
    customer_lifetime_value_usd: float = Field(..., description="Customer Lifetime Value in USD")
    churn_risk_score: float = Field(..., description="Churn risk score on 0-100 scale")
    clv_component: float = Field(..., description="CLV normalized percentile component in [0.0, 1.0]")
    churn_component: float = Field(..., description="Churn normalized component in [0.0, 1.0]")
    ambiguity_component: float = Field(..., description="Ambiguity normalized component in [0.0, 1.0]")
    retention_priority_score: float = Field(..., description="Composite retention priority score on 0-100 scale")
    retention_priority: str = Field(..., description="Retention priority tier: 'High', 'Medium', or 'Low'")
    recommendation: str = Field(..., description="Deterministic business retention action recommendation")


class BatchPredictionRequest(BaseModel):
    """Batch prediction request payload."""

    customers: List[CustomerInput] = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="List of customer records (min 1, max 1000)",
    )


class BatchPredictionResponse(BaseModel):
    """Batch prediction response payload."""

    count: int = Field(..., description="Number of customer records processed")
    predictions: List[PredictionResponse] = Field(..., description="Inference results for each record")


class ClusterProfile(BaseModel):
    """Cluster metadata and business profile."""

    cluster_id: int
    cluster_name: str
    description: str


class ClustersResponse(BaseModel):
    """Response containing all available customer segment definitions."""

    algorithm: str
    n_clusters: int
    clusters: List[ClusterProfile]


class HealthResponse(BaseModel):
    """System health check response."""

    status: str
    model_loaded: bool
    algorithm: str
    n_clusters: int


class RootResponse(BaseModel):
    """Root index API response."""

    name: str
    status: str
    docs: str
