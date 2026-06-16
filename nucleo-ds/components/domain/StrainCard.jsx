import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Badge } from '../core/Badge.jsx';

/**
 * Educational catalogue card for a product/strain. Netflix/Steam-style cover
 * with medicinal data (THC, CBD, terpenes, tags). Informational, never advisory.
 */
export function StrainCard({ nome, tipo, imagem, thc, cbd, terpenos = [], tags = [], onClick, style }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)', overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-xs)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard)',
        display: 'flex', flexDirection: 'column', ...style,
      }}
    >
      {/* Cover */}
      <div style={{
        height: 150, position: 'relative',
        background: imagem ? `center/cover no-repeat url(${imagem})` : 'linear-gradient(135deg, var(--green-100), var(--petrol-100))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {!imagem && <Icon name="flask-conical" size={40} color="var(--green-500)" />}
        {tipo && (
          <span style={{ position: 'absolute', top: 12, left: 12 }}>
            <Badge tone="petrol" size="sm">{tipo}</Badge>
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ font: 'var(--font-heading)', fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>{nome}</div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Metric label="THC" value={thc} />
          <Metric label="CBD" value={cbd} />
        </div>

        {terpenos.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', marginBottom: 6 }}>Terpenos</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {terpenos.map((t) => (
                <span key={t} style={{ font: 'var(--font-body-sm)', color: 'var(--text-secondary)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-pill)', padding: '3px 10px' }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
            {tags.map((t) => <Badge key={t} tone="primary" size="sm">{t}</Badge>)}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ flex: 1, background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: 'var(--tracking-wide)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--green-700)' }}>{value}</div>
    </div>
  );
}
