/**
 * Validation rules and payload builder for Customer Analysis Form.
 * Corresponds strictly to the backend CustomerInput Pydantic schema.
 */

export const VALID_CHANNELS = ['In-Store', 'Marketplace', 'Mobile App', 'Online'];
export const VALID_DEVICES = ['Desktop', 'Mobile', 'Multiple', 'Tablet'];

/**
 * Validates raw form string values against the CustomerInput contract.
 *
 * @param {Record<string, string>} values - Raw input form values
 * @returns {{
 *   isValid: boolean,
 *   errors: Record<string, string>,
 *   payload: Record<string, any> | null
 * }}
 */
export function validateCustomerInput(values) {
  const errors = {};

  // Helper: check integer strictly (no decimal point allowed)
  const isStrictInteger = (val) => {
    if (typeof val !== 'string') return false;
    const trimmed = val.trim();
    return /^-?\d+$/.test(trimmed);
  };

  // Helper: check valid number
  const isNumber = (val) => {
    if (typeof val !== 'string') return false;
    const trimmed = val.trim();
    if (trimmed === '') return false;
    return !isNaN(Number(trimmed));
  };

  // Helper: check empty
  const isEmpty = (val) => {
    return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
  };

  // 1. customer_id (optional string)
  const customerId = values.customer_id ? values.customer_id.trim() : null;

  // 2. tenure_months (integer >= 0)
  if (isEmpty(values.tenure_months)) {
    errors.tenure_months = 'Customer Tenure is required.';
  } else if (!isStrictInteger(values.tenure_months)) {
    errors.tenure_months = 'Customer Tenure must be a whole number (integer).';
  } else if (parseInt(values.tenure_months.trim(), 10) < 0) {
    errors.tenure_months = 'Customer Tenure cannot be negative.';
  }

  // 3. total_purchases (integer >= 0)
  if (isEmpty(values.total_purchases)) {
    errors.total_purchases = 'Total Purchases is required.';
  } else if (!isStrictInteger(values.total_purchases)) {
    errors.total_purchases = 'Total Purchases must be a whole number (integer).';
  } else if (parseInt(values.total_purchases.trim(), 10) < 0) {
    errors.total_purchases = 'Total Purchases cannot be negative.';
  }

  // 4. avg_order_value_usd (numeric >= 0)
  if (isEmpty(values.avg_order_value_usd)) {
    errors.avg_order_value_usd = 'Average Order Value is required.';
  } else if (!isNumber(values.avg_order_value_usd)) {
    errors.avg_order_value_usd = 'Average Order Value must be a valid number.';
  } else if (parseFloat(values.avg_order_value_usd.trim()) < 0) {
    errors.avg_order_value_usd = 'Average Order Value cannot be negative.';
  }

  // 5. days_since_last_purchase (integer >= 0)
  if (isEmpty(values.days_since_last_purchase)) {
    errors.days_since_last_purchase = 'Days Since Last Purchase is required.';
  } else if (!isStrictInteger(values.days_since_last_purchase)) {
    errors.days_since_last_purchase = 'Days Since Last Purchase must be a whole number (integer).';
  } else if (parseInt(values.days_since_last_purchase.trim(), 10) < 0) {
    errors.days_since_last_purchase = 'Days Since Last Purchase cannot be negative.';
  }

  // 6. return_count (integer >= 0)
  if (isEmpty(values.return_count)) {
    errors.return_count = 'Return Count is required.';
  } else if (!isStrictInteger(values.return_count)) {
    errors.return_count = 'Return Count must be a whole number (integer).';
  } else if (parseInt(values.return_count.trim(), 10) < 0) {
    errors.return_count = 'Return Count cannot be negative.';
  }

  // 7. complaint_count (integer >= 0)
  if (isEmpty(values.complaint_count)) {
    errors.complaint_count = 'Complaint Count is required.';
  } else if (!isStrictInteger(values.complaint_count)) {
    errors.complaint_count = 'Complaint Count must be a whole number (integer).';
  } else if (parseInt(values.complaint_count.trim(), 10) < 0) {
    errors.complaint_count = 'Complaint Count cannot be negative.';
  }

  // 8. satisfaction_score (integer 1 - 5)
  if (isEmpty(values.satisfaction_score)) {
    errors.satisfaction_score = 'Satisfaction Score is required.';
  } else if (!isStrictInteger(values.satisfaction_score)) {
    errors.satisfaction_score = 'Satisfaction Score must be an integer between 1 and 5.';
  } else {
    const score = parseInt(values.satisfaction_score.trim(), 10);
    if (score < 1 || score > 5) {
      errors.satisfaction_score = 'Satisfaction Score must be between 1 and 5.';
    }
  }

  // 9. email_open_rate (numeric 0.0 - 1.0)
  if (isEmpty(values.email_open_rate)) {
    errors.email_open_rate = 'Email Open Rate is required.';
  } else if (!isNumber(values.email_open_rate)) {
    errors.email_open_rate = 'Email Open Rate must be a valid number.';
  } else {
    const rate = parseFloat(values.email_open_rate.trim());
    if (rate < 0.0 || rate > 1.0) {
      errors.email_open_rate = 'Email Open Rate must be between 0.0 and 1.0 (e.g., 0.25 for 25%).';
    }
  }

  // 10. click_through_rate (numeric 0.0 - 1.0)
  if (isEmpty(values.click_through_rate)) {
    errors.click_through_rate = 'Click-Through Rate is required.';
  } else if (!isNumber(values.click_through_rate)) {
    errors.click_through_rate = 'Click-Through Rate must be a valid number.';
  } else {
    const rate = parseFloat(values.click_through_rate.trim());
    if (rate < 0.0 || rate > 1.0) {
      errors.click_through_rate = 'Click-Through Rate must be between 0.0 and 1.0 (e.g., 0.05 for 5%).';
    }
  }

  // 11. conversion_rate (numeric 0.0 - 1.0)
  if (isEmpty(values.conversion_rate)) {
    errors.conversion_rate = 'Conversion Rate is required.';
  } else if (!isNumber(values.conversion_rate)) {
    errors.conversion_rate = 'Conversion Rate must be a valid number.';
  } else {
    const rate = parseFloat(values.conversion_rate.trim());
    if (rate < 0.0 || rate > 1.0) {
      errors.conversion_rate = 'Conversion Rate must be between 0.0 and 1.0 (e.g., 0.02 for 2%).';
    }
  }

  // 12. shopping_channel (enum string)
  if (isEmpty(values.shopping_channel)) {
    errors.shopping_channel = 'Please select a Shopping Channel.';
  } else if (!VALID_CHANNELS.includes(values.shopping_channel)) {
    errors.shopping_channel = `Shopping Channel must be one of: ${VALID_CHANNELS.join(', ')}.`;
  }

  // 13. device_used (enum string)
  if (isEmpty(values.device_used)) {
    errors.device_used = 'Please select a Primary Device.';
  } else if (!VALID_DEVICES.includes(values.device_used)) {
    errors.device_used = `Primary Device must be one of: ${VALID_DEVICES.join(', ')}.`;
  }

  // 14. customer_lifetime_value_usd (numeric >= 0)
  if (isEmpty(values.customer_lifetime_value_usd)) {
    errors.customer_lifetime_value_usd = 'Customer Lifetime Value (USD) is required.';
  } else if (!isNumber(values.customer_lifetime_value_usd)) {
    errors.customer_lifetime_value_usd = 'Customer Lifetime Value must be a valid number.';
  } else if (parseFloat(values.customer_lifetime_value_usd.trim()) < 0) {
    errors.customer_lifetime_value_usd = 'Customer Lifetime Value cannot be negative.';
  }

  // 15. churn_risk_score (numeric 0.0 - 100.0)
  if (isEmpty(values.churn_risk_score)) {
    errors.churn_risk_score = 'Churn Risk Score is required.';
  } else if (!isNumber(values.churn_risk_score)) {
    errors.churn_risk_score = 'Churn Risk Score must be a valid number.';
  } else {
    const score = parseFloat(values.churn_risk_score.trim());
    if (score < 0.0 || score > 100.0) {
      errors.churn_risk_score = 'Churn Risk Score must be between 0.0 and 100.0.';
    }
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    return {
      isValid: false,
      errors,
      payload: null,
    };
  }

  // Construct strictly-typed payload matching backend CustomerInput
  const payload = {
    customer_id: customerId || null,
    tenure_months: parseInt(values.tenure_months.trim(), 10),
    total_purchases: parseInt(values.total_purchases.trim(), 10),
    avg_order_value_usd: parseFloat(values.avg_order_value_usd.trim()),
    days_since_last_purchase: parseInt(values.days_since_last_purchase.trim(), 10),
    return_count: parseInt(values.return_count.trim(), 10),
    complaint_count: parseInt(values.complaint_count.trim(), 10),
    satisfaction_score: parseInt(values.satisfaction_score.trim(), 10),
    email_open_rate: parseFloat(values.email_open_rate.trim()),
    click_through_rate: parseFloat(values.click_through_rate.trim()),
    conversion_rate: parseFloat(values.conversion_rate.trim()),
    shopping_channel: values.shopping_channel,
    device_used: values.device_used,
    customer_lifetime_value_usd: parseFloat(values.customer_lifetime_value_usd.trim()),
    churn_risk_score: parseFloat(values.churn_risk_score.trim()),
  };

  return {
    isValid: true,
    errors: {},
    payload,
  };
}
