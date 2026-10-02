"""
Customer segmentation and retention prioritization prediction endpoints.
"""

import logging
from fastapi import APIRouter, HTTPException, Request, status
from src.backend.schemas import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    CustomerInput,
    PredictionResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Predictions"])


@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Single Customer Segment & Retention Priority",
    description="Transforms 12 customer behavioral attributes, calculates 4 soft FCM cluster memberships, evaluates Segment Ambiguity (entropy), and generates composite Retention Priority with business recommendations.",
)
async def predict_single(customer: CustomerInput, request: Request) -> PredictionResponse:
    pipeline = getattr(request.app.state, "pipeline", None)

    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Inference pipeline is not initialized.",
        )

    try:
        # Convert Pydantic model to dictionary
        payload = customer.model_dump()
        result_dict = pipeline.predict(payload)
        return PredictionResponse(**result_dict)
    except ValueError as val_err:
        logger.warning(f"Validation error in /api/predict: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as exc:
        logger.error(f"Inference error in /api/predict: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during inference processing.",
        )


@router.post(
    "/predict/batch",
    response_model=BatchPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Batch Predict Customer Segments & Retention Priority",
    description="Performs vectorized inference on a list of customer records (up to 1,000 customers per request).",
)
async def predict_batch(batch_req: BatchPredictionRequest, request: Request) -> BatchPredictionResponse:
    pipeline = getattr(request.app.state, "pipeline", None)

    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Inference pipeline is not initialized.",
        )

    try:
        payloads = [c.model_dump() for c in batch_req.customers]
        results_list = pipeline.predict_batch(payloads)
        predictions = [PredictionResponse(**r) for r in results_list]

        return BatchPredictionResponse(
            count=len(predictions),
            predictions=predictions,
        )
    except ValueError as val_err:
        logger.warning(f"Validation error in /api/predict/batch: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as exc:
        logger.error(f"Inference error in /api/predict/batch: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during batch inference processing.",
        )
