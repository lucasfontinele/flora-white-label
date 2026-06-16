import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { ORDER_STAGES, STATUS_ICON, stageIndex } from './orderStatus.js';

/**
 * Vertical order timeline — the central component of the system.
 * Shows the 7 lifecycle stages with the current position highlighted.
 */
export function OrderTimeline({ current, timestamps = {}, stages = ORDER_STAGES, style }) {
  const currentIdx = stageIndex(current);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {stages.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const last = i === stages.length - 1;

        const dotBg = done ? 'var(--color-primary)' : active ? 'var(--surface-card)' : 'var(--surface-card)';
        const dotBorder = done ? 'var(--color-primary)' : active ? 'var(--color-accent)' : 'var(--border-default)';
        const iconColor = done ? '#fff' : active ? 'var(--color-accent-strong)' : 'var(--text-tertiary)';
        const lineColor = i < currentIdx ? 'var(--color-primary)' : 'var(--border-default)';

        return (
          <div key={stage} style={{ display: 'flex', gap: 14, minHeight: last ? 'auto' : 56 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                width: 32, height: 32, borderRadius: '50%', flex: 'none',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: dotBg, border: `2px solid ${dotBorder}`,
                boxShadow: active ? '0 0 0 4px rgba(99,193,140,0.20)' : 'none',
                transition: 'all var(--duration-normal) var(--ease-standard)',
              }}>
                <Icon name={done ? 'check' : (STATUS_ICON[stage] || 'circle')} size={16} color={iconColor} strokeWidth={done ? 3 : 1.9} />
              </span>
              {!last && <span style={{ width: 2, flex: 1, background: lineColor, marginTop: 2 }} />}
            </div>
            <div style={{ paddingBottom: last ? 0 : 12, paddingTop: 5 }}>
              <div style={{
                font: 'var(--font-body)', fontWeight: active || done ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                color: active ? 'var(--green-700)' : done ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}>{stage}</div>
              {timestamps[stage] && (
                <div style={{ font: 'var(--font-body-sm)', color: 'var(--text-secondary)', marginTop: 1 }}>{timestamps[stage]}</div>
              )}
              {active && !timestamps[stage] && (
                <div style={{ font: 'var(--font-body-sm)', color: 'var(--color-accent-strong)', marginTop: 1 }}>Em andamento</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
