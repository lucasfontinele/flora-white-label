import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Badge } from '../core/Badge.jsx';
import { STATUS_TONE } from './orderStatus.js';

/**
 * Delivery tracking panel — current status, ETA, tracking code, history.
 * Layout inspired by Mercado Livre / iFood, in the medical register.
 */
export function DeliveryTracking({ status, ultimaAtualizacao, previsao, codigo, historico = [], style }) {
  const tone = STATUS_TONE[status] || 'info';
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', ...style,
    }}>
      {/* Header band */}
      <div style={{ padding: 'var(--space-5) var(--space-6)', background: 'var(--color-primary-subtle)', borderBottom: '1px solid var(--green-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <span style={{ font: 'var(--font-label)', color: 'var(--green-700)' }}>Acompanhar entrega</span>
          <Badge tone={tone} dot>{status}</Badge>
        </div>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          <Field icon="clock" label="Última atualização" value={ultimaAtualizacao} />
          <Field icon="calendar-check" label="Previsão" value={previsao} />
          <Field icon="hash" label="Código" value={codigo} mono />
        </div>
      </div>

      {/* History */}
      <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
        <div style={{ font: 'var(--font-label)', color: 'var(--text-secondary)', marginBottom: 16 }}>Histórico</div>
        <div>
          {historico.map((h, i) => {
            const last = i === historico.length - 1;
            return (
              <div key={i} style={{ display: 'flex', gap: 14, minHeight: last ? 'auto' : 52 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%', flex: 'none', marginTop: 4,
                    background: i === 0 ? 'var(--color-primary)' : 'var(--neutral-300)',
                    boxShadow: i === 0 ? '0 0 0 4px rgba(99,193,140,0.20)' : 'none',
                  }} />
                  {!last && <span style={{ width: 2, flex: 1, background: 'var(--border-default)', marginTop: 2 }} />}
                </div>
                <div style={{ paddingBottom: last ? 0 : 8 }}>
                  <div style={{ font: 'var(--font-body)', fontWeight: i === 0 ? 600 : 400, color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{h.titulo}</div>
                  <div style={{ font: 'var(--font-body-sm)', color: 'var(--text-tertiary)', marginTop: 1 }}>{h.quando}{h.local ? ` · ${h.local}` : ''}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, value, mono }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ color: 'var(--color-primary)', display: 'inline-flex' }}><Icon name={icon} size={18} /></span>
      <div>
        <div style={{ fontSize: 11, color: 'var(--green-600)', fontWeight: 600 }}>{label}</div>
        <div style={{ font: mono ? 'var(--font-mono)' : 'var(--font-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}
