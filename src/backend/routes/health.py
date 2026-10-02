"""
Health check route endpoint.
"""

from fastapi import APIRouter, Request, HTTPException, status
from src.backend.schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["System"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="System and Model Health Status",
    description="Returns pipeline readiness, loaded clustering algorithm, and cluster count without leaking internal filesystem paths.",
)
async def get_health(request: Request) -> HealthResponse:
    pipeline = getattr(request.app.state, "pipeline", None)

    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Inference pipeline is not initialized.",
        )

    return HealthResponse(
        status="healthy",
        model_loaded=True,
        algorithm=pipeline.config.get("final_clustering_model", {}).get("algorithm", "Fuzzy C-Means"),
        n_clusters=len(pipeline.cluster_names),
    )
