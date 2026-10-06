import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import InfoTooltip from '../common/InfoTooltip';

/**
 * Accessible form field group rendering label, input/select control,
 * optional helper text, optional plain-language tooltip, and field-level
 * validation error message (with a brief shake when a new error appears).
 *
 * @param {{
 *   id: string,
 *   name: string,
 *   label: string,
 *   type?: 'text' | 'number' | 'select',
 *   value: string,
 *   onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
 *   placeholder?: string,
 *   options?: Array<{ value: string, label: string }>,
 *   helperText?: string,
 *   tooltip?: string,
 *   error?: string,
 *   required?: boolean,
 *   step?: string,
 *   min?: string | number,
 *   max?: string | number
 * }} props
 */
export default function FormFieldGroup({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  options = [],
  helperText,
  tooltip,
  error,
  required = false,
  step,
  min,
  max,
}) {
  const isInvalid = Boolean(error);
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const prefersReducedMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const prevErrorRef = useRef(error);

  useEffect(() => {
    if (isInvalid && !prevErrorRef.current && !prefersReducedMotion) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(timer);
    }
    prevErrorRef.current = error;
    return undefined;
  }, [error, isInvalid, prefersReducedMotion]);

  return (
    <div className={`form-field-group ${isInvalid ? 'has-error' : ''} ${shake ? 'field-shake' : ''}`}>
      <label htmlFor={id} className="field-label">
        <span className="label-text">{label}</span>
        {required ? (
          <span className="required-indicator" aria-hidden="true">*</span>
        ) : (
          <span className="optional-tag">(Optional)</span>
        )}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>

      <div className="input-wrapper">
        {type === 'select' ? (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`form-select ${isInvalid ? 'input-error' : ''}`}
            aria-invalid={isInvalid}
            aria-describedby={
              [isInvalid ? errorId : null, helperText ? helperId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            className={`form-input ${isInvalid ? 'input-error' : ''}`}
            aria-invalid={isInvalid}
            aria-describedby={
              [isInvalid ? errorId : null, helperText ? helperId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
        )}
        {!prefersReducedMotion && (
          <motion.span
            className="field-focus-underline"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 2,
              background: 'var(--color-violet)',
              borderRadius: 2,
            }}
            initial={{ width: '0%' }}
            animate={{ width: focused ? '100%' : '0%' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </div>

      {helperText && (
        <p id={helperId} className="field-helper-text">
          {helperText}
        </p>
      )}

      {isInvalid && (
        <div id={errorId} className="field-error-message" role="alert">
          <AlertCircle className="error-icon" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
