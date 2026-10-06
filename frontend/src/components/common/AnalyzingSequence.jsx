import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sliders, Layers, ShieldAlert } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const STEPS = [
  { label: 'Validating customer attributes', icon: Sliders },
  { label: 'Running Fuzzy C-Means segment assignment', icon: Layers },
  { label: 'Scoring retention priority', icon: ShieldAlert },
];

/**
 * Polished multi-step "Analysing customer…" loading sequence shown while
 * POST /api/predict is in flight. Purely a visual loading indicator — it
 * does not simulate or guess the backend's actual result.
 */
export default function AnalyzingSequence() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1 < STEPS.length ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <div className="analyzing-sequence" role="status" aria-live="polite">
      <span className="sr-only">Analysing customer, please wait…</span>
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < activeIndex;
        const isActive = idx === activeIndex;
        return (
          <motion.div
            key={step.label}
            className={`analyzing-step ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
            initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.12, duration: 0.4 }}
          >
            <span className="analyzing-step-icon-wrap">
              {isDone ? (
                <CheckCircle2 className="analyzing-step-icon" aria-hidden="true" />
              ) : isActive ? (
                <Loader2 className="analyzing-step-icon spinner-icon" aria-hidden="true" />
              ) : (
                <Icon className="analyzing-step-icon" aria-hidden="true" />
              )}
            </span>
            <span className="analyzing-step-label">{step.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
