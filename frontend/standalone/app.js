const API_BASE = 'http://127.0.0.1:8000';

const groups = [
  { title: 'Customer activity', fields: [
    ['customer_id', 'Customer ID', 'text', '', '', 'Optional'],
    ['tenure_months', 'Tenure (months)', 'number', '0', '1'],
    ['total_purchases', 'Total purchases', 'number', '0', '1'],
    ['avg_order_value_usd', 'Average order value (USD)', 'number', '0', '0.01'],
    ['days_since_last_purchase', 'Days since last purchase', 'number', '0', '1'],
    ['return_count', 'Return count', 'number', '0', '1'],
    ['complaint_count', 'Complaint count', 'number', '0', '1']
  ]},
  { title: 'Experience and engagement', fields: [
    ['satisfaction_score', 'Satisfaction score (1–5)', 'number', '1', '1', '', '5'],
    ['email_open_rate', 'Email open rate (0–1)', 'number', '0', '0.001', '', '1'],
    ['click_through_rate', 'Click through rate (0–1)', 'number', '0', '0.001', '', '1'],
    ['conversion_rate', 'Conversion rate (0–1)', 'number', '0', '0.001', '', '1'],
    ['shopping_channel', 'Shopping channel', 'select', '', '', '', '', ['In-Store', 'Marketplace', 'Mobile App', 'Online']],
    ['device_used', 'Primary device', 'select', '', '', '', '', ['Desktop', 'Mobile', 'Multiple', 'Tablet']]
  ]},
  { title: 'Retention signals', fields: [
    ['customer_lifetime_value_usd', 'Customer lifetime value (USD)', 'number', '0', '0.01'],
    ['churn_risk_score', 'Churn risk score (0–100)', 'number', '0', '0.1', '', '100']
  ]}
];

const sample = {
  customer_id: 'DEMO-001', tenure_months: 24, total_purchases: 15,
  avg_order_value_usd: 120.50, days_since_last_purchase: 10,
  return_count: 1, complaint_count: 0, satisfaction_score: 4,
  email_open_rate: 0.25, click_through_rate: 0.05, conversion_rate: 0.02,
  shopping_channel: 'Online', device_used: 'Mobile',
  customer_lifetime_value_usd: 45000, churn_risk_score: 25
};

const fields = document.getElementById('fields');
for (const group of groups) {
  const section = document.createElement('section');
  section.className = 'field-group';
  const title = document.createElement('h4');
  title.textContent = group.title;
  section.append(title);
  const grid = document.createElement('div');
  grid.className = 'fields-grid';
  for (const [id, label, type, min, step, hint, max, options] of group.fields) {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';
    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.textContent = label;
    const input = document.createElement(type === 'select' ? 'select' : 'input');
    input.id = id;
    input.name = id;
    input.required = id !== 'customer_id';
    if (type === 'select') {
      input.append(new Option('Select…', ''));
      for (const option of options) input.append(new Option(option, option));
    } else {
      input.type = type;
      if (min !== '') input.min = min;
      if (step !== '') input.step = step;
      if (max) input.max = max;
    }
    wrapper.append(labelEl, input);
    if (hint) {
      const small = document.createElement('small');
      small.textContent = hint;
      wrapper.append(small);
    }
    grid.append(wrapper);
  }
  section.append(grid);
  fields.append(section);
}

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json();
  if (!response.ok) {
    const detail = data.detail;
    throw new Error(typeof detail === 'string' ? detail : `API returned ${response.status}`);
  }
  return data;
}

async function loadOverview() {
  const status = document.getElementById('status');
  const clusters = document.getElementById('clusters');
  try {
    const [health, response] = await Promise.all([
      request('/api/health'), request('/api/clusters')
    ]);
    status.textContent = `${health.algorithm} · API online`;
    status.className = 'status online';
    clusters.replaceChildren();
    for (const cluster of response.clusters) {
      const card = document.createElement('article');
      card.className = 'cluster-card';
      const number = document.createElement('span');
      number.className = 'cluster-number';
      number.textContent = `SEGMENT ${String(cluster.cluster_id).padStart(2, '0')}`;
      const title = document.createElement('h3');
      title.textContent = cluster.cluster_name;
      const description = document.createElement('p');
      description.textContent = cluster.description;
      card.append(number, title, description);
      clusters.append(card);
    }
  } catch {
    status.textContent = 'API offline · start the backend';
    status.className = 'status offline';
    clusters.textContent = 'Start the FastAPI server on 127.0.0.1:8000 and refresh this page.';
  }
}

