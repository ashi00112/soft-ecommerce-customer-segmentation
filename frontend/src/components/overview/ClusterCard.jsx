import React, { useState } from 'react';
import { Tag, Moon, Sparkles, Crown, Activity } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

// Decorative-only icon per cluster position (1-4). Purely visual — does
// not affect or infer any value from the API response.
const CLUSTER_ICONS = { 1: Moon, 2: Sparkles, 3: Crown, 4: Activity };

/**
 * ClusterCard renders an individual customer segment profile returned
 * dynamically by GET /api/clusters, with a hover lift+tilt and a
 * gentle shimmer sweep.
 *
 * @param {{
 *   cluster: {
 *     cluster_id: number,
 *     cluster_name: string,
 *     description: string
 *   }
 * }} props
 */
export default function ClusterCard({ cluster }) {
  const { cluster_id, cluster_name, description } = cluster;
  const prefersReducedMotion = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const Icon = CLUSTER_ICONS[cluster_id] || Tag;

  return (
    <motion.div
      className={`card cluster-card cluster-card-${cluster_id}`}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -8, rotateX: 4, rotateY: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }
      }
      style={{ transformPerspective: 800 }}
    >
      {!prefersReducedMotion && (
        <motion.span
          className="cluster-card-shimmer"
          animate={hovering ? { x: '220%' } : { x: '-120%' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />
      )}

      <div className="cluster-card-header">
        <div className="cluster-id-badge">
          <span className="cluster-icon-badge">
            <Icon className="cluster-icon" aria-hidden="true" />
          </span>
          <span>Segment {cluster_id}</span>
        </div>
        <span className="cluster-big-num">0{cluster_id}</span>
      </div>

      <h3 className="cluster-title">{cluster_name}</h3>

      <div className="cluster-body">
        <p className="cluster-desc">{description}</p>
      </div>

      <div className="cluster-footer">
        <span className="cluster-model-pill">FCM Cluster #{cluster_id}</span>
      </div>
    </motion.div>
  );
}
