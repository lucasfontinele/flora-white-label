import React from 'react';

/**
 * Text input with label, helper/error text and optional leading icon.
 */
export function Input({
  label, hint, error, leadingIcon, trailingIcon, id,
  size = 'md', style, containerStyle, disabled, ...rest
}) {
  const inputId = id || React.useId();
  const [focused, setFocused] = React.useState(false);
  const heights = { sm: 38, md: 44, lg: 50 };
  const h = heights[size] || 44;
  const borderColor = error ? 'var(--color-error)' : focused ? 'var(--color-accent)' : 'var(--border-default)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...containerStyle }}>
      {label && (
        <label htmlFor={inputId} style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: h, padding: '0 14px',
        background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
        border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-md)',
        boxShadow: focused ? 'var(--focus-ring)' : 'var(--shadow-xs)',
        transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
      }}>
        {leadingIcon && <span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}>{leadingIcon}</span>}
        <input
          id={inputId}
          disabled={disabled}
          onFocus={(e) => { setFocused(true); rest.onFocus && rest.onFocus(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur && rest.onBlur(e); }}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            font: 'var(--font-body)', color: 'var(--text-primary)', height: '100%',
            ...style,
          }}
          {...rest}
        />
        {trailingIcon && <span style={{ display: 'inline-flex', color: 'var(--text-tertiary)' }}>{trailingIcon}</span>}
      </div>
      {(error || hint) && (
        <span style={{ font: 'var(--font-body-sm)', color: error ? 'var(--color-error)' : 'var(--text-secondary)' }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
