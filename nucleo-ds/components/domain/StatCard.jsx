import React from 'react';
import { Icon } from '../core/Icon.jsx';

/** Executive metric card for dashboards. */
export function StatCard({ label, value, unit, icon, delta, deltaTone = 'success', hint, style }) {
  const deltaColors = {
    success: 'var(--success-600)', error: 'var(--error-600)', neutral: 'var(--text-secondary)',
  };
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)', padding: 'var(--space-5)',
      display: 'flex', flexDirection: 'column', gap: 14, ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ font: 'var(--font-label)', color: 'var(--text-secondary)' }}>{label}</span>
        {icon && (
          <span style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
          }}>{typeof icon === 'string' ? <Icon name={icon} size={18} /> : icon}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ font: 'var(--font-sans)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extra)', color: 'var(--text-primary)', letterSpacing: 'var(--tracking-tight)', lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ font: 'var(--font-body-sm)', color: 'var(--text-secondary)' }}>{unit}</span>}
      </div>
      {(delta || hint) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--font-body-sm)' }}>
          {delta && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: deltaColors[deltaTone], fontWeight: 'var(--weight-semibold)' }}>
              <Icon name={deltaTone === 'error' ? 'trending-down' : 'trending-up'} size={15} />
              {delta}
            </span>
          )}
          {hint && <span style={{ color: 'var(--text-tertiary)' }}>{hint}</span>}
        </div>
      )}
    </div>
  );
}
