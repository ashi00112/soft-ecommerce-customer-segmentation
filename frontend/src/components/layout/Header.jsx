import React from 'react';
import { Layers, LayoutDashboard, UserCheck, BookOpen, Activity, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Top Application Header and Navigation Bar.
 * Displays title, active section tabs, and live backend/model health status.
 *
 * @param {{
 *   activeTab: string,
 *   onSelectTab: (tab: string) => void,
 *   healthStatus: 'checking' | 'healthy' | 'offline',
 *   healthData: {status: string, model_loaded: boolean, algorithm: string, n_clusters: number} | null,
 *   onRefreshHealth: () => void
 * }} props
 */
export default function Header({
  activeTab,
  onSelectTab,
  healthStatus,
  healthData,
  onRefreshHealth,
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analysis', label: 'Customer Analysis', icon: UserCheck },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
  ];

  const getStatusBadge = () => {
    if (healthStatus === 'checking') {
      return (
        <div className="status-badge status-checking" title="Contacting FastAPI backend...">
          <span className="status-dot dot-checking" />
          <span className="status-label">Checking...</span>
        </div>
      );
    }

    if (healthStatus === 'healthy' && healthData) {
      const algorithmShort = healthData.algorithm === 'Fuzzy C-Means' ? 'FCM' : healthData.algorithm;
      return (
        <div className="status-badge status-healthy" title="Backend and Fuzzy C-Means pipeline operational">
          <span className="status-dot dot-healthy" />
          <span className="status-label">Healthy</span>
          <span className="status-meta">
            {algorithmShort} • {healthData.n_clusters} Clusters
          </span>
        </div>
      );
    }

    return (
      <div className="status-badge status-offline" title="Backend offline or unreachable">
        <span className="status-dot dot-offline" />
        <span className="status-label">Offline</span>
        <button
          type="button"
          onClick={onRefreshHealth}
          className="status-retry-btn"
          title="Retry connecting to backend"
          aria-label="Retry connecting to backend"
        >
          <RefreshCw className="status-retry-icon" />
        </button>
      </div>
    );
  };

  return (
    <header className="app-header">
      <div className="container header-inner">
        <div className="brand">
          <div className="brand-logo">
            <Layers className="brand-icon" aria-hidden="true" />
            <span className="brand-dot" aria-hidden="true" />
          </div>
          <div className="brand-titles">
            <div className="brand-title-row">
              <span className="brand-name">SegmentFlow</span>
              <span className="brand-badge">Intelligence</span>
            </div>
            <p className="brand-subtitle">
              Soft Customer Segmentation &amp; Retention Intelligence
            </p>
          </div>
        </div>

        <div className="header-right">
          <nav className="nav-tabs" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="nav-tab-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="header-status">
            {getStatusBadge()}
          </div>
        </div>
      </div>
    </header>
  );
}
