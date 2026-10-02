"""
Information-theoretic uncertainty and ambiguity utilities for soft customer segmentation.
Computes maximum membership, margin, and normalized Shannon entropy.
"""

from typing import Union
import numpy as np


def compute_max_membership(memberships: np.ndarray) -> Union[float, np.ndarray]:
    """
    Compute the maximum cluster membership degree for each observation.

    Parameters
    ----------
    memberships : np.ndarray
        Membership array of shape (n_clusters,) or (n_samples, n_clusters).

    Returns
    -------
    float or np.ndarray
        Maximum membership value(s). Returns float if input was 1D.
    """
    m = np.asarray(memberships, dtype=np.float64)
    if not np.all(np.isfinite(m)):
        raise ValueError("Memberships array contains NaN or infinite values.")

    is_1d = m.ndim == 1
    m_2d = np.atleast_2d(m)

    max_vals = np.max(m_2d, axis=1)
    return float(max_vals[0]) if is_1d else max_vals


def compute_membership_margin(memberships: np.ndarray) -> Union[float, np.ndarray]:
    """
    Compute the difference between the highest and second-highest memberships.
    High margin indicates certainty; low margin indicates boundary uncertainty.

    Parameters
    ----------
    memberships : np.ndarray
        Membership array of shape (n_clusters,) or (n_samples, n_clusters).
        Must have at least 2 clusters.

    Returns
    -------
    float or np.ndarray
        Difference between top 1st and top 2nd membership degrees.
    """
    m = np.asarray(memberships, dtype=np.float64)
    if not np.all(np.isfinite(m)):
        raise ValueError("Memberships array contains NaN or infinite values.")

    is_1d = m.ndim == 1
    m_2d = np.atleast_2d(m)

    if m_2d.shape[1] < 2:
        raise ValueError("Cannot compute membership margin with fewer than 2 clusters.")

    sorted_m = np.sort(m_2d, axis=1)
    margins = sorted_m[:, -1] - sorted_m[:, -2]

    return float(margins[0]) if is_1d else margins


def compute_normalized_entropy(memberships: np.ndarray) -> Union[float, np.ndarray]:
    """
    Calculate normalized Shannon entropy across cluster memberships.

    Formula:
        H_norm = - sum(u_safe * ln(u_safe)) / ln(K)
    where u_safe = clip(u, 1e-12, 1.0) and K = n_clusters.

    Ranges from 0.0 (complete certainty) to 1.0 (equal membership across all clusters).

    Parameters
    ----------
    memberships : np.ndarray
        Membership array of shape (n_clusters,) or (n_samples, n_clusters).

    Returns
    -------
    float or np.ndarray
        Normalized Shannon entropy value(s) in [0.0, 1.0].
    """
    m = np.asarray(memberships, dtype=np.float64)
    if not np.all(np.isfinite(m)):
        raise ValueError("Memberships array contains NaN or infinite values.")

    is_1d = m.ndim == 1
    m_2d = np.atleast_2d(m)

    n_clusters = m_2d.shape[1]
    if n_clusters <= 1:
        return 0.0 if is_1d else np.zeros(m_2d.shape[0], dtype=np.float64)

    safe_m = np.clip(m_2d, 1e-12, 1.0)
    entropy = -np.sum(safe_m * np.log(safe_m), axis=1) / np.log(float(n_clusters))

    # Clamp numerical precision artifacts to [0.0, 1.0]
    entropy = np.clip(entropy, 0.0, 1.0)

    return float(entropy[0]) if is_1d else entropy


def compute_segment_ambiguity_score(memberships: np.ndarray) -> Union[float, np.ndarray]:
    """
    Compute Segment Ambiguity Score (defined as normalized Shannon entropy).

    Parameters
    ----------
    memberships : np.ndarray
        Membership array of shape (n_clusters,) or (n_samples, n_clusters).

    Returns
    -------
    float or np.ndarray
        Segment Ambiguity Score in [0.0, 1.0].
    """
    return compute_normalized_entropy(memberships)


def assign_ambiguity_level(
    ambiguity_scores: Union[float, int, np.ndarray],
    threshold: float,
) -> Union[str, np.ndarray]:
    """
    Assign categorical ambiguity level ('High' vs 'Normal') based on a supplied threshold.
    Does NOT hard-code threshold values; threshold must be passed from configuration.

    Parameters
    ----------
    ambiguity_scores : float or np.ndarray
        Segment ambiguity score(s).
    threshold : float
        Numerical cutoff above or equal to which a customer is flagged as 'High' ambiguity.

    Returns
    -------
    str or np.ndarray of str
        'High' if ambiguity_score >= threshold, else 'Normal'.
    """
    if not isinstance(threshold, (int, float)) or not np.isfinite(threshold):
        raise ValueError(f"Ambiguity threshold must be a finite float, got: {threshold}")

    if isinstance(ambiguity_scores, (int, float, np.number)):
        return "High" if float(ambiguity_scores) >= threshold else "Normal"

    scores = np.asarray(ambiguity_scores, dtype=np.float64)
    return np.where(scores >= threshold, "High", "Normal")
