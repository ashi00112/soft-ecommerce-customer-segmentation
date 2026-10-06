import React from 'react';
import { HelpCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Gauge from '../common/Gauge';
import AnimatedNumber from '../common/AnimatedNumber';

const HIGH_AMBIGUITY_THRESHOLD = 0.531;

/**
 * Visualizes Segment Ambiguity Score (Normalized Shannon Entropy) and
 * ambiguity level, as an animated semicircle gauge with the real
 * threshold marked.
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

      <div className="ambiguity-gauge-row">
        <Gauge
          value={score}
          max={1}
          size={148}
          strokeWidth={14}
          sweep={180}
          rotation={180}
          trackColor="rgba(255,255,255,0.22)"
          fillColor="#C6FF33"
          thresholdFraction={HIGH_AMBIGUITY_THRESHOLD}
          thresholdColor="#FFFFFF"
        >
          <span className="gauge-center-value" style={{ fontSize: '1.5rem', color: '#FFFFFF' }}>
            <AnimatedNumber value={score} decimals={4} />
          </span>
          <span className="gauge-center-sub" style={{ color: '#FFFFFF' }}>/ 1.0000</span>
        </Gauge>

        <div className="score-hero" style={{ flex: 1, minWidth: '10rem' }}>
          <span className="score-number">
            <AnimatedNumber value={score} decimals={4} />
          </span>
          <span className="score-scale">/ 1.0000 ({percentage}%)</span>
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 600,
            }}
          >
            High-ambiguity threshold ≈ {HIGH_AMBIGUITY_THRESHOLD.toFixed(3)} (marked on the gauge)
          </p>
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
