import React from 'react';
import { ArrowLeft, User, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import MembershipDistribution from './MembershipDistribution';
import AmbiguityCard from './AmbiguityCard';
import RetentionScoreCard from './RetentionScoreCard';
import RecommendationCard from './RecommendationCard';
import AnimatedNumber from '../common/AnimatedNumber';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Top-level ResultsDashboard component.
 * Displays the comprehensive analytical results for a single customer,
 * animating the sections in sequence: membership → ambiguity → retention
 * → recommendation ("verdict").
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

  const prefersReducedMotion = useReducedMotion();

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

  const summaryText = (() => {
    const strength = Math.round(max_membership * 100);
    const ambiguityClause =
      ambiguity_level === 'High'
        ? ', but also shows traits of other groups'
        : ', with a clear, consistent profile';
    return (
      <>
        This customer mostly looks like a <strong>{cluster_name}</strong> ({strength}% match)
        {ambiguityClause} → <strong>{retention_priority} retention priority</strong>.
      </>
    );
  })();

  return (
    <motion.div
      id="results-dashboard"
      className="results-dashboard"
      role="region"
      aria-live="polite"
      aria-label="Customer analysis results"
      variants={prefersReducedMotion ? undefined : containerVariants}
      initial={prefersReducedMotion ? 'visible' : 'hidden'}
      animate="visible"
    >
      {/* Plain-English one-line summary */}
      <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="result-summary-banner">
        <Sparkles className="result-summary-icon" aria-hidden="true" />
        <p className="result-summary-text">{summaryText}</p>
      </motion.div>

      {/* Results Header Hero: Saturated Black/Violet Brand Block */}
      <motion.section
        variants={prefersReducedMotion ? undefined : itemVariants}
        className="results-header-hero bold-result-hero"
      >
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
            className="btn btn-modify-light btn-sm"
          >
            <ArrowLeft className="btn-icon-sm" aria-hidden="true" />
            <span>Modify Input</span>
          </button>
        </div>

        <div className="hero-main-row">
          {/* Primary Segment */}
          <div className="hero-cluster-assignment">
            <span className="hero-kicker-lime">PRIMARY SEGMENT</span>
            <div className="hero-cluster-header-wrap">
              <span className="hero-cluster-num-badge">0{assigned_cluster}</span>
              <div>
                <h2 className="hero-cluster-name gradient-text-white-lime">{cluster_name}</h2>
              </div>
            </div>
            <div className="hero-membership-degree-box">
              <Award className="membership-degree-icon" aria-hidden="true" />
              <div className="membership-degree-text-group">
                <span className="membership-degree-label">Membership Degree</span>
                <div className="membership-degree-numbers">
                  <span className="membership-degree-value">
                    <AnimatedNumber value={max_membership * 100} decimals={1} suffix="%" />
                  </span>
                  <span className="membership-degree-raw">({max_membership.toFixed(4)})</span>
                </div>
              </div>
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
              <span className="hero-score-label">Composite Priority Index</span>
              <span className="hero-score-num">
                <AnimatedNumber value={retention_priority_score} decimals={1} /> <small>/ 100</small>
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Grid: Fuzzy Memberships & Segment Ambiguity */}
      <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="results-grid-2">
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
      </motion.div>

      {/* Retention Prioritization Component Breakdown */}
      <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
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
      </motion.div>

      {/* Deterministic CRM Recommendation — the final "verdict" */}
      <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
        <RecommendationCard
          recommendation={recommendation}
          clusterName={cluster_name}
          priorityTier={retention_priority}
        />
      </motion.div>
    </motion.div>
  );
}
