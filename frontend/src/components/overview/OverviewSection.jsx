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
      {/* Hero Executive Summary: Saturated Violet Block with Asymmetric Data Composition */}
      <section className="hero-box bold-hero">
        <div className="hero-grid">
          <div className="hero-left">
            <div className="hero-tag">
              <span className="hero-tag-dot" aria-hidden="true" />
              <span>SegmentFlow Intelligence</span>
            </div>
            <h2 className="hero-title">
              Understand customers <br className="hero-br" />
              beyond a single segment<span className="hero-lime-dot">.</span>
            </h2>
            <p className="hero-description">
              Discover fuzzy customer memberships, identify ambiguous customer profiles, and prioritize retention using customer value and churn risk.
            </p>
            <div className="hero-badges">
              <span className="hero-pill">Fuzzy C-Means (K=4, m=1.10)</span>
              <span className="hero-pill">Normalized Shannon Entropy</span>
              <span className="hero-pill">3-Factor Retention Prioritization</span>
            </div>
          </div>

          <div className="hero-right" aria-hidden="true">
            <div className="hero-data-artboard">
              <div className="artboard-header">
                <span className="artboard-title">Fuzzy Membership Matrix</span>
                <span className="artboard-status">Continuous Affinities</span>
              </div>
              <div className="artboard-cards">
                <div className="art-card art-card-1">
                  <div className="art-card-top">
                    <span className="art-num">01</span>
                    <span className="art-label">Inactive / Churn Risk</span>
                  </div>
                  <div className="art-bar"><div className="art-fill fill-1" /></div>
                </div>
                <div className="art-card art-card-2">
                  <div className="art-card-top">
                    <span className="art-num">02</span>
                    <span className="art-label">Low-Purchase High-Conv</span>
                  </div>
                  <div className="art-bar"><div className="art-fill fill-2" /></div>
                </div>
                <div className="art-card art-card-3">
                  <div className="art-card-top">
                    <span className="art-num">03</span>
                    <span className="art-label">High-Value Active</span>
                  </div>
                  <div className="art-bar"><div className="art-fill fill-3" /></div>
                </div>
                <div className="art-card art-card-4">
                  <div className="art-card-top">
                    <span className="art-num">04</span>
                    <span className="art-label">Low-Engagement</span>
                  </div>
                  <div className="art-bar"><div className="art-fill fill-4" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Decision Pipeline */}
      <section className="pipeline-section">
        <div className="section-header">
          <span className="section-kicker">01 / DECISION PIPELINE</span>
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
                <div className={`pipeline-step-card pipeline-card-${step.step}`}>
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

      {/* Feature Architecture Callout: Black Block with 3 High-Impact Panels */}
      <section className="separation-section bold-dark-section">
        <div className="section-header section-header-light">
          <span className="section-kicker kicker-lime">02 / FEATURE ARCHITECTURE</span>
          <h3 className="section-title text-white">Methodological Feature Architecture</h3>
          <p className="section-subtitle text-gray">
            Methodological decoupling of behavioural clustering from business impact evaluation.
          </p>
        </div>

        <div className="feature-panels-grid">
          {/* Panel 1: Numerical Features (VIOLET) */}
          <div className="feature-panel panel-violet">
            <div className="panel-badge badge-on-violet">StandardScaler</div>
            <h4 className="panel-title">10 Numerical Features</h4>
            <p className="panel-desc">Behavioural &amp; engagement attributes scaled to zero mean, unit variance:</p>
            <ul className="panel-list">
              <li>tenure_months &amp; total_purchases</li>
              <li>avg_order_value_usd &amp; days_since_last_purchase</li>
              <li>return_count &amp; complaint_count</li>
              <li>satisfaction_score (1–5)</li>
              <li>email_open_rate, click_through_rate, conversion_rate</li>
            </ul>
          </div>

          {/* Panel 2: Categorical Features (ELECTRIC LIME) */}
          <div className="feature-panel panel-lime">
            <div className="panel-badge badge-on-lime">OneHotEncoder</div>
            <h4 className="panel-title">2 Categorical Features</h4>
            <p className="panel-desc">Channel &amp; device attributes encoded into 8 binary indicator columns:</p>
            <ul className="panel-list">
              <li>shopping_channel (In-Store, Marketplace, Mobile App, Online)</li>
              <li>device_used (Desktop, Mobile, Multiple, Tablet)</li>
            </ul>
            <div className="panel-summary-box">
              10 Scaled + 8 Binary = <strong>18 Transformed Features</strong>
            </div>
          </div>

          {/* Panel 3: Post-Clustering Signals (WHITE) */}
          <div className="feature-panel panel-white">
            <div className="panel-badge badge-on-white">Post-Clustering Only</div>
            <h4 className="panel-title">Business Priority Signals</h4>
            <p className="panel-desc">External financial &amp; risk metrics introduced downstream — never clustering inputs:</p>
            <ul className="panel-list">
              <li><strong>CLV (40% Weight):</strong> Evaluated via empirical CDF against 40,000 customers</li>
              <li><strong>Churn Risk (40% Weight):</strong> Normalized score / 100.0</li>
              <li><strong>Ambiguity (20% Weight):</strong> Normalized Shannon entropy across soft memberships</li>
            </ul>
            <div className="panel-note-box">
              <strong>Methodological Rationale:</strong> CLV and churn risk are excluded from clustering to ensure segments reflect genuine behavioural tendencies.
            </div>
          </div>
        </div>
      </section>

      {/* Discovered Customer Segments (Live from Backend) */}
      <section className="clusters-section">
        <div className="section-header">
          <span className="section-kicker">03 / DISCOVERED ARCHETYPES</span>
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
