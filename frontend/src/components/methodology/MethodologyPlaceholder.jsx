import React from 'react';
import { BookOpen, Layers, Activity, ShieldAlert } from 'lucide-react';

/**
 * Basic placeholder component for the Methodology section.
 * Outlines the high-level theoretical framework without detailed interactive formulas.
 */
export default function MethodologyPlaceholder() {
  const frameworks = [
    {
      title: 'Fuzzy C-Means (FCM)',
      tag: 'Clustering Engine',
      desc: 'Formulates soft customer partitioning with K=4 and fuzzifier m=1.10, initialized using K-Means cluster seeds to ensure rapid convergence and stability.',
      icon: Layers,
    },
    {
      title: 'Normalized Membership Entropy',
      tag: 'Ambiguity Metric',
      desc: 'Calculates H_norm = -sum(u_i * ln(u_i)) / ln(K) across the 4 membership degrees. Identifies boundary customers transitioning between behavioural segments.',
      icon: Activity,
    },
    {
      title: '3-Factor Retention Prioritization',
      tag: 'Decision Model',
      desc: 'Synthesizes CLV empirical development reference percentile (40%), Churn Risk Score (0–100) (40%), and Segment Ambiguity Score (Normalized Shannon Entropy) (20%) into an empirical composite priority score (0.0 to 1.0).',
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="methodology-container">
      <div className="card placeholder-card" style={{ marginBottom: '1.5rem' }}>
        <div className="placeholder-icon-wrap">
          <BookOpen className="placeholder-hero-icon" aria-hidden="true" />
        </div>
        <h3 className="placeholder-title">Data Mining Methodology</h3>
        <p className="placeholder-text">
          Theoretical formulations and mathematical reference guides will be fully rendered in a subsequent step.
        </p>
      </div>

      <div className="grid-3">
        {frameworks.map((fw) => {
          const Icon = fw.icon;
          return (
            <div key={fw.title} className="card">
              <div className="card-header">
                <span className="hero-tag" style={{ marginBottom: '0.5rem' }}>{fw.tag}</span>
                <h4 className="card-title" style={{ fontSize: '1.1rem' }}>
                  <Icon className="btn-icon-sm" style={{ color: 'var(--accent-primary)' }} />
                  {fw.title}
                </h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {fw.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
