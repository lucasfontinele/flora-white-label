import React from 'react';

const tones = {
  neutral: { bg: 'var(--neutral-100)', fg: 'var(--neutral-700)', dot: 'var(--neutral-400)' },
  primary: { bg: 'var(--color-primary-subtle)', fg: 'var(--green-700)', dot: 'var(--green-500)' },
  accent:  { bg: '#E4F6EC', fg: 'var(--accent-600)', dot: 'var(--accent-500)' },
  success: { bg: 'var(--success-50)', fg: 'var(--success-600)', dot: 'var(--success-500)' },
  warning: { bg: 'var(--warning-50)', fg: 'var(--warning-600)', dot: 'var(--warning-500)' },
  error:   { bg: 'var(--error-50)', fg: 'var(--error-600)', dot: 'var(--error-500)' },
  info:    { bg: 'var(--info-50)', fg: 'var(--info-600)', dot: 'var(--info-500)' },
  petrol:  { bg: 'var(--petrol-50)', fg: 'var(--petrol-600)', dot: 'var(--petrol-500)' },
};

/** Small status pill. Use a dot for live order/document states. */
export function Badge({ children, tone = 'neutral', dot = false, size = 'md', style, ...rest }) {
  const t = tones[tone] || tones.neutral;
  const sm = size === 'sm';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: sm ? 5 : 6,
        height: sm ? 22 : 26, padding: sm ? '0 8px' : '0 10px',
        background: t.bg, color: t.fg, borderRadius: 'var(--radius-pill)',
        font: 'var(--font-sans)', fontSize: sm ? '11px' : 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-snug)',
        whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >
      {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.dot, flex: 'none' }} />}
      {children}
    </span>
  );
}
