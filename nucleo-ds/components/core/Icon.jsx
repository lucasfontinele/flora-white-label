import React from 'react';

/**
 * Núcleo icon — thin wrapper over Lucide outline icons.
 * Requires the Lucide UMD script loaded on the page:
 *   <script src="https://unpkg.com/lucide@latest"></script>
 */
export function Icon({ name, size = 20, strokeWidth = 1.75, color = 'currentColor', style, ...rest }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    const paint = () => {
      const el = ref.current;
      if (!el || cancelled) return false;
      if (!window.lucide || !window.lucide.createIcons) return false;
      el.innerHTML = `<i data-lucide="${name}"></i>`;
      window.lucide.createIcons();
      const svg = el.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('stroke-width', strokeWidth);
        svg.style.display = 'block';
      }
      return true;
    };
    if (!paint()) {
      const id = setInterval(() => { if (paint()) clearInterval(id); }, 80);
      setTimeout(() => clearInterval(id), 4000);
      return () => { cancelled = true; clearInterval(id); };
    }
    return () => { cancelled = true; };
  }, [name, size, strokeWidth]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      style={{ display: 'inline-flex', width: size, height: size, color, flex: 'none', ...style }}
      {...rest}
    />
  );
}
