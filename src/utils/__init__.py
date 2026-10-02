"""
Mathematical and data utilities for FCM inference, entropy calculation, and reference distributions.
"""

from .fcm import compute_fcm_memberships
from .entropy import (
    compute_max_membership,
    compute_membership_margin,
    compute_normalized_entropy,
    compute_segment_ambiguity_score,
    assign_ambiguity_level,
)
from .reference_data import load_clv_reference, calculate_clv_component

__all__ = [
    "compute_fcm_memberships",
    "compute_max_membership",
    "compute_membership_margin",
    "compute_normalized_entropy",
    "compute_segment_ambiguity_score",
    "assign_ambiguity_level",
    "load_clv_reference",
    "calculate_clv_component",
]
