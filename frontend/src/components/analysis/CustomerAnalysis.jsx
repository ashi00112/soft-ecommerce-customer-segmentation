import React, { useState } from 'react';
import { UserCheck, CheckCircle2, Sliders, TrendingUp, AlertCircle } from 'lucide-react';
import CustomerForm from './CustomerForm';
import ResultsDashboard from '../results/ResultsDashboard';
import LoadingSpinner from '../common/LoadingSpinner';
import AlertMessage from '../common/AlertMessage';
import { validateCustomerInput } from './validation';
import { predictCustomer } from '../../services/api';

const INITIAL_FORM_STATE = {
  customer_id: '',
  tenure_months: '',
  total_purchases: '',
  avg_order_value_usd: '',
  days_since_last_purchase: '',
  return_count: '',
  complaint_count: '',
  satisfaction_score: '',
  email_open_rate: '',
  click_through_rate: '',
  conversion_rate: '',
  shopping_channel: '',
  device_used: '',
  customer_lifetime_value_usd: '',
  churn_risk_score: '',
};

/**
 * CustomerAnalysis component:
 * Top-level container for single-customer input, client-side validation,
 * backend prediction orchestration (POST /api/predict), and live results dashboard.
 */
export default function CustomerAnalysis() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [validatedPayload, setValidatedPayload] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-level error as user edits
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    // Reset previous prediction status if values change
    if (validationSuccess || predictionResult) {
      setValidationSuccess(false);
      setValidatedPayload(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = validateCustomerInput(formData);

    if (!result.isValid) {
      setErrors(result.errors);
      setValidationSuccess(false);
      setValidatedPayload(null);

      // Scroll to the first error element if present
      const firstErrorField = Object.keys(result.errors)[0];
      if (firstErrorField) {
        const el = document.getElementById(firstErrorField);
        if (el) {
          el.focus();
        }
      }
      return;
    }

    // Form is completely valid -> execute inference
    setErrors({});
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await predictCustomer(result.payload);
      setPredictionResult(response);
      setValidationSuccess(true);
      setValidatedPayload(result.payload);

      // Smooth scroll down to results section
      setTimeout(() => {
        const resultsEl = document.getElementById('results-dashboard');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err) {
      setApiError(err.message || 'Failed to generate prediction from backend API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setValidationSuccess(false);
    setValidatedPayload(null);
    setPredictionResult(null);
    setApiError(null);
  };

  const handleModify = () => {
    const topEl = document.getElementById('customer-form-top');
    if (topEl) {
      topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="analysis-container">
      {/* Header Banner */}
      <section id="customer-form-top" className="hero-box">
        <div className="hero-tag">
          <UserCheck className="hero-tag-icon" aria-hidden="true" />
          <span>Customer Analysis</span>
        </div>
        <h2 className="hero-title">Customer Segmentation &amp; Retention Analysis</h2>
        <p className="hero-description">
          Enter a customer's behavioural and engagement data below. The system will assign the
          customer to one or more soft segments using Fuzzy C-Means, measure how clearly they
          belong to a single archetype, and combine that with their lifetime value and churn
          risk to recommend a retention action.
        </p>

        {/* Simple Workflow Diagram */}
        <div className="analysis-workflow">
          <div className="workflow-step">
            <Sliders className="workflow-icon" aria-hidden="true" />
            <span>Enter Customer Data</span>
          </div>
          <div className="workflow-arrow" aria-hidden="true">→</div>
          <div className="workflow-step">
            <CheckCircle2 className="workflow-icon" aria-hidden="true" />
            <span>Soft Segment Assignment</span>
          </div>
          <div className="workflow-arrow" aria-hidden="true">→</div>
          <div className="workflow-step">
            <TrendingUp className="workflow-icon" aria-hidden="true" />
            <span>Retention Priority</span>
          </div>
          <div className="workflow-arrow" aria-hidden="true">→</div>
          <div className="workflow-step">
            <TrendingUp className="workflow-icon workflow-icon-action" aria-hidden="true" />
            <span>Recommended Action</span>
          </div>
        </div>

        {/* Feature Role Note */}
        <div className="feature-role-banner">
          <div className="role-pill">
            <Sliders className="role-icon" aria-hidden="true" />
            <span>
              <strong>12 Clustering Attributes:</strong> Behavioural, experience, engagement, and channel metrics are processed by Fuzzy C-Means to assign segment membership.
            </span>
          </div>
          <div className="role-pill">
            <TrendingUp className="role-icon" aria-hidden="true" />
            <span>
              <strong>2 Retention Metrics:</strong> Customer Lifetime Value and Churn Risk Score are entered separately and used <em>only</em> for retention prioritization — not for cluster assignment.
            </span>
          </div>
        </div>
      </section>

      {/* API Error Alert */}
      {apiError && (
        <AlertMessage
          type="error"
          title="Inference Request Failed"
          message={apiError}
          onRetry={handleSubmit}
          retryLabel="Retry Prediction"
        />
      )}

      {/* Form Level Client-Side Error Alert */}
      {Object.keys(errors).length > 0 && (
        <div className="alert-box alert-error" role="alert">
          <div className="alert-content">
            <div className="alert-icon-wrapper">
              <AlertCircle className="alert-icon text-error" aria-hidden="true" />
            </div>
            <div className="alert-text">
              <h4 className="alert-title">Validation Errors Found</h4>
              <p className="alert-description">
                Please correct the {Object.keys(errors).length} highlighted field(s) below before proceeding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Input Form */}
      <CustomerForm
        formData={formData}
        errors={errors}
        onChange={handleFieldChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        isSubmitting={isLoading}
      />

      {/* Loading Spinner during API inference */}
      {isLoading && (
        <div className="inference-loading-overlay card">
          <LoadingSpinner
            message="Executing Fuzzy C-Means inference &amp; retention prioritization pipeline..."
            size="lg"
          />
        </div>
      )}

      {/* Prediction Results Dashboard */}
      {predictionResult && !isLoading && (
        <ResultsDashboard
          result={predictionResult}
          onModify={handleModify}
        />
      )}
    </div>
  );
}
