import React from 'react';
import { Layers, Award, BarChart3 } from 'lucide-react';

const CLUSTER_NAMES = {
  1: 'Inactive / High-Churn-Risk Customers',
  2: 'Low-Purchase High-Conversion Customers',
  3: 'High-Value Active Customers',
  4: 'Low-Engagement Customers',
};

const CLUSTER_COLORS = {
  1: '#f43f5e', // Rose
  2: '#f59e0b', // Amber
  3: '#10b981', // Emerald
  4: '#3b82f6', // Blue
};

/**
 * Visualizes continuous Fuzzy C-Means membership degrees across all 4 clusters.
 *
 * @param {{
 *   memberships: { cluster_1: number, cluster_2: number, cluster_3: number, cluster_4: number },
 *   assignedCluster: number,
 *   maxMembership: number,
 *   membershipMargin: number
 * }} props
 */
export default function MembershipDistribution({
  memberships,
  assignedCluster,
  maxMembership,
  membershipMargin,
}) {
  const clusterItems = [1, 2, 3, 4].map((id) => {
    const rawVal = memberships[`cluster_${id}`] || 0;
    const percentage = (rawVal * 100).toFixed(1);
    const isAssigned = assignedCluster === id;
    return {
      id,
      name: CLUSTER_NAMES[id] || `Segment ${id}`,
      value: rawVal,
      percentage: Number(percentage),
      isAssigned,
      color: CLUSTER_COLORS[id],
    };
  });

  return (
    <div className="card result-card">
      <div className="result-card-header">
        <div className="card-title-group">
          <Layers className="result-header-icon text-accent" aria-hidden="true" />
          <div>
            <h3 className="result-card-title">Fuzzy Membership Degrees</h3>
            <p className="result-card-subtitle">
              How strongly this customer aligns with each of the four segments — all values sum to 100%
            </p>
          </div>
        </div>

        <div className="membership-kpis">
          <div className="mini-kpi">
            <span className="mini-kpi-label">Dominant Strength</span>
            <span className="mini-kpi-val text-accent">{(maxMembership * 100).toFixed(1)}%</span>
          </div>
          <div className="mini-kpi">
            <span className="mini-kpi-label">Separation Margin</span>
            <span className="mini-kpi-val text-secondary">+{(membershipMargin * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="membership-bars-list">
        {clusterItems.map((item) => (
          <div
            key={item.id}
            className={`membership-row ${item.isAssigned ? 'dominant-row' : ''}`}
          >
            <div className="membership-label-wrap">
              <div className="membership-cluster-id" style={{ color: item.color }}>
                {item.isAssigned && <Award className="dominant-icon" aria-hidden="true" />}
                <span>Segment {item.id}</span>
              </div>
              <span className="membership-cluster-name">{item.name}</span>
            </div>

            <div className="membership-bar-track">
              <div
                className="membership-bar-fill"
                style={{
                  width: `${Math.max(item.percentage, 1)}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>

            <div className="membership-value-col">
              <span className="membership-pct">{item.percentage}%</span>
              <span className="membership-raw">({item.value.toFixed(4)})</span>
            </div>
          </div>
        ))}
      </div>

      <div className="result-card-footer">
        <p className="footer-explanation">
          Unlike traditional clustering, Fuzzy C-Means lets a customer partially belong to multiple
          segments at once. The highest value is the primary segment, but secondary memberships reveal
          behavioural tendencies toward other archetypes.
        </p>
      </div>
    </div>
  );
}
