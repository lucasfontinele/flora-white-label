import React from 'react';
import { Badge } from '../core/Badge.jsx';
import { Icon } from '../core/Icon.jsx';
import { STATUS_TONE } from './orderStatus.js';

/**
 * Order summary card (Pedido). Shows number, status, date, item count, delivery type.
 */
export function PedidoCard({ numero, status, data, itens, tipoEntrega, onClick, style }) {
  const tone = STATUS_TONE[status] || 'neutral';
  const entregaIcon = /retirada/i.test(tipoEntrega || '') ? 'store' : 'truck';
  const [hover, setHover] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        transform: hover ? 'translateY(-2px)' : 'none', cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard)',
        display: 'flex', flexDirection: 'column', gap: 16, ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ font: 'var(--font-label)', color: 'var(--text-secondary)', marginBottom: 2 }}>Pedido</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)' }}>{numero}</div>
        </div>
        <Badge tone={tone} dot>{status}</Badge>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <Meta icon="calendar" label="Data" value={data} />
        <Meta icon="boxes" label="Itens" value={`${itens} ${itens === 1 ? 'item' : 'itens'}`} />
        <Meta icon={entregaIcon} label="Entrega" value={tipoEntrega} />
      </div>
    </div>
  );
}

function Meta({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 32, height: 32, borderRadius: 'var(--radius-sm)', flex: 'none',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface-sunken)', color: 'var(--text-secondary)',
      }}><Icon name={icon} size={16} /></span>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>{label}</div>
        <div style={{ font: 'var(--font-body-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}
