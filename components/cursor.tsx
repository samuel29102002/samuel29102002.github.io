'use client';

/**
 * Crosshair cursor — 16×16 red SVG, follows mousemove via direct DOM
 * mutation (no React state, no lag). Hidden on touch / narrow viewports
 * via .custom-cursor display rules in globals.css.
 */

import { useEffect, useRef } from 'react';

export default function CrosshairCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX - 8}px, ${e.clientY - 8}px, 0)`;
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div ref={ref} className="custom-cursor" aria-hidden>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <line x1="8" y1="0" x2="8" y2="6" stroke="#e61919" strokeWidth="1" />
        <line x1="8" y1="10" x2="8" y2="16" stroke="#e61919" strokeWidth="1" />
        <line x1="0" y1="8" x2="6" y2="8" stroke="#e61919" strokeWidth="1" />
        <line x1="10" y1="8" x2="16" y2="8" stroke="#e61919" strokeWidth="1" />
      </svg>
    </div>
  );
}
