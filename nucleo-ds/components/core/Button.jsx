import React from 'react';

const sizes = {
  sm: { padding: '0 14px', height: 36, fontSize: 'var(--text-sm)', gap: 6, radius: 'var(--radius-sm)' },
  md: { padding: '0 18px', height: 44, fontSize: 'var(--text-base)', gap: 8, radius: 'var(--radius-md)' },
  lg: { padding: '0 24px', height: 52, fontSize: 'var(--text-md)', gap: 10, radius: 'var(--radius-md)' },
};

const variants = {
  primary: {
    background: 'var(--color-primary)', color: 'var(--color-on-primary)',
    border: '1px solid transparent', boxShadow: 'var(--shadow-primary)',
    '--hover-bg': 'var(--color-primary-hover)', '--active-bg': 'var(--color-primary-active)',
  },
  secondary: {
    background: 'var(--surface-card)', color: 'var(--text-primary)',
    border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xs)',
    '--hover-bg': 'var(--surface-sunken)', '--active-bg': 'var(--neutral-200)',
  },
  ghost: {
    background: 'transparent', color: 'var(--color-primary)',
    border: '1px solid transparent', boxShadow: 'none',
    '--hover-bg': 'var(--color-primary-subtle)', '--active-bg': 'var(--green-100)',
  },
  danger: {
    background: 'var(--color-error)', color: '#fff',
    border: '1px solid transparent', boxShadow: 'none',
    '--hover-bg': 'var(--error-600)', '--active-bg': 'var(--error-600)',
  },
};

/**
 * Núcleo primary action button. Sentence-case, verb-led labels.
 */
export function Button({
  children, variant = 'primary', size = 'md', leftIcon, rightIcon,
  fullWidth = false, loading = false, disabled = false, type = 'button',
  style, onClick, ...rest
}) {
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;

  const handleEnter = (e) => { if (!isDisabled) e.currentTarget.style.background = v['--hover-bg']; };
  const handleLeave = (e) => { if (!isDisabled) e.currentTarget.style.background = v.background; };
  const handleDown  = (e) => { if (!isDisabled) e.currentTarget.style.background = v['--active-bg']; };
  const handleUp    = (e) => { if (!isDisabled) e.currentTarget.style.background = v['--hover-bg']; };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, height: s.height, padding: s.padding, width: fullWidth ? '100%' : 'auto',
        font: 'var(--font-sans)', fontSize: s.fontSize, fontWeight: 'var(--weight-semibold)',
        lineHeight: 1, letterSpacing: 'var(--tracking-snug)', whiteSpace: 'nowrap',
        background: v.background, color: v.color, border: v.border, boxShadow: v.boxShadow,
        borderRadius: s.radius, cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        transition: 'background var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {loading
        ? <Spinner />
        : leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
    </button>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 16, height: 16, borderRadius: '50%',
      border: '2px solid currentColor', borderTopColor: 'transparent',
      display: 'inline-block', animation: 'nucleo-spin 0.6s linear infinite',
    }}>
      <style>{`@keyframes nucleo-spin{to{transform:rotate(360deg)}}`}</style>
    </span>
  );
}
