import React from 'react';
import { ArrowLeft, CheckCircle2, User, Award, ShieldAlert, Sparkles } from 'lucide-react';
import MembershipDistribution from './MembershipDistribution';
import AmbiguityCard from './AmbiguityCard';
import RetentionScoreCard from './RetentionScoreCard';
import RecommendationCard from './RecommendationCard';

/**
 * Top-level ResultsDashboard component.
 * Displays the comprehensive analytical results for a single customer.
 *
 * @param {{
 *   result: {
 *     customer_id: string | null,
 *     assigned_cluster: number,
 *     cluster_name: string,
 *     memberships: { cluster_1: number, cluster_2: number, cluster_3: number, cluster_4: number },
 *     max_membership: number,
 *     membership_margin: number,
 *     segment_ambiguity_score: number,
 *     ambiguity_level: 'High' | 'Normal',
 *     customer_lifetime_value_usd: number,
 *     churn_risk_score: number,
 *     clv_component: number,
 *     churn_component: number,
 *     ambiguity_component: number,
 *     retention_priority_score: number,
 *     retention_priority: 'High' | 'Medium' | 'Low',
 *     recommendation: string
 *   },
 *   onModify: () => void
 * }} props
 */
export default function ResultsDashboard({ result, onModify }) {
  const {
    customer_id,
    assigned_cluster,
    cluster_name,
    memberships,
    max_membership,
    membership_margin,
    segment_ambiguity_score,
    ambiguity_level,
    customer_lifetime_value_usd,
    churn_risk_score,
    clv_component,
    churn_component,
    ambiguity_component,
    retention_priority_score,
    retention_priority,
    recommendation,
  } = result;

  const getTierClass = () => {
    switch (retention_priority) {
      case 'High':
        return 'tier-high';
      case 'Medium':
        return 'tier-medium';
      case 'Low':
      default:
        return 'tier-low';
    }
  };

  return (
    <div id="results-dashboard" className="results-dashboard">
      {/* Results Header Hero */}
      <section className="results-header-hero card">
        <div className="hero-top-row">
          <div className="customer-meta">
            <span className="customer-tag-badge">
              <User className="customer-tag-icon" aria-hidden="true" />
              <span>{customer_id || 'Unnamed Observation'}</span>
            </span>
            <span className="timestamp-badge">Inference Complete</span>
          </div>

          <button
            type="button"
            onClick={onModify}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft className="btn-icon-sm" aria-hidden="true" />
            <span>Modify Input</span>
          </button>
        </div>

        <div className="hero-main-row">
          {/* Primary Segment */}
          <div className="hero-cluster-assignment">
            <span className="hero-sublabel">Primary Segment</span>
            <h2 className="hero-cluster-name">
              <span className="cluster-id-marker">Cluster {assigned_cluster}:</span> {cluster_name}
            </h2>
            <div className="hero-membership-degree">
              <Award className="membership-degree-icon" aria-hidden="true" />
              <span className="membership-degree-label">Membership Degree:</span>
              <span className="membership-degree-value">{(max_membership * 100).toFixed(1)}%</span>
              <span className="membership-degree-raw">({max_membership.toFixed(4)})</span>
            </div>
          </div>

          <div className="hero-kpis">
            <div className={`priority-pill-large ${getTierClass()}`}>
              <ShieldAlert className="tier-icon-large" aria-hidden="true" />
              <div className="priority-pill-text">
                <span className="priority-pill-label">Retention Priority</span>
                <span className="priority-pill-tier">{retention_priority} Tier</span>
              </div>
            </div>

            <div className="hero-score-kpi">
              <span className="hero-score-label">Priority Score</span>
              <span className="hero-score-num">{retention_priority_score.toFixed(1)} <small>/ 100</small></span>
            </div>
          </div>
        </div>
      </section>


      {/* Grid: Fuzzy Memberships & Segment Ambiguity */}
      <div className="results-grid-2">
        <MembershipDistribution
          memberships={memberships}
          assignedCluster={assigned_cluster}
          maxMembership={max_membership}
          membershipMargin={membership_margin}
        />

        <AmbiguityCard
          score={segment_ambiguity_score}
          level={ambiguity_level}
        />
      </div>

      {/* Retention Prioritization Component Breakdown */}
      <RetentionScoreCard
        priorityScore={retention_priority_score}
        priorityTier={retention_priority}
        clvComponent={clv_component}
        churnComponent={churn_component}
        ambiguityComponent={ambiguity_component}
        rawClv={customer_lifetime_value_usd}
        rawChurnScore={churn_risk_score}
        rawAmbiguityScore={segment_ambiguity_score}
        ambiguityLevel={ambiguity_level}
      />

      {/* Deterministic CRM Recommendation */}
      <RecommendationCard
        recommendation={recommendation}
        clusterName={cluster_name}
        priorityTier={retention_priority}
      />
    </div>
  );
}
