"""
Reference data utilities for empirical distribution calibration and percentile ranking.
"""

from pathlib import Path
from typing import Union
import numpy as np


def load_clv_reference(path: Union[str, Path]) -> np.ndarray:
    """
    Load and validate the development CLV reference distribution artifact.

    Parameters
    ----------
    path : str or Path
        Path to the serialized .npy reference array.

    Returns
    -------
    np.ndarray
        Validated 1D NumPy array sorted ascending.

    Raises
    -------
    FileNotFoundError
        If path does not exist.
    ValueError
        If the array is not 1D, is empty, non-finite, or not sorted ascending.
    """
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"CLV reference artifact not found at: {file_path}")

    reference = np.load(file_path)

    if not isinstance(reference, np.ndarray):
        reference = np.asarray(reference)

    if reference.ndim != 1:
        raise ValueError(f"CLV reference array must be 1-dimensional, got shape: {reference.shape}")

    if len(reference) == 0:
        raise ValueError("CLV reference array cannot be empty.")

    if not np.all(np.isfinite(reference)):
        raise ValueError("CLV reference array contains NaN or infinite values.")

    # Verify ascending sort order
    if not np.all(np.diff(reference) >= 0.0):
        raise ValueError("CLV reference array must be strictly sorted in ascending order.")

    return reference


def calculate_clv_component(
    customer_clv: Union[float, int, list, np.ndarray],
    sorted_reference: np.ndarray,
) -> Union[float, np.ndarray]:
    """
    Compute the CLV retention component using empirical percentile ranking against
    the development reference population via np.searchsorted(..., side="right").

    Parameters
    ----------
    customer_clv : float, int, list, or np.ndarray
        Customer lifetime value in USD.
    sorted_reference : np.ndarray
        Sorted 1D development CLV reference array.

    Returns
    -------
    float or np.ndarray
        CLV percentile component in [0.0, 1.0]. Returns float if input was scalar.

    Raises
    -------
    ValueError
        If customer_clv contains NaN/infinite values, or reference is invalid.
    """
    if sorted_reference.ndim != 1 or len(sorted_reference) == 0:
        raise ValueError("sorted_reference must be a non-empty 1D array.")

    is_scalar = isinstance(customer_clv, (int, float, np.number))

    clv_arr = np.asarray(customer_clv, dtype=np.float64)

    if not np.all(np.isfinite(clv_arr)):
        raise ValueError(f"Customer CLV must be a finite numerical value, got: {customer_clv}")

    # Percentile rank against reference population: np.searchsorted(ref, val, side='right') / len(ref)
    ranks = np.searchsorted(sorted_reference, clv_arr, side="right")
    clv_component = ranks / float(len(sorted_reference))

    # Clamp bounds to [0.0, 1.0]
    clv_component = np.clip(clv_component, 0.0, 1.0)

    return float(clv_component) if is_scalar else clv_component
