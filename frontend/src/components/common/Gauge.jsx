import React, { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/**
 * Generic SVG arc gauge. Covers both the ambiguity semicircle (sweep=180,
 * rotation=180, with an optional threshold tick) and the retention score
 * ring (sweep=360, rotation=-90). Purely presentational — `value`/`max`
 * are always supplied by the caller from the live API response.
 *
 * @param {{
 *   value: number,
 *   max?: number,
 *   size?: number,
 *   strokeWidth?: number,
 *   sweep?: number,
 *   rotation?: number,
 *   trackColor?: string,
 *   fillColor?: string,
 *   thresholdFraction?: number | null,
 *   thresholdColor?: string,
 *   children?: React.ReactNode
 * }} props
 */
export default function Gauge({
  value,
  max = 1,
  size = 160,
  strokeWidth = 14,
  sweep = 360,
  rotation = -90,
  trackColor = 'rgba(255,255,255,0.25)',
  fillColor = '#C6FF33',
  thresholdFraction = null,
  thresholdColor = '#FFFFFF',
  children,
}) {
  const prefersReducedMotion = useReducedMotion();
  const fraction = Math.min(Math.max((Number(value) || 0) / max, 0), 1);

  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const trackLen = circumference * (sweep / 360);

  const [fillLen, setFillLen] = useState(prefersReducedMotion ? trackLen * fraction : 0);
  const fromRef = useRef(0);

  useEffect(() => {
    const target = trackLen * fraction;
    if (prefersReducedMotion) {
      setFillLen(target);
      fromRef.current = target;
      return;
    }
    const controls = animate(fromRef.current, target, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setFillLen(latest),
      onComplete: () => {
        fromRef.current = target;
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fraction, trackLen, prefersReducedMotion]);

  let tick = null;
  if (thresholdFraction !== null && thresholdFraction !== undefined) {
    const thetaDeg = rotation + thresholdFraction * sweep;
    const theta = (thetaDeg * Math.PI) / 180;
    const inner = r - strokeWidth / 2 - 3;
    const outer = r + strokeWidth / 2 + 5;
    tick = {
      x1: cx + inner * Math.cos(theta),
      y1: cy + inner * Math.sin(theta),
      x2: cx + outer * Math.cos(theta),
      y2: cy + outer * Math.sin(theta),
    };
  }

  return (
    <div className="gauge-wrapper" style={{ width: size, height: size }}>
      <svg
        className="gauge-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-hidden="true"
      >
        <circle
          className="gauge-track"
          cx={cx}
          cy={cy}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${trackLen} ${circumference - trackLen}`}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        <circle
          className="gauge-fill"
          cx={cx}
          cy={cy}
          r={r}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${fillLen} ${circumference - fillLen}`}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        {tick && (
          <line
            className="gauge-threshold-tick"
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={thresholdColor}
            strokeWidth={2.5}
          />
        )}
      </svg>
      {children && <div className="gauge-center-label">{children}</div>}
    </div>
  );
}
