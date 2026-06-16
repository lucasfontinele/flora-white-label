import React from 'react';

/** Checkbox with optional label. Controlled or uncontrolled. */
export function Checkbox({ checked, defaultChecked = false, onChange, disabled = false, label, id, style }) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const boxId = id || React.useId();

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange && onChange(!on);
  };

  return (
    <label htmlFor={boxId} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1 }}>
      <button
        id={boxId} role="checkbox" aria-checked={on} onClick={toggle} disabled={disabled}
        style={{
          width: 20, height: 20, flex: 'none', borderRadius: 'var(--radius-xs)', padding: 0,
          background: on ? 'var(--color-primary)' : 'var(--surface-card)',
          border: `1.5px solid ${on ? 'var(--color-primary)' : 'var(--border-default)'}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
          ...style,
        }}
      >
        {on && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        )}
      </button>
      {label && <span style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>{label}</span>}
    </label>
  );
}
