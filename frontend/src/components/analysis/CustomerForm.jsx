import React from 'react';
import {
  User,
  ShoppingBag,
  HeartHandshake,
  MousePointerClick,
  Monitor,
  TrendingUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import FormFieldGroup from './FormFieldGroup';
import { VALID_CHANNELS, VALID_DEVICES } from './validation';

/**
 * CustomerForm component rendering the 15 input fields grouped into logical sections.
 *
 * @param {{
 *   formData: Record<string, string>,
 *   errors: Record<string, string>,
 *   onChange: (field: string, value: string) => void,
 *   onSubmit: (e: React.FormEvent) => void,
 *   onReset: () => void,
 *   isSubmitting?: boolean
 * }} props
 */
export default function CustomerForm({
  formData,
  errors,
  onChange,
  onSubmit,
  onReset,
  isSubmitting = false,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const channelOptions = [
    { value: '', label: 'Select Shopping Channel...' },
    ...VALID_CHANNELS.map((ch) => ({ value: ch, label: ch })),
  ];

  const deviceOptions = [
    { value: '', label: 'Select Primary Device...' },
    ...VALID_DEVICES.map((dev) => ({ value: dev, label: dev })),
  ];

  return (
    <form className="customer-form" onSubmit={onSubmit} noValidate>
      {/* Group I: Clustering Inputs (FCM Stage) */}
      <div className="form-group-cluster">
        <div className="form-group-banner fcm-banner">
          <span className="group-badge">FCM Inputs</span>
          <h3 className="group-title">Clustering Input Space (12 Attributes)</h3>
          <p className="group-desc">
            These behavioural, experience, engagement, and channel attributes are scaled and one-hot encoded into 18 continuous inputs for Fuzzy C-Means.
          </p>
        </div>

        {/* Section A: Customer Identification */}
        <div className="form-section card">
          <div className="section-title-wrap">
            <User className="section-icon" aria-hidden="true" />
            <h4 className="form-section-title">A. Customer Identification</h4>
          </div>
          <div className="form-grid-single">
            <FormFieldGroup
              id="customer_id"
              name="customer_id"
              label="Customer ID"
              type="text"
              value={formData.customer_id || ''}
              onChange={handleChange}
              placeholder="e.g., CUST-001"
              helperText="Optional identifier. Not passed to the model clustering features."
              error={errors.customer_id}
              required={false}
            />
          </div>
        </div>

        {/* Section B: Customer Activity */}
        <div className="form-section form-section-activity card">
          <div className="section-title-wrap">
            <ShoppingBag className="section-icon" aria-hidden="true" />
            <h4 className="form-section-title">B. Customer Activity</h4>
          </div>
          <div className="form-grid-2">
            <FormFieldGroup
              id="tenure_months"
              name="tenure_months"
              label="Customer Tenure (Months)"
              type="number"
              step="1"
              min="0"
              value={formData.tenure_months || ''}
              onChange={handleChange}
              placeholder="e.g., 24"
              helperText="Relationship tenure in whole months (minimum 0)."
              error={errors.tenure_months}
              required
            />
            <FormFieldGroup
              id="total_purchases"
              name="total_purchases"
              label="Total Purchases"
              type="number"
              step="1"
              min="0"
              value={formData.total_purchases || ''}
              onChange={handleChange}
              placeholder="e.g., 15"
              helperText="Total purchase transaction count (minimum 0)."
              error={errors.total_purchases}
              required
            />
            <FormFieldGroup
              id="avg_order_value_usd"
              name="avg_order_value_usd"
              label="Average Order Value (USD)"
              type="number"
              step="0.01"
              min="0"
              value={formData.avg_order_value_usd || ''}
              onChange={handleChange}
              placeholder="e.g., 120.50"
              helperText="Mean order monetary value in USD (minimum 0.0)."
              error={errors.avg_order_value_usd}
              required
            />
            <FormFieldGroup
              id="days_since_last_purchase"
              name="days_since_last_purchase"
              label="Days Since Last Purchase"
              type="number"
              step="1"
              min="0"
              value={formData.days_since_last_purchase || ''}
              onChange={handleChange}
              placeholder="e.g., 10"
              helperText="Recency elapsed in days since latest order (minimum 0)."
              error={errors.days_since_last_purchase}
              required
            />
          </div>
        </div>

        {/* Section C: Customer Experience */}
        <div className="form-section form-section-experience card">
          <div className="section-title-wrap">
            <HeartHandshake className="section-icon" aria-hidden="true" />
            <h4 className="form-section-title">C. Customer Experience</h4>
          </div>
          <div className="form-grid-3">
            <FormFieldGroup
              id="return_count"
              name="return_count"
              label="Return Count"
              type="number"
              step="1"
              min="0"
              value={formData.return_count || ''}
              onChange={handleChange}
              placeholder="e.g., 1"
              helperText="Number of returned items (minimum 0)."
              error={errors.return_count}
              required
            />
            <FormFieldGroup
              id="complaint_count"
              name="complaint_count"
              label="Complaint Count"
              type="number"
              step="1"
              min="0"
              value={formData.complaint_count || ''}
              onChange={handleChange}
              placeholder="e.g., 0"
              helperText="Total customer complaints logged (minimum 0)."
              error={errors.complaint_count}
              required
            />
            <FormFieldGroup
              id="satisfaction_score"
              name="satisfaction_score"
              label="Satisfaction Score"
              type="number"
              step="1"
              min="1"
              max="5"
              value={formData.satisfaction_score || ''}
              onChange={handleChange}
              placeholder="e.g., 4"
              helperText="Customer rating on a scale of 1 to 5."
              error={errors.satisfaction_score}
              required
            />
          </div>
        </div>

        {/* Section D: Digital Engagement */}
        <div className="form-section form-section-engagement card">
          <div className="section-title-wrap">
            <MousePointerClick className="section-icon" aria-hidden="true" />
            <h4 className="form-section-title">D. Digital Engagement</h4>
          </div>
          <div className="form-grid-3">
            <FormFieldGroup
              id="email_open_rate"
              name="email_open_rate"
              label="Email Open Rate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.email_open_rate || ''}
              onChange={handleChange}
              placeholder="e.g., 0.25"
              helperText="Decimal format: 0.0 to 1.0 (e.g., 0.25 = 25%)."
              error={errors.email_open_rate}
              required
            />
            <FormFieldGroup
              id="click_through_rate"
              name="click_through_rate"
              label="Click-Through Rate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.click_through_rate || ''}
              onChange={handleChange}
              placeholder="e.g., 0.05"
              helperText="Decimal format: 0.0 to 1.0 (e.g., 0.05 = 5%)."
              error={errors.click_through_rate}
              required
            />
            <FormFieldGroup
              id="conversion_rate"
              name="conversion_rate"
              label="Conversion Rate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.conversion_rate || ''}
              onChange={handleChange}
              placeholder="e.g., 0.02"
              helperText="Decimal format: 0.0 to 1.0 (e.g., 0.02 = 2%)."
              error={errors.conversion_rate}
              required
            />
          </div>
        </div>

        {/* Section E: Shopping Behaviour */}
        <div className="form-section form-section-channel card">
          <div className="section-title-wrap">
            <Monitor className="section-icon" aria-hidden="true" />
            <h4 className="form-section-title">E. Shopping Behaviour</h4>
          </div>
          <div className="form-grid-2">
            <FormFieldGroup
              id="shopping_channel"
              name="shopping_channel"
              label="Shopping Channel"
              type="select"
              value={formData.shopping_channel || ''}
              onChange={handleChange}
              options={channelOptions}
              helperText="Primary channel used for purchases."
              error={errors.shopping_channel}
              required
            />
            <FormFieldGroup
              id="device_used"
              name="device_used"
              label="Primary Device"
              type="select"
              value={formData.device_used || ''}
              onChange={handleChange}
              options={deviceOptions}
              helperText="Primary device for browsing and checkout."
              error={errors.device_used}
              required
            />
          </div>
        </div>
      </div>

      {/* Group II: Retention Information (Post-Clustering Signals) */}
      <div className="form-group-retention">
        <div className="form-group-banner retention-banner">
          <span className="group-badge retention-badge">Retention Signals</span>
          <h3 className="group-title">Post-Clustering Business Signals (2 Metrics)</h3>
          <p className="group-desc">
            Intentionally excluded from cluster formation. Integrated downstream with Fuzzy C-Means membership entropy to compute the 3-factor composite retention priority score.
          </p>
        </div>

        {/* Section F: Retention Information */}
        <div className="form-section form-section-retention card">
          <div className="section-title-wrap">
            <TrendingUp className="section-icon" aria-hidden="true" />
            <h4 className="form-section-title">F. Retention Information</h4>
          </div>
          <div className="form-grid-2">
            <FormFieldGroup
              id="customer_lifetime_value_usd"
              name="customer_lifetime_value_usd"
              label="Customer Lifetime Value (USD)"
              type="number"
              step="0.01"
              min="0"
              value={formData.customer_lifetime_value_usd || ''}
              onChange={handleChange}
              placeholder="e.g., 45000"
              helperText="Projected/actual CLV in USD. Scaled against development reference."
              error={errors.customer_lifetime_value_usd}
              required
            />
            <FormFieldGroup
              id="churn_risk_score"
              name="churn_risk_score"
              label="Churn Risk Score"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.churn_risk_score || ''}
              onChange={handleChange}
              placeholder="e.g., 25"
              helperText="Risk score on a 0 to 100 scale."
              error={errors.churn_risk_score}
              required
            />
          </div>
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="form-actions-bar">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          <Sparkles className="btn-icon-sm" aria-hidden="true" />
          <span>Analyze Customer</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          <RotateCcw className="btn-icon-sm" aria-hidden="true" />
          <span>Reset Form</span>
        </button>
      </div>
    </form>
  );
}
