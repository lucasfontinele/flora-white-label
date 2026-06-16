import React from 'react';

/** Toggle switch — for settings and on/off preferences. */
export function Switch({ checked, defaultChecked = false, onChange, disabled = false, label, id, style }) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(defaultChecked);
  const on = isControlled ? checked : internal;
  const switchId = id || React.useId();

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(!on);
    onChange && onChange(!on);
  };

  const control = (
    <button
      role="switch" aria-checked={on} id={switchId} onClick={toggle} disabled={disabled}
      style={{
        width: 44, height: 26, flex: 'none', borderRadius: 'var(--radius-pill)', border: 'none',
        background: on ? 'var(--color-primary)' : 'var(--neutral-300)', position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, padding: 0,
        transition: 'background var(--duration-normal) var(--ease-standard)', ...style,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%',
        background: '#fff', boxShadow: 'var(--shadow-sm)',
        transition: 'left var(--duration-normal) var(--ease-emphasized)',
      }} />
    </button>
  );

  if (!label) return control;
  return (
    <label htmlFor={switchId} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {control}
      <span style={{ font: 'var(--font-body)', color: 'var(--text-primary)' }}>{label}</span>
    </label>
  );
}
