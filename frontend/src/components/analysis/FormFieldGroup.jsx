import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Accessible form field group rendering label, input/select control,
 * optional helper text, and field-level validation error message.
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
  error,
  required = false,
  step,
  min,
  max,
}) {
  const isInvalid = Boolean(error);
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={`form-field-group ${isInvalid ? 'has-error' : ''}`}>
      <label htmlFor={id} className="field-label">
        <span className="label-text">{label}</span>
        {required ? (
          <span className="required-indicator" aria-hidden="true">*</span>
        ) : (
          <span className="optional-tag">(Optional)</span>
        )}
      </label>

      <div className="input-wrapper">
        {type === 'select' ? (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
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
