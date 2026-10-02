/**
 * Central API Service Layer
 * Interfaces with the FastAPI backend for health checks, cluster definitions,
 * and future customer prediction endpoints.
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) ||
  'http://127.0.0.1:8000';

/**
 * Standardized HTTP request wrapper with robust error detection and parsing.
 * Does not expose raw stack traces to the UI.
 *
 * @param {string} endpoint - API endpoint path (e.g. '/api/health')
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<any>} Parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Accept': 'application/json',
  };

  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    // Network failure (backend offline, CORS blocked, DNS/connection refused)
    const err = new Error(
      `Unable to connect to backend server at ${API_BASE_URL}. Please ensure the FastAPI server is running.`
    );
    err.isNetworkError = true;
    err.originalError = networkError;
    throw err;
  }

  // Parse response body if present
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  // Handle non-2xx responses
  if (!response.ok) {
    const errorDetail = data && data.detail ? data.detail : response.statusText;
    const err = new Error(
      typeof errorDetail === 'string'
        ? errorDetail
        : `Request failed with status ${response.status} (${response.statusText})`
    );
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * Check backend and model readiness.
 * Calls GET /api/health.
 *
 * @returns {Promise<{status: string, model_loaded: boolean, algorithm: string, n_clusters: number}>}
 */
export async function getHealth() {
  return await apiRequest('/api/health');
}

/**
 * Retrieve discovered customer segment definitions and profile metadata.
 * Calls GET /api/clusters.
 *
 * @returns {Promise<{algorithm: string, n_clusters: number, clusters: Array<{cluster_id: number, cluster_name: string, description: string}>}>}
 */
export async function getClusters() {
  return await apiRequest('/api/clusters');
}

/**
 * Perform single-customer inference.
 * Calls POST /api/predict with the validated CustomerInput payload.
 *
 * @param {Object} customerData - Formatted CustomerInput payload
 * @returns {Promise<Object>} Comprehensive PredictionResponse
 */
export async function predictCustomer(customerData) {
  return await apiRequest('/api/predict', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
}

export default {
  getHealth,
  getClusters,
  predictCustomer,
};
