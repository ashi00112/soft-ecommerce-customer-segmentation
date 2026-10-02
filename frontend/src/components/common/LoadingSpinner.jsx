import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable loading spinner with accessible status message.
 *
 * @param {{message?: string, size?: 'sm' | 'md' | 'lg'}} props
 */
export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : 'spinner-md';

  return (
    <div className="loading-container" role="status" aria-live="polite">
      <Loader2 className={`spinner-icon ${sizeClass}`} aria-hidden="true" />
      {message && <span className="loading-message">{message}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
