import React from 'react';
import { ShieldAlert, DollarSign, Activity, Percent } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Gauge from '../common/Gauge';
import AnimatedNumber from '../common/AnimatedNumber';
import StackedScoreBar from '../common/StackedScoreBar';
import InfoTooltip from '../common/InfoTooltip';

const TIER_COLORS = {
  High: '#E11D48',
  Medium: '#D97706',
  Low: '#059669',
};

/**
 * Visualizes the 3-Factor Retention Prioritization model:
 * Composite Priority Score (0-100) as an animated ring with the tier
 * badge popping in, a stacked bar of the 3 weighted contributions, and
 * the existing per-factor breakdown cards.
 *
 * @param {{
 *   priorityScore: number,
 *   priorityTier: 'High' | 'Medium' | 'Low',
 *   clvComponent: number,
 *   churnComponent: number,
 *   ambiguityComponent: number,
 *   rawClv: number,
 *   rawChurnScore: number,
 *   rawAmbiguityScore: number
 * }} props
 */
export default function RetentionScoreCard({
  priorityScore,
  priorityTier,
  clvComponent,
  churnComponent,
  ambiguityComponent,
  rawClv,
  rawChurnScore,
  rawAmbiguityScore,
  ambiguityLevel,
}) {
  const prefersReducedMotion = useReducedMotion();

  const getTierClass = () => {
    switch (priorityTier) {
      case 'High':
        return 'tier-high';
      case 'Medium':
        return 'tier-medium';
      case 'Low':
      default:
        return 'tier-low';
    }
  };

  const clvContribution = clvComponent * 40;
  const churnContribution = churnComponent * 40;
  const ambiguityContribution = ambiguityComponent * 20;
  const tierColor = TIER_COLORS[priorityTier] || TIER_COLORS.Low;

  const stackedSegments = [
    { label: 'CLV', points: clvContribution, color: '#7D39EB' },
    { label: 'Churn', points: churnContribution, color: '#D97706' },
    { label: 'Ambiguity', points: ambiguityContribution, color: '#111111' },
  ];

  return (
    <div className="card result-card retention-score-card">
      <div className="result-card-header">
        <div className="card-title-group">
          <ShieldAlert className="result-header-icon text-teal" aria-hidden="true" />
          <div>
            <h3 className="result-card-title">
              Retention Prioritization (3-Factor Model)
              <InfoTooltip text="A single 0-100 score blending how valuable this customer is (CLV), how likely they are to leave (churn risk), and how uncertain their segment is (ambiguity) — higher means more urgent to act on." />
            </h3>
            <p className="result-card-subtitle">
              Composite allocation index combining business stake, attrition risk, and segment ambiguity
            </p>
          </div>
        </div>

        <motion.div
          className={`priority-tier-badge ${getTierClass()}`}
          initial={prefersReducedMotion ? { scale: 1 } : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.3 }}
        >
          <span className="tier-dot" />
          <span className="tier-name">{priorityTier} Priority</span>
        </motion.div>
      </div>

      {/* Main Score Hero */}
      <div className="retention-score-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Gauge
            value={priorityScore}
            max={100}
            size={128}
            strokeWidth={12}
            sweep={360}
            rotation={-90}
            trackColor="rgba(0,0,0,0.1)"
            fillColor={tierColor}
          >
            <span className="gauge-center-value" style={{ fontSize: '1.35rem', color: 'var(--color-black)' }}>
              <AnimatedNumber value={priorityScore} decimals={0} />
            </span>
            <span className="gauge-center-sub" style={{ color: 'var(--color-muted)' }}>/ 100</span>
          </Gauge>

          <div className="score-summary">
            <div className="score-primary">
              <span className="score-val">
                <AnimatedNumber value={priorityScore} decimals={1} />
              </span>
              <span className="score-max">/ 100</span>
            </div>
            <span className="score-formula-hint">
              Priority = 100 × [0.40(CLV) + 0.40(Churn) + 0.20(Ambiguity)]
            </span>
            <p className="retention-explanation">
              Combines customer business value, attrition risk and segment ambiguity to identify
              customers who may deserve greater retention attention. Higher scores indicate more
              urgent intervention.
            </p>
          </div>
        </div>

        {/* 3-component stacked bar — visually adds up to the score above */}
        <StackedScoreBar segments={stackedSegments} total={100} />
      </div>

      {/* 3 Component Factor Breakdown Cards */}
      <div className="factors-grid">
        {/* Factor 1: CLV */}
        <div className="factor-item">
          <div className="factor-header">
            <div className="factor-icon-wrap bg-blue-subtle">
              <DollarSign className="factor-icon text-accent" aria-hidden="true" />
            </div>
            <div>
              <h4 className="factor-title">
                CLV Component
                <InfoTooltip text="The customer's lifetime value ranked against 40,000 other customers — a higher percentile means they're more valuable than most." />
              </h4>
              <span className="factor-weight">40% Weight</span>
            </div>
          </div>

          <div className="factor-metrics">
            <div className="factor-metric-row">
              <span className="metric-label">Raw CLV:</span>
              <span className="metric-val">${rawClv.toLocaleString()}</span>
            </div>
            <div className="factor-metric-row">
              <span className="metric-label">CLV Percentile Rank:</span>
              <span className="metric-val">{(clvComponent * 100).toFixed(1)}%</span>
            </div>
            <div className="factor-contribution">
              <span>Points Earned:</span>
              <strong>+{clvContribution.toFixed(1)} pts</strong>
            </div>
          </div>
        </div>

        {/* Factor 2: Churn Risk */}
        <div className="factor-item">
          <div className="factor-header">
            <div className="factor-icon-wrap bg-amber-subtle">
              <Activity className="factor-icon text-warning" aria-hidden="true" />
            </div>
            <div>
              <h4 className="factor-title">
                Churn Risk Component
                <InfoTooltip text="How likely this customer is to stop buying, on a 0-100 scale, converted to a 0-1 factor — higher means more urgent to retain." />
              </h4>
              <span className="factor-weight">40% Weight</span>
            </div>
          </div>

          <div className="factor-metrics">
            <div className="factor-metric-row">
              <span className="metric-label">Raw Risk Score:</span>
              <span className="metric-val">{rawChurnScore} / 100</span>
            </div>
            <div className="factor-metric-row">
              <span className="metric-label">Normalized Factor:</span>
              <span className="metric-val">{churnComponent.toFixed(4)}</span>
            </div>
            <div className="factor-contribution">
              <span>Points Earned:</span>
              <strong>+{churnContribution.toFixed(1)} pts</strong>
            </div>
          </div>
        </div>

        {/* Factor 3: Segment Ambiguity */}
        <div className="factor-item">
          <div className="factor-header">
            <div className="factor-icon-wrap bg-purple-subtle">
              <Percent className="factor-icon text-purple" aria-hidden="true" />
            </div>
            <div>
              <h4 className="factor-title">
                Ambiguity Component
                <InfoTooltip text="How unsure the model is about which single segment this customer belongs to. High ambiguity customers may need broader, less segment-specific messaging." />
              </h4>
              <span className="factor-weight">20% Weight</span>
            </div>
          </div>

          <div className="factor-metrics">
            <div className="factor-metric-row">
              <span className="metric-label">Normalized Entropy:</span>
              <span className="metric-val">{rawAmbiguityScore.toFixed(4)}</span>
            </div>
            <div className="factor-metric-row">
              <span className="metric-label">Ambiguity Level:</span>
              <span className="metric-val">
                {ambiguityLevel ? `${ambiguityLevel} (${ambiguityLevel === 'High' ? '≥ 0.531' : '< 0.531'})` : (rawAmbiguityScore >= 0.5311607 ? 'High (≥ 0.531)' : 'Normal (< 0.531)')}
              </span>
            </div>
            <div className="factor-contribution">
              <span>Points Earned:</span>
              <strong>+{ambiguityContribution.toFixed(1)} pts</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
