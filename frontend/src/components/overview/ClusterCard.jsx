import React from 'react';
import { Tag } from 'lucide-react';

/**
 * ClusterCard renders an individual customer segment profile returned
 * dynamically by GET /api/clusters.
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

  return (
    <div className={`card cluster-card cluster-card-${cluster_id}`}>
      <div className="cluster-card-header">
        <div className="cluster-id-badge">
          <Tag className="cluster-icon" aria-hidden="true" />
          <span>Segment {cluster_id}</span>
        </div>
      </div>

      <h3 className="cluster-title">{cluster_name}</h3>

      <div className="cluster-body">
        <p className="cluster-desc">{description}</p>
      </div>

      <div className="cluster-footer">
        <span className="cluster-model-pill">FCM Cluster #{cluster_id}</span>
      </div>
    </div>
  );
}
