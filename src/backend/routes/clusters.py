"""
Cluster definitions and business profile metadata endpoint.
"""

from fastapi import APIRouter, Request, HTTPException, status
from src.backend.schemas import ClusterProfile, ClustersResponse

router = APIRouter(prefix="/api", tags=["Clusters"])

CLUSTER_DESCRIPTIONS = {
    1: "Very long inactivity, elevated churn risk, and low engagement across channels.",
    2: "Lower purchase volume but comparatively high conversion rate and engaged response.",
    3: "High purchase volume, high customer lifetime value (CLV), and recent active shopping.",
    4: "Lower purchase volume and comparatively low conversion and channel engagement.",
}


@router.get(
    "/clusters",
    response_model=ClustersResponse,
    summary="Get Customer Segment Definitions",
    description="Returns the 4 interpretable customer segments and profiles discovered by the Fuzzy C-Means model.",
)
async def get_clusters(request: Request) -> ClustersResponse:
    pipeline = getattr(request.app.state, "pipeline", None)

    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Inference pipeline is not initialized.",
        )

    cluster_profiles = [
        ClusterProfile(
            cluster_id=cluster_id,
            cluster_name=name,
            description=CLUSTER_DESCRIPTIONS.get(cluster_id, "FCM behavioral customer segment"),
        )
        for cluster_id, name in pipeline.cluster_names.items()
    ]

    return ClustersResponse(
        algorithm="Fuzzy C-Means",
        n_clusters=len(cluster_profiles),
        clusters=cluster_profiles,
    )
