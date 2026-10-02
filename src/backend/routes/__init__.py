"""
API route endpoints package.
"""

from .health import router as health_router
from .clusters import router as clusters_router
from .predict import router as predict_router

__all__ = ["health_router", "clusters_router", "predict_router"]
