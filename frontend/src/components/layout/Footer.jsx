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
            Soft E-commerce Customer Segmentation &amp; Retention Prioritization
          </p>
          <p className="footer-course">
            IT3051 Fundamentals of Data Mining
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
