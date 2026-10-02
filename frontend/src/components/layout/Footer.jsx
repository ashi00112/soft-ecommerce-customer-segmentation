import React from 'react';

/**
 * Standard Application Footer.
 * References course curriculum and project title.
 */
export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <p className="footer-title">
            <span className="footer-brand-name">SegmentFlow</span>
            <span className="footer-lime-dot" aria-hidden="true" />
            <span className="footer-sep">•</span>
            <span className="footer-tagline">Soft Customer Segmentation &amp; Retention Intelligence</span>
          </p>
          <p className="footer-academic">
            Academic Data Mining Project
          </p>
        </div>
        <div className="footer-right">
          <span className="footer-badge">
            Fuzzy C-Means (K=4, m=1.10) • Normalized Entropy • 3-Factor Retention
          </span>
        </div>
      </div>
    </footer>
  );
}
