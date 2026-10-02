import React from 'react';
import { AlertCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';

/**
 * Reusable alert message banner for error, warning, or informative states.
 *
 * @param {{
 *   type?: 'error' | 'warning' | 'info',
 *   title?: string,
 *   message: string,
 *   onRetry?: () => void,
 *   retryLabel?: string
 * }} props
 */
export default function AlertMessage({
  type = 'error',
  title,
  message,
  onRetry,
  retryLabel = 'Retry',
}) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="alert-icon text-warning" aria-hidden="true" />;
      case 'info':
        return <Info className="alert-icon text-info" aria-hidden="true" />;
      case 'error':
      default:
        return <AlertCircle className="alert-icon text-error" aria-hidden="true" />;
    }
  };

  return (
    <div className={`alert-box alert-${type}`} role="alert">
      <div className="alert-content">
        <div className="alert-icon-wrapper">{getIcon()}</div>
        <div className="alert-text">
          {title && <h4 className="alert-title">{title}</h4>}
          <p className="alert-description">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary btn-sm alert-retry-btn"
        >
          <RefreshCw className="btn-icon-sm" aria-hidden="true" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}
