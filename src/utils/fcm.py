"""
Pure NumPy implementation of Fuzzy C-Means (FCM) membership calculation for inference.
Evaluates the closed-form FCM membership formula using pre-fitted fixed cluster centroids.
Does NOT depend on scikit-fuzzy or any external C-extensions.
"""

import numpy as np


def compute_fcm_memberships(
    X: np.ndarray,
    centers: np.ndarray,
    m: float = 1.10,
) -> np.ndarray:
    """
    Calculate soft FCM cluster memberships for new observations using fixed centroids.

    Parameters
    ----------
    X : np.ndarray
        Feature matrix of shape (n_samples, n_features).
    centers : np.ndarray
        Fitted cluster centroids of shape (n_clusters, n_features).
    m : float, default=1.10
        Fuzziness exponent. Must be strictly greater than 1.0.

    Returns
    -------
    memberships : np.ndarray
        Fuzzy membership matrix of shape (n_samples, n_clusters), where each row
        sums to 1.0 and all values lie in [0, 1].

    Raises
    -------
    ValueError
        If inputs have invalid shapes, non-finite values, or m <= 1.0.
    """
    # 1. Type and finiteness validation
    if not isinstance(X, np.ndarray):
        X = np.asarray(X, dtype=np.float64)
    if not isinstance(centers, np.ndarray):
        centers = np.asarray(centers, dtype=np.float64)

    if X.ndim != 2:
        raise ValueError(f"Expected X to be a 2D array of shape (n_samples, n_features), got shape {X.shape}")
    if centers.ndim != 2:
        raise ValueError(f"Expected centers to be a 2D array of shape (n_clusters, n_features), got shape {centers.shape}")

    if X.shape[1] != centers.shape[1]:
        raise ValueError(
            f"Feature count mismatch: X has {X.shape[1]} features, but centers have {centers.shape[1]} features."
        )

    if centers.shape[0] < 1:
        raise ValueError("Centroids array must contain at least 1 cluster center.")

    if not isinstance(m, (int, float)) or not np.isfinite(m) or m <= 1.0:
        raise ValueError(f"Fuzziness parameter m must be a finite float strictly greater than 1.0, got: {m}")

    if not np.all(np.isfinite(X)):
        raise ValueError("Input feature matrix X contains NaN or infinite values.")

    if not np.all(np.isfinite(centers)):
        raise ValueError("Cluster centers contain NaN or infinite values.")

    n_samples, n_features = X.shape
    n_clusters = centers.shape[0]

    if n_samples == 0:
        return np.empty((0, n_clusters), dtype=np.float64)

    # 2. Pairwise Euclidean distances: shape (n_samples, n_clusters)
    # d_ij = ||x_i - c_j||_2
    distances = np.linalg.norm(X[:, np.newaxis, :] - centers[np.newaxis, :, :], axis=2)

    # 3. Check for exact zero-distance occurrences (point coinciding with a centroid)
    zero_mask = distances == 0.0
    has_zero = np.any(zero_mask, axis=1)

    # 4. Standard FCM closed-form formula:
    # u_ij = 1 / sum_{k=1}^c ( (d_ij / d_ik) ** (2 / (m - 1)) )
    power = 2.0 / (m - 1.0)

    # Replace zero distances with a dummy positive distance for safe power computation
    d_safe = np.where(zero_mask, 1.0, distances)

    inv_u = np.zeros_like(distances, dtype=np.float64)
    for k in range(n_clusters):
        inv_u[:, k] = np.sum((d_safe[:, k:k + 1] / d_safe) ** power, axis=1)

    memberships = 1.0 / inv_u

    # 5. Handle exact zero-distance cases explicitly:
    # If point coincides with centroid k, membership is 1.0 for k and 0.0 for others.
    if np.any(has_zero):
        for row_idx in np.where(has_zero)[0]:
            matching_clusters = zero_mask[row_idx]
            num_matches = np.sum(matching_clusters)
            memberships[row_idx, :] = 0.0
            memberships[row_idx, matching_clusters] = 1.0 / num_matches

    # 6. Final safety normalization: ensure rows sum strictly to 1.0
    row_sums = memberships.sum(axis=1, keepdims=True)
    memberships = memberships / row_sums

    return memberships
