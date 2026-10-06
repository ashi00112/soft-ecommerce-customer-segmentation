import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Decorative hero visual: 4 soft, overlapping coloured "cluster clouds"
 * with small dots drifting inside them — some dots sit in the overlap
 * zones, visualising the project's core idea that customers don't fit
 * neatly into a single segment. Purely decorative (aria-hidden); it does
 * not represent any real customer data.
 */
const CLOUDS = [
  { color: 'var(--cloud-1)', left: '12%', top: '18%', size: '62%', dur: 13 },
  { color: 'var(--cloud-2)', left: '42%', top: '8%', size: '54%', dur: 16 },
  { color: 'var(--cloud-3)', left: '24%', top: '46%', size: '56%', dur: 14 },
  { color: 'var(--cloud-4)', left: '46%', top: '40%', size: '50%', dur: 18 },
];

// Hand-placed so a handful of dots visibly sit in the overlap zones
// between clouds ("fence-sitters"), rather than randomly scattered.
const DOTS = [
  { left: '20%', top: '28%', size: 5, dur: 4.5, delay: 0 },
  { left: '28%', top: '22%', size: 4, dur: 5.2, delay: 0.3 },
  { left: '18%', top: '38%', size: 6, dur: 4.8, delay: 0.6 },
  { left: '55%', top: '18%', size: 5, dur: 5.5, delay: 0.2 },
  { left: '62%', top: '26%', size: 4, dur: 4.2, delay: 0.5 },
  { left: '58%', top: '34%', size: 5, dur: 5.8, delay: 0.8 },
  { left: '30%', top: '60%', size: 6, dur: 4.6, delay: 0.4 },
  { left: '38%', top: '68%', size: 4, dur: 5.1, delay: 0.1 },
  { left: '48%', top: '62%', size: 5, dur: 4.9, delay: 0.7 },
  { left: '56%', top: '56%', size: 5, dur: 5.4, delay: 0.35 },
  /* overlap-zone "fence-sitters" */
  { left: '38%', top: '34%', size: 7, dur: 6.2, delay: 0.15 },
  { left: '44%', top: '46%', size: 7, dur: 6.6, delay: 0.45 },
  { left: '34%', top: '50%', size: 6, dur: 5.9, delay: 0.65 },
  { left: '50%', top: '30%', size: 6, dur: 6.1, delay: 0.25 },
];

export default function ClusterCloudsHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="hero-clouds-stage" aria-hidden="true">
      {CLOUDS.map((cloud, idx) => (
        <motion.div
          key={idx}
          className="cloud-blob"
          style={{
            left: cloud.left,
            top: cloud.top,
            width: cloud.size,
            height: cloud.size,
            backgroundColor: cloud.color,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 14, -10, 0],
                  y: [0, -10, 12, 0],
                }
          }
          transition={{ duration: cloud.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {DOTS.map((dot, idx) => (
        <motion.div
          key={idx}
          className="cloud-dot"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }
          }
          transition={{ duration: dot.dur, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="hero-clouds-caption">
        <span>Fuzzy Membership Space</span>
        <span className="caption-lime">Continuous Affinities</span>
      </div>
    </div>
  );
}