function addMetric(parent, label, value) {
  const row = document.createElement('div');
  row.className = 'metric-row';
  const left = document.createElement('span');
  left.textContent = label;
  const right = document.createElement('strong');
  right.textContent = value;
  row.append(left, right);
  parent.append(row);
}

function renderResult(data) {
  const root = document.getElementById('results');
  root.className = '';
  root.replaceChildren();
  const summary = document.createElement('div');
  summary.className = 'result-summary';
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = `ASSIGNED SEGMENT ${data.assigned_cluster}${data.customer_id ? ` · ${data.customer_id}` : ''}`;
  const title = document.createElement('h4');
  title.textContent = data.cluster_name;
  const priority = document.createElement('span');
  priority.className = `priority ${data.retention_priority}`;
  priority.textContent = `${data.retention_priority} retention priority`;
  const score = document.createElement('div');
  score.className = 'score';
  score.textContent = data.retention_priority_score.toFixed(1);
  const unit = document.createElement('small');
  unit.textContent = ' / 100';
  score.append(unit);
  summary.append(label, title, priority, score);
  root.append(summary);

  const metrics = document.createElement('div');
  metrics.className = 'result-section';
  const metricsTitle = document.createElement('h5');
  metricsTitle.textContent = 'Decision signals';
  metrics.append(metricsTitle);
  addMetric(metrics, 'Segment ambiguity', `${(data.segment_ambiguity_score * 100).toFixed(1)}% · ${data.ambiguity_level}`);
  addMetric(metrics, 'Customer lifetime value', `$${data.customer_lifetime_value_usd.toLocaleString()}`);
  addMetric(metrics, 'Churn risk', `${data.churn_risk_score.toFixed(1)} / 100`);
  root.append(metrics);

  const memberships = document.createElement('div');
  memberships.className = 'result-section';
  const membershipTitle = document.createElement('h5');
  membershipTitle.textContent = 'Segment memberships';
  memberships.append(membershipTitle);
  for (let index = 1; index <= 4; index++) {
    const value = data.memberships[`cluster_${index}`];
    const item = document.createElement('div');
    item.className = 'membership';
    const header = document.createElement('div');
    header.className = 'membership-header';
    const name = document.createElement('span');
    name.textContent = `Segment ${index}`;
    const percent = document.createElement('strong');
    percent.textContent = `${(value * 100).toFixed(1)}%`;
    header.append(name, percent);
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('span');
    fill.style.width = `${Math.max(0, Math.min(100, value * 100))}%`;
    bar.append(fill);
    item.append(header, bar);
    memberships.append(item);
  }
  root.append(memberships);

  const action = document.createElement('div');
  action.className = 'result-section';
  const actionTitle = document.createElement('h5');
  actionTitle.textContent = 'Recommended action';
  const recommendation = document.createElement('div');
  recommendation.className = 'recommendation';
  recommendation.textContent = data.recommendation;
  action.append(actionTitle, recommendation);
  root.append(action);
}

const form = document.getElementById('customer-form');
document.getElementById('sample-button').addEventListener('click', () => {
  for (const [key, value] of Object.entries(sample)) form.elements[key].value = value;
  document.getElementById('form-error').hidden = true;
  form.scrollIntoView({ behavior: 'smooth' });
});
form.addEventListener('reset', () => {
  document.getElementById('form-error').hidden = true;
  document.getElementById('results').innerHTML = '<div class="empty-state"><div class="empty-icon">◎</div><h4>Ready for analysis</h4><p>Fill in the form or use the example customer to see segment membership and a retention recommendation.</p></div>';
});
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = document.getElementById('submit-button');
  const error = document.getElementById('form-error');
  error.hidden = true;
  button.disabled = true;
  button.textContent = 'Analyzing…';
  const payload = {};
  for (const [key, value] of new FormData(form).entries()) {
    payload[key] = key === 'customer_id' ? (value.trim() || null) :
      ['shopping_channel', 'device_used'].includes(key) ? value : Number(value);
  }
  try {
    const result = await request('/api/predict', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    renderResult(result);
    document.getElementById('result-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (cause) {
    error.textContent = cause instanceof TypeError ? 'Cannot reach the API. Start the backend on 127.0.0.1:8000.' : cause.message;
    error.hidden = false;
  } finally {
    button.disabled = false;
    button.innerHTML = 'Analyze customer <span>→</span>';
  }
});

loadOverview();
