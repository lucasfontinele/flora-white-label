import React from 'react';

function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

/** User/patient avatar — image or initials. */
export function Avatar({ name = '', src, size = 40, tone = 'primary', style, ...rest }) {
  const palettes = {
    primary: { bg: 'var(--green-100)', fg: 'var(--green-700)' },
    petrol:  { bg: 'var(--petrol-100)', fg: 'var(--petrol-600)' },
    neutral: { bg: 'var(--neutral-200)', fg: 'var(--neutral-700)' },
  };
  const p = palettes[tone] || palettes.primary;
  return (
    <span
      style={{
        width: size, height: size, flex: 'none', borderRadius: '50%', overflow: 'hidden',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: p.bg, color: p.fg, fontWeight: 'var(--weight-semibold)',
        fontSize: Math.round(size * 0.4), fontFamily: 'var(--font-sans)',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)', ...style,
      }}
      {...rest}
    >
      {src
        ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials(name)}
    </span>
  );
}
