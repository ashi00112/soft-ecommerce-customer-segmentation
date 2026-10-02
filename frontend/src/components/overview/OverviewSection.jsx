import React, { useState, useEffect, useCallback } from 'react';
import {
  GitCommit,
  ArrowDown,
  Layers,
  Percent,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Database,
  ArrowRight
} from 'lucide-react';
import ClusterCard from './ClusterCard';
import LoadingSpinner from '../common/LoadingSpinner';
import AlertMessage from '../common/AlertMessage';
import { getClusters } from '../../services/api';

/**
 * Overview Section Component
 * Provides executive and methodological overview of the segmentation and
 * retention decision-support system, featuring dynamic cluster loading.
 */
export default function OverviewSection() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClusters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClusters();
      if (data && Array.isArray(data.clusters)) {
        setClusters(data.clusters);
      } else {
        throw new Error('Invalid cluster payload received from backend.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load cluster definitions from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  const pipelineSteps = [
    {
      step: '01',
      title: 'Customer Behaviour',
      desc: '12 raw behavioural, experience & engagement features (10 numerical + 2 categorical) preprocessed into 18 continuous inputs.',
      icon: Database,
    },
    {
      step: '02',
      title: 'Fuzzy C-Means Clustering',
      desc: 'Soft partitioning (K=4, m=1.10) discovers natural behavioural archetypes without hard boundaries.',
      icon: Layers,
    },
    {
      step: '03',
      title: 'Membership Degrees',
      desc: 'Continuous soft-affinity membership vector (u₁, u₂, u₃, u₄) summing strictly to 1.0. Higher values indicate stronger alignment with that segment.',
      icon: Percent,
    },
    {
      step: '04',
      title: 'Segment Ambiguity',
      desc: 'Segment Ambiguity Score (Normalized Shannon Entropy) quantifies boundary overlap across membership degrees.',
      icon: HelpCircle,
    },
    {
      step: '05',
      title: 'CLV + Churn Risk',
      desc: 'CLV development reference percentile and Churn Risk Score (0–100) introduced post-clustering as business signals.',
      icon: TrendingUp,
    },
    {
      step: '06',
      title: 'Retention Priority & Action',
      desc: 'Composite 3-factor prioritization score (40% CLV, 40% Churn Risk, 20% Ambiguity) and action triggers.',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="overview-container">
      {/* Hero Executive Summary */}
      <section className="hero-box">
        <div className="hero-tag">
          <GitCommit className="hero-tag-icon" aria-hidden="true" />
          <span>Analytical Architecture</span>
        </div>
        <h2 className="hero-title">
          Fuzzy Customer Segmentation &amp; Retention Prioritization
        </h2>
        <p className="hero-description">
          A dual-phase decision-support framework combining <strong>Fuzzy C-Means (FCM)</strong> soft
          clustering with an empirical <strong>3-factor retention prioritization</strong> model.
          Instead of forcing customers into rigid, single-cluster silos, the system captures
          multi-segment affinity and boundary ambiguity to inform targeted retention resource allocation.
        </p>
      </section>

      {/* End-to-End Decision Pipeline */}
      <section className="pipeline-section">
        <div className="section-header">
          <h3 className="section-title">End-to-End Decision Pipeline</h3>
          <p className="section-subtitle">
            Systematic progression from raw behavioural features to actionable CRM intervention recommendations.
          </p>
        </div>

        <div className="pipeline-stepper">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.step}>
                <div className="pipeline-step-card">
                  <div className="step-header">
                    <span className="step-number">{step.step}</span>
                    <Icon className="step-icon" aria-hidden="true" />
                  </div>
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-desc">{step.desc}</p>
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <div className="pipeline-connector" aria-hidden="true">
                    <ArrowRight className="connector-arrow connector-arrow-h" />
                    <ArrowDown className="connector-arrow connector-arrow-v" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* Feature Separation Callout: Clustering Inputs vs Post-Clustering Retention Inputs */}
      <section className="separation-section">
        <div className="section-header">
          <h3 className="section-title">Methodological Feature Architecture</h3>
          <p className="section-subtitle">
            Methodological decoupling of behavioural clustering from business impact evaluation.
          </p>
        </div>

        <div className="grid-2">
          {/* Clustering Inputs */}
          <div className="card feature-card feature-card-clustering">
            <div className="feature-card-header">
              <div className="feature-badge clustering-badge">
                <Sliders className="feature-icon" aria-hidden="true" />
                <span>Clustering Inputs (FCM Stage)</span>
              </div>
              <h4 className="feature-card-title">12 Behavioural &amp; Engagement Features</h4>
            </div>

            <p className="feature-card-desc">
              Features utilized exclusively by the Fuzzy C-Means preprocessing pipeline to discover organic customer groupings:
            </p>

            <ul className="feature-list">
              <li>
                <CheckCircle2 className="list-check" />
                <span>
                  <strong>10 Numerical Features (StandardScaler):</strong> tenure_months, total_purchases, avg_order_value_usd, days_since_last_purchase, return_count, complaint_count, satisfaction_score, email_open_rate, click_through_rate, conversion_rate.
                </span>
              </li>
              <li>
                <CheckCircle2 className="list-check" />
                <span>
                  <strong>2 Categorical Features (OneHotEncoder):</strong> shopping_channel (4 categories: In-Store, Marketplace, Mobile App, Online) and device_used (4 categories: Desktop, Mobile, Multiple, Tablet).
                </span>
              </li>
              <li>
                <CheckCircle2 className="list-check" />
                <span>
                  <strong>Transformed Model Space:</strong> 18 standardized continuous inputs (10 scaled numerical + 8 one-hot binary flags).
                </span>
              </li>
            </ul>

            <div className="feature-card-note">
              <strong>Not Clustering Inputs:</strong> Age, gender, annual income, total_spent_usd, CLV, churn risk, RFM scores, existing category labels, profitability, and customer health score are intentionally excluded from clustering.
            </div>
          </div>

          {/* Post-Clustering Inputs */}
          <div className="card feature-card feature-card-retention">
            <div className="feature-card-header">
              <div className="feature-badge retention-badge">
                <TrendingUp className="feature-icon" aria-hidden="true" />
                <span>Post-Clustering Retention Inputs</span>
              </div>
              <h4 className="feature-card-title">Business Prioritization Signals</h4>
            </div>

            <p className="feature-card-desc">
              External decision metrics intentionally introduced downstream after cluster formation:
            </p>

            <ul className="feature-list">
              <li>
                <CheckCircle2 className="list-check" />
                <span>
                  <strong>Customer Lifetime Value (CLV):</strong> Evaluated using the empirical development reference distribution (40,000 customers) via percentile rank (40% component weight).
                </span>
              </li>
              <li>
                <CheckCircle2 className="list-check" />
                <span>
                  <strong>Churn Risk Score (0–100):</strong> Normalized directly (churn_risk_score / 100.0) into a continuous vulnerability signal (40% component weight).
                </span>
              </li>
              <li>
                <CheckCircle2 className="list-check" />
                <span>
                  <strong>Segment Ambiguity Score (Normalized Shannon Entropy):</strong> Quantifies boundary overlap across soft membership degrees (20% component weight).
                </span>
              </li>
            </ul>

            <div className="feature-card-rationale">
              <strong>Methodological Rationale:</strong> CLV and churn risk are intentionally excluded from cluster formation so that customer segments are formed from behavioural, experience and engagement characteristics. They are introduced afterward as business-prioritization signals.
            </div>
          </div>
        </div>
      </section>

      {/* Discovered Customer Segments (Live from Backend) */}
      <section className="clusters-section">
        <div className="section-header">
          <div className="section-header-row">
            <div>
              <h3 className="section-title">Discovered Customer Segments</h3>
              <p className="section-subtitle">
                Operational segment profiles retrieved live from the backend model registry (GET /api/clusters).
              </p>
            </div>
            {!loading && !error && (
              <span className="live-source-badge">
                Source: Live API • {clusters.length} Segments
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="clusters-loading">
            <LoadingSpinner message="Querying live cluster definitions from backend..." size="md" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <AlertMessage
            type="error"
            title="Backend Service Offline"
            message={`Could not load cluster profiles: ${error}. Verify that the FastAPI backend server is active at http://127.0.0.1:8000.`}
            onRetry={fetchClusters}
            retryLabel="Retry Connection"
          />
        )}

        {/* Live Cluster Cards */}
        {!loading && !error && clusters.length > 0 && (
          <div className="grid-4 cluster-grid">
            {clusters.map((cluster) => (
              <ClusterCard key={cluster.cluster_id} cluster={cluster} />
            ))}
          </div>
        )}

        {/* Empty State (unexpected API anomaly) */}
        {!loading && !error && clusters.length === 0 && (
          <AlertMessage
            type="warning"
            title="No Segments Returned"
            message="The backend responded successfully but returned an empty cluster array."
            onRetry={fetchClusters}
          />
        )}
      </section>
    </div>
  );
}
