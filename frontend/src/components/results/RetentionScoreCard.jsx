import React from 'react';
import { ShieldAlert, DollarSign, Activity, Percent, ArrowUpRight } from 'lucide-react';

/**
 * Visualizes the 3-Factor Retention Prioritization model:
 * Composite Priority Score (0-100), Priority Tier, and the 40/40/20 component breakdown.
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

  const clvContribution = (clvComponent * 40).toFixed(1);
  const churnContribution = (churnComponent * 40).toFixed(1);
  const ambiguityContribution = (ambiguityComponent * 20).toFixed(1);

  return (
    <div className="card result-card retention-score-card">
      <div className="result-card-header">
        <div className="card-title-group">
          <ShieldAlert className="result-header-icon text-teal" aria-hidden="true" />
          <div>
            <h3 className="result-card-title">Retention Prioritization (3-Factor Model)</h3>
            <p className="result-card-subtitle">
              Composite allocation index combining business stake, attrition risk, and segment ambiguity
            </p>
          </div>
        </div>

        <div className={`priority-tier-badge ${getTierClass()}`}>
          <span className="tier-dot" />
          <span className="tier-name">{priorityTier} Priority</span>
        </div>
      </div>

      {/* Main Score Hero */}
      <div className="retention-score-hero">
        <div className="score-summary">
          <div className="score-primary">
            <span className="score-val">{priorityScore.toFixed(1)}</span>
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

        {/* Priority Level Bar */}
        <div className="priority-meter-wrap">
          <div className="priority-meter-track">
            <div
              className={`priority-meter-fill ${getTierClass()}`}
              style={{ width: `${Math.min(Math.max(priorityScore, 3), 100)}%` }}
            />
          </div>
          <div className="priority-meter-tiers">
            <span>Low (&lt; 37.53)</span>
            <span>Medium (37.53 – &lt; 50.69)</span>
            <span>High (≥ 50.69)</span>
          </div>
        </div>
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
              <h4 className="factor-title">CLV Component</h4>
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
              <strong>+{clvContribution} pts</strong>
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
              <h4 className="factor-title">Churn Risk Component</h4>
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
              <strong>+{churnContribution} pts</strong>
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
              <h4 className="factor-title">Ambiguity Component</h4>
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
              <strong>+{ambiguityContribution} pts</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
