import React from 'react';
import { HelpCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * Visualizes Segment Ambiguity Score (Normalized Shannon Entropy) and ambiguity level.
 *
 * @param {{
 *   score: number,
 *   level: 'High' | 'Normal'
 * }} props
 */
export default function AmbiguityCard({ score, level }) {
  const isHigh = level === 'High';
  const percentage = (score * 100).toFixed(1);

  return (
    <div className={`card result-card ambiguity-card ${isHigh ? 'ambiguity-high-card' : ''}`}>
      <div className="result-card-header">
        <div className="card-title-group">
          <HelpCircle className="result-header-icon text-purple" aria-hidden="true" />
          <div>
            <h3 className="result-card-title">Segment Ambiguity</h3>
            <p className="result-card-subtitle">
              How evenly membership is distributed across the four segments — lower is clearer
            </p>
          </div>
        </div>

        <div className={`ambiguity-badge ${isHigh ? 'badge-high' : 'badge-normal'}`}>
          {isHigh ? (
            <>
              <AlertTriangle className="badge-icon" aria-hidden="true" />
              <span>High Ambiguity</span>
            </>
          ) : (
            <>
              <CheckCircle className="badge-icon" aria-hidden="true" />
              <span>Normal Ambiguity</span>
            </>
          )}
        </div>
      </div>

      <div className="ambiguity-score-display">
        <div className="score-hero">
          <span className="score-number">{score.toFixed(4)}</span>
          <span className="score-scale">/ 1.0000 ({percentage}%)</span>
        </div>

        {/* Ambiguity Meter */}
        <div className="ambiguity-meter-container">
          <div className="meter-labels">
            <span>0.0 (Pure Archetype)</span>
            <span className="threshold-marker">Threshold ≈ 0.531</span>
            <span>1.0 (Maximum Ambiguity)</span>
          </div>
          <div className="meter-track">
            <div
              className={`meter-fill ${isHigh ? 'fill-high' : 'fill-normal'}`}
              style={{ width: `${Math.min(Math.max(score * 100, 2), 100)}%` }}
            />
            <div className="meter-threshold-line" style={{ left: '53.12%' }} />
          </div>
        </div>
      </div>

      <div className="ambiguity-interpretation">
        <Info className="interpretation-icon" aria-hidden="true" />
        <p className="interpretation-text">
          {isHigh ? (
            <>
              <strong>Boundary Customer:</strong> This customer's profile spreads noticeably across
              multiple segments. They don't fit neatly into a single archetype. Avoid narrow,
              single-segment strategies and consider balanced outreach covering more than one approach.
            </>
          ) : (
            <>
              <strong>Clear Segment Alignment:</strong> This customer aligns strongly with their
              primary segment. Standard segment-specific retention strategies can be applied
              with confidence.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
