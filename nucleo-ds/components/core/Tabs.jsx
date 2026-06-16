import React from 'react';

/** Horizontal tab bar. Controlled via `value`/`onChange` or uncontrolled. */
export function Tabs({ tabs = [], value, defaultValue, onChange, style }) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? tabs[0]?.value);
  const active = isControlled ? value : internal;

  const select = (v) => {
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
  };

  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)', ...style }}>
      {tabs.map((t) => {
        const on = t.value === active;
        return (
          <button
            key={t.value}
            onClick={() => select(t.value)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              font: 'var(--font-sans)', fontSize: 'var(--text-sm)',
              fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)',
              color: on ? 'var(--green-700)' : 'var(--text-secondary)',
              borderBottom: `2px solid ${on ? 'var(--color-primary)' : 'transparent'}`,
              marginBottom: -1,
              transition: 'color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
            }}
          >
            {t.icon}
            {t.label}
            {t.count != null && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 'var(--radius-pill)',
                background: on ? 'var(--color-primary-subtle)' : 'var(--neutral-100)',
                color: on ? 'var(--green-700)' : 'var(--text-secondary)',
              }}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
