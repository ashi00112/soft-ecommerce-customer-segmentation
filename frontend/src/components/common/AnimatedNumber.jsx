import React, { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/**
 * Counts a numeric value up from 0 (or from its previous value) whenever
 * `value` changes. Every number it renders is passed in by the caller —
 * it never invents or guesses data, it only animates the transition.
 *
 * @param {{
 *   value: number,
 *   decimals?: number,
 *   suffix?: string,
 *   prefix?: string,
 *   duration?: number,
 *   className?: string
 * }} props
 */
export default function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 1.1,
  className,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0);
  const fromRef = useRef(0);

  useEffect(() => {
    const safeValue = Number.isFinite(value) ? value : 0;

    if (prefersReducedMotion) {
      setDisplay(safeValue);
      fromRef.current = safeValue;
      return;
    }

    const controls = animate(fromRef.current, safeValue, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
      onComplete: () => {
        fromRef.current = safeValue;
      },
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, prefersReducedMotion]);

  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
