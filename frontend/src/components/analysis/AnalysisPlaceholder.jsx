import React from 'react';
import { UserCheck, Clock, ArrowRight } from 'lucide-react';

/**
 * Placeholder component for the interactive Customer Analysis section.
 * To be implemented with the full 14-field customer form and prediction in Step 6D.
 */
export default function AnalysisPlaceholder({ onNavigateOverview }) {
  return (
    <div className="card placeholder-card">
      <div className="placeholder-icon-wrap">
        <UserCheck className="placeholder-hero-icon" aria-hidden="true" />
      </div>
      <h3 className="placeholder-title">Customer Analysis</h3>
      <p className="placeholder-text">
        Customer analysis form will be implemented in the next development step.
      </p>
      <div className="placeholder-status-tag">
        <Clock className="tag-icon" aria-hidden="true" />
        <span>Scheduled for Frontend Step 6D</span>
      </div>
      {onNavigateOverview && (
        <button
          type="button"
          onClick={onNavigateOverview}
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '1.5rem' }}
        >
          <span>Return to System Overview</span>
          <ArrowRight className="btn-icon-sm" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
