/**
 * Demo-only sample customers for the "Load sample customer" quick-fill
 * buttons. These only ever populate the form's local state — they are
 * never sent anywhere until the user reviews and submits the form, and
 * every value here satisfies validateCustomerInput()'s ranges/enums in
 * validation.js exactly (no backend/API contract involved).
 */

export const SAMPLE_CUSTOMERS = [
  {
    key: 'high-value',
    label: 'High-Value Active Shopper',
    values: {
      customer_id: 'CUST-DEMO-001',
      tenure_months: '36',
      total_purchases: '58',
      avg_order_value_usd: '145.50',
      days_since_last_purchase: '5',
      return_count: '1',
      complaint_count: '0',
      satisfaction_score: '5',
      email_open_rate: '0.42',
      click_through_rate: '0.18',
      conversion_rate: '0.12',
      shopping_channel: 'Online',
      device_used: 'Desktop',
      customer_lifetime_value_usd: '68000',
      churn_risk_score: '12',
    },
  },
  {
    key: 'at-risk',
    label: 'At-Risk Inactive Customer',
    values: {
      customer_id: 'CUST-DEMO-002',
      tenure_months: '8',
      total_purchases: '2',
      avg_order_value_usd: '35.00',
      days_since_last_purchase: '210',
      return_count: '2',
      complaint_count: '3',
      satisfaction_score: '2',
      email_open_rate: '0.03',
      click_through_rate: '0.01',
      conversion_rate: '0.00',
      shopping_channel: 'In-Store',
      device_used: 'Mobile',
      customer_lifetime_value_usd: '4200',
      churn_risk_score: '82',
    },
  },
  {
    key: 'selective',
    label: 'Selective High-Converting Shopper',
    values: {
      customer_id: 'CUST-DEMO-003',
      tenure_months: '20',
      total_purchases: '11',
      avg_order_value_usd: '85.75',
      days_since_last_purchase: '25',
      return_count: '0',
      complaint_count: '0',
      satisfaction_score: '4',
      email_open_rate: '0.55',
      click_through_rate: '0.30',
      conversion_rate: '0.22',
      shopping_channel: 'Mobile App',
      device_used: 'Tablet',
      customer_lifetime_value_usd: '22000',
      churn_risk_score: '35',
    },
  },
];
