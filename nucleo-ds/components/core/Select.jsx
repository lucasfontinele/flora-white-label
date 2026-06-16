import React from 'react';

/** Native select styled to match Núcleo inputs. */
export function Select({ label, hint, error, options = [], id, size = 'md', style, containerStyle, disabled, children, ...rest }) {
  const selectId = id || React.useId();
  const [focused, setFocused] = React.useState(false);
  const heights = { sm: 38, md: 44, lg: 50 };
  const h = heights[size] || 44;
  const borderColor = error ? 'var(--color-error)' : focused ? 'var(--color-accent)' : 'var(--border-default)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...containerStyle }}>
      {label && <label htmlFor={selectId} style={{ font: 'var(--font-label)', color: 'var(--text-primary)' }}>{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <select
          id={selectId}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            appearance: 'none', WebkitAppearance: 'none', width: '100%', height: h,
            padding: '0 40px 0 14px', font: 'var(--font-body)', color: 'var(--text-primary)',
            background: disabled ? 'var(--surface-sunken)' : 'var(--surface-card)',
            border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-md)',
            boxShadow: focused ? 'var(--focus-ring)' : 'var(--shadow-xs)', outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)',
            ...style,
          }}
          {...rest}
        >
          {children || options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{ position: 'absolute', right: 12, pointerEvents: 'none' }}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      {(error || hint) && <span style={{ font: 'var(--font-body-sm)', color: error ? 'var(--color-error)' : 'var(--text-secondary)' }}>{error || hint}</span>}
    </div>
  );
}
