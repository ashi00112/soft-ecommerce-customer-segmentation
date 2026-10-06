import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Horizontal stacked bar visualizing how 3 weighted components sum to a
 * composite score out of `total`. All segment values come from the
 * caller (the live retention_priority_score breakdown) — nothing here
 * is invented.
 *
 * @param {{
 *   segments: Array<{ label: string, points: number, color: string }>,
 *   total?: number
 * }} props
 */
export default function StackedScoreBar({ segments, total = 100 }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="stacked-score-bar-wrap">
      <div className="stacked-score-bar">
        {segments.map((seg, idx) => {
          const widthPct = Math.max((seg.points / total) * 100, 0);
          return (
            <motion.div
              key={seg.label}
              className="stacked-score-segment"
              style={{ backgroundColor: seg.color }}
              initial={{ width: prefersReducedMotion ? `${widthPct}%` : 0 }}
              animate={{ width: `${widthPct}%` }}
              transition={{ duration: 0.8, delay: idx * 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
      </div>
      <div className="stacked-score-legend">
        {segments.map((seg) => (
          <span key={seg.label} className="stacked-score-legend-item">
            <span className="stacked-score-swatch" style={{ backgroundColor: seg.color }} />
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
