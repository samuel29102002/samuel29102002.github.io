'use client';

/**
 * RadialOrbitalTimeline — orbital-layout timeline with click-to-expand nodes.
 * Adapted from the 21st.dev radial-orbital pattern.
 *
 * Items are positioned around a central pulse on a circle. Click a node to
 * expand its detail card and highlight related nodes (relatedIds).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OrbitalItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: LucideIcon;
  relatedIds: number[];
  status: 'completed' | 'in-progress' | 'pending';
  energy: number;
}

interface Props {
  items: OrbitalItem[];
  radius?: number;
  className?: string;
}

export default function RadialOrbitalTimeline({
  items,
  radius = 220,
  className,
}: Props) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Auto rotation — never paused by scroll, only by user interaction */
  useEffect(() => {
    if (!autoRotate) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setRotation((r) => (r + dt * 6) % 360); // ~6deg/sec
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate]);

  const positions = useMemo(() => {
    const n = items.length;
    return items.map((item, i) => {
      const angle = (i / n) * 360 + rotation;
      const rad = (angle * Math.PI) / 180;
      return {
        item,
        x: Math.cos(rad) * radius,
        y: Math.sin(rad) * radius,
        angle,
      };
    });
  }, [items, rotation, radius]);

  const activeItem = items.find((it) => it.id === activeId) ?? null;
  const relatedSet = new Set(activeItem?.relatedIds ?? []);

  const statusBadge = (s: OrbitalItem['status']) =>
    s === 'completed'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : s === 'in-progress'
      ? 'bg-accent/15 text-accent border-accent/40'
      : 'bg-muted/15 text-muted border-muted/30';

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full select-none',
        'min-h-[640px] flex items-center justify-center',
        className
      )}
      onMouseEnter={() => setAutoRotate(false)}
      onMouseLeave={() => setAutoRotate(true)}
    >
      {/* Central pulse */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="h-20 w-20 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(212,168,67,0.55) 0%, rgba(212,168,67,0.15) 40%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[0.6rem] uppercase tracking-[0.22em] text-accent">
          SH
        </div>
      </div>

      {/* Orbit ring */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/5"
        style={{ width: radius * 2, height: radius * 2 }}
      />

      {/* Nodes */}
      {positions.map(({ item, x, y }) => {
        const Icon = item.icon;
        const isActive = activeId === item.id;
        const isRelated = relatedSet.has(item.id);
        const dim = activeId !== null && !isActive && !isRelated;

        return (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveId(isActive ? null : item.id);
              setAutoRotate(false);
            }}
            className={cn(
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'group flex flex-col items-center gap-1.5',
              'transition-all duration-500 ease-soft',
              dim ? 'opacity-30' : 'opacity-100'
            )}
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
            aria-label={`${item.title} — ${item.date}`}
          >
            <span
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500',
                isActive
                  ? 'border-accent bg-accent text-bg scale-125 shadow-[0_0_24px_rgba(212,168,67,0.6)]'
                  : isRelated
                  ? 'border-accent/60 bg-accent/15 text-accent'
                  : 'border-border bg-surface text-text group-hover:border-accent/60 group-hover:text-accent'
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span
              className={cn(
                'font-mono text-[0.62rem] uppercase tracking-[0.16em] transition-colors',
                isActive ? 'text-accent' : 'text-muted group-hover:text-text'
              )}
            >
              {item.date}
            </span>
          </button>
        );
      })}

      {/* Detail card */}
      <AnimatePresence mode="wait">
        {activeItem && (
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card pointer-events-auto absolute left-1/2 top-full mt-6 w-[min(420px,90vw)] -translate-x-1/2 p-5"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em]',
                  statusBadge(activeItem.status)
                )}
              >
                {activeItem.status.replace('-', ' ')}
              </span>
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted">
                {activeItem.category}
              </span>
            </div>
            <h3 className="font-display text-xl text-text">{activeItem.title}</h3>
            <p className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">
              {activeItem.date}
            </p>
            <p className="text-sm leading-relaxed text-text/80">{activeItem.content}</p>

            {/* Energy bar */}
            <div className="mt-4 flex items-center gap-3">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted">
                Energy
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${activeItem.energy}%` }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gradient-to-r from-accent-dim to-accent"
                />
              </div>
              <span className="font-mono text-[0.7rem] text-accent">{activeItem.energy}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
