import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Fade + slide-up reveal wrapper triggered once when scrolled into view.
 * Accepts an `index` to stagger siblings rendered in a loop.
 *
 * @param {{
 *   children: React.ReactNode,
 *   index?: number,
 *   as?: keyof JSX.IntrinsicElements,
 *   className?: string,
 *   y?: number
 * }} props
 */
export default function RevealOnScroll({ children, index = 0, as = 'div', className, y = 24, ...rest }) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (prefersReducedMotion) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
