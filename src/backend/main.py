"""
Main FastAPI Application Entry Point.
Configures lifespan events, CORS middleware, metadata, and routing.
"""

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.backend.pipeline import CustomerSegmentationPipeline
from src.backend.routes import clusters_router, health_router, predict_router
from src.backend.schemas import RootResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("backend.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager.
    Pre-loads the CustomerSegmentationPipeline once at server startup.
    Fails startup clearly if any deployment artifact is corrupt or missing.
    """
    logger.info("Initializing CustomerSegmentationPipeline and preloading artifacts...")
    try:
        pipeline = CustomerSegmentationPipeline()
        app.state.pipeline = pipeline
        logger.info(
            f"Pipeline initialized successfully with {len(pipeline.cluster_names)} clusters "
            f"and {len(pipeline.clv_reference)} development CLV reference records."
        )
    except Exception as exc:
        logger.critical(f"FATAL: Failed to initialize CustomerSegmentationPipeline at startup: {exc}", exc_info=True)
        raise RuntimeError(f"Pipeline initialization failure: {exc}") from exc

    yield

    logger.info("Shutting down CustomerSegmentationPipeline application.")


# Instantiate FastAPI application
app = FastAPI(
    title="Soft E-commerce Customer Segmentation API",
    description=(
        "Backend API for Fuzzy C-Means customer segmentation, "
        "segment ambiguity analysis, and retention prioritization."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration - explicit local frontend origins only
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Register route endpoints
app.include_router(health_router)
app.include_router(clusters_router)
app.include_router(predict_router)


@app.get(
    "/",
    response_model=RootResponse,
    tags=["Root"],
    summary="Root API Information",
)
async def root() -> RootResponse:
    return RootResponse(
        name="Soft E-commerce Customer Segmentation API",
        status="running",
        docs="/docs",
    )
