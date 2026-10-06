import React, { useState, useId } from 'react';
import { Info } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Small, keyboard-accessible "what does this mean?" popover for
 * explaining a metric to non-technical readers in plain language.
 *
 * @param {{ text: string }} props
 */
export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className="info-tooltip">
      <button
        type="button"
        className="info-tooltip-trigger"
        aria-describedby={id}
        aria-expanded={open}
        aria-label="What does this mean?"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Info className="info-tooltip-icon" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            className="info-tooltip-popover"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
