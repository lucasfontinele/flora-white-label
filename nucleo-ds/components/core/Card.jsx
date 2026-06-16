import React from 'react';

/** Card surface. The default Núcleo container: white, soft radius, hairline + discreet shadow. */
export function Card({ children, padding = 'var(--space-5)', interactive = false, elevated = false, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: hover ? 'var(--shadow-md)' : (elevated ? 'var(--shadow-sm)' : 'var(--shadow-xs)'),
        padding,
        cursor: interactive ? 'pointer' : 'default',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow var(--duration-normal) var(--ease-standard), transform var(--duration-normal) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
