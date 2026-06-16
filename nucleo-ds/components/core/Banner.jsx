import React from 'react';

const tones = {
  info:    { bg: 'var(--info-50)', border: 'var(--info-500)', fg: 'var(--info-600)', icon: 'info' },
  success: { bg: 'var(--success-50)', border: 'var(--success-500)', fg: 'var(--success-600)', icon: 'check-circle-2' },
  warning: { bg: 'var(--warning-50)', border: 'var(--warning-500)', fg: 'var(--warning-600)', icon: 'alert-triangle' },
  error:   { bg: 'var(--error-50)', border: 'var(--error-500)', fg: 'var(--error-600)', icon: 'alert-circle' },
  neutral: { bg: 'var(--neutral-50)', border: 'var(--neutral-300)', fg: 'var(--text-secondary)', icon: 'info' },
};

/** Inline banner / alert. Pass an `icon` node (e.g. <Icon name="shield-check" />) or omit. */
export function Banner({ children, title, tone = 'info', icon, onClose, style }) {
  const t = tones[tone] || tones.info;
  return (
    <div
      role="status"
      style={{
        display: 'flex', gap: 12, padding: '14px 16px',
        background: t.bg, border: `1px solid ${t.border}33`,
        borderLeft: `3px solid ${t.border}`, borderRadius: 'var(--radius-md)',
        ...style,
      }}
    >
      {icon && <span style={{ display: 'inline-flex', color: t.border, flex: 'none', marginTop: 1 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ font: 'var(--font-label)', color: 'var(--text-primary)', marginBottom: 2 }}>{title}</div>}
        <div style={{ font: 'var(--font-body-sm)', color: 'var(--text-secondary)' }}>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Fechar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2, lineHeight: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      )}
    </div>
  );
}
