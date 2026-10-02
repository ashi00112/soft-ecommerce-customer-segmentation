import React from 'react';
import { Lightbulb, Target, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * Renders the deterministic business retention action recommendation
 * returned by the FastAPI backend.
 *
 * @param {{
 *   recommendation: string,
 *   clusterName: string,
 *   priorityTier: 'High' | 'Medium' | 'Low'
 * }} props
 */
export default function RecommendationCard({
  recommendation,
  clusterName,
  priorityTier,
}) {
  return (
    <div className="card result-card recommendation-card">
      <div className="result-card-header">
        <div className="card-title-group">
          <Target className="result-header-icon text-accent" aria-hidden="true" />
          <div>
            <h3 className="result-card-title">CRM Action Recommendation</h3>
            <p className="result-card-subtitle">
              Deterministic intervention strategy driven by segment archetype &amp; retention priority
            </p>
          </div>
        </div>

        <span className="rec-source-pill">Backend Strategy Engine</span>
      </div>

      <div className="recommendation-content">
        <div className="rec-quote-box">
          <Lightbulb className="rec-quote-icon" aria-hidden="true" />
          <p className="rec-text">{recommendation}</p>
        </div>

        <div className="rec-meta-grid">
          <div className="rec-meta-item">
            <span className="rec-meta-label">Target Segment Profile:</span>
            <span className="rec-meta-value">{clusterName}</span>
          </div>
          <div className="rec-meta-item">
            <span className="rec-meta-label">Assigned Resource Allocation:</span>
            <span className="rec-meta-value">
              {priorityTier === 'High'
                ? 'High Tier (Immediate Personalized Outreach & Retention Budget)'
                : priorityTier === 'Medium'
                ? 'Medium Tier (Targeted Nurture & Re-engagement Automation)'
                : 'Standard Tier (General Lifecycle Marketing & Organic Engagement)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
