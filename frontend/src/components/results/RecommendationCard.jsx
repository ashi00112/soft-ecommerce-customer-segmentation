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
    <div className="card result-card recommendation-card-bold">
      <div className="rec-bold-header">
        <div className="rec-bold-kicker-group">
          <span className="rec-action-badge">RECOMMENDED ACTION</span>
          <span className="rec-source-pill">Deterministic Strategy Engine</span>
        </div>
        <h3 className="rec-bold-title">Targeted CRM Intervention</h3>
        <p className="rec-bold-subtitle">
          Prescriptive retention action calibrated to customer archetype and retention priority
        </p>
      </div>

      <div className="rec-bold-body">
        <div className="rec-bold-quote-box">
          <Lightbulb className="rec-bold-icon" aria-hidden="true" />
          <p className="rec-bold-text">{recommendation}</p>
        </div>

        <div className="rec-bold-meta-grid">
          <div className="rec-bold-meta-item">
            <span className="rec-bold-meta-label">Customer Archetype</span>
            <span className="rec-bold-meta-value">{clusterName}</span>
          </div>
          <div className="rec-bold-meta-item">
            <span className="rec-bold-meta-label">Intervention Priority</span>
            <span className="rec-bold-meta-value">
              {priorityTier === 'High'
                ? 'High Tier (Immediate Personalized Outreach & Retention Budget)'
                : priorityTier === 'Medium'
                ? 'Medium Tier (Targeted Nurture & Re-engagement Automation)'
                : 'Low Tier (General Lifecycle Marketing & Organic Engagement)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
