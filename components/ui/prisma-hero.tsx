'use client';

/**
 * PrismaHero — Industrial Brutalist hero. No WebGL blobs.
 * Full-width OSWALD name, status bar, stats grid.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/* ── Particle scatter ── */
interface Particle { id: number; x: number; y: number; angle: number; dist: number; }

let _particleId = 0;

function ParticleLayer({ particles }: { particles: Particle[] }) {
  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="pointer-events-none absolute z-20 block h-1 w-1 bg-accent"
          initial={{ x: p.x, y: p.y, scale: 1, opacity: 0.9 }}
          animate={{
            x: p.x + Math.cos(p.angle) * p.dist,
            y: p.y + Math.sin(p.angle) * p.dist,
            scale: 0,
            opacity: 0,
          }}
          exit={{}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}
    </AnimatePresence>
  );
}

/* ── Blinking cursor ── */
function Cursor() {
  return (
    <span
      className="inline-block w-[0.55em] bg-accent align-text-bottom"
      style={{ height: '0.82em', animation: 'terminal-blink 1s step-end infinite' }}
    />
  );
}

/* ── Ticker line ── */
const TICKER_ITEMS = [
  'QUANT DATA SCIENCE',
  'MSC TÜBINGEN',
  'ML & FINANCE',
  'WERKSTUDENT · SCHWARZ GROUP',
  'PYTHON · R · PYTORCH',
  'OPEN TO OPPORTUNITIES',
];

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-t border-b border-border py-2">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted">
            {item}
            <span className="mx-6 text-accent">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function PrismaHero() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const scatter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const burst: Particle[] = Array.from({ length: 14 }, () => ({
      id: _particleId++,
      x: cx,
      y: cy,
      angle: Math.random() * Math.PI * 2,
      dist: 40 + Math.random() * 70,
    }));
    setParticles((prev) => [...prev, ...burst]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => !burst.includes(p))), 800);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col bg-bg"
    >
      <ParticleLayer particles={particles} />

      {/* ── Status bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center justify-between border-b border-border px-6 py-2 lg:px-12"
      >
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted">
          [ STATUS: <span className="text-accent">ONLINE</span> ]
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted">
          TÜB · DE · {new Date().getFullYear()}
        </span>
      </motion.div>

      {/* ── Main content ── */}
      <div className="relative flex flex-1 flex-col justify-center px-6 lg:px-12">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-4 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted"
        >
          <span className="h-px w-8 bg-accent" />
          <span>Portfolio · v2025</span>
        </motion.div>

        {/* HUGE name — click to scatter */}
        <div
          onClick={scatter}
          className="cursor-default select-none overflow-hidden"
        >
          <motion.h1
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold uppercase leading-none tracking-tighter text-text"
            style={{ fontSize: 'clamp(4.5rem, 14vw, 14rem)' }}
          >
            SAMUEL
          </motion.h1>
          <motion.h1
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold uppercase leading-none tracking-tighter"
            style={{ fontSize: 'clamp(4.5rem, 14vw, 14rem)' }}
          >
            <span className="text-text">HEIN</span>
            <span className="text-accent">RICH</span>
          </motion.h1>
        </div>

        {/* Subtitle row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3"
        >
          <p className="font-mono text-sm text-muted">
            Builds models. Studies quant data science in Tübingen. <Cursor />
          </p>
        </motion.div>

        {/* CTA buttons — sharp corners, no border-radius */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 border border-text bg-text px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-bg transition-all duration-200 hover:bg-transparent hover:text-text"
          >
            Projects
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <a
            href="https://github.com/samuel29102002"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 border border-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent transition-all duration-200 hover:bg-accent hover:text-bg"
          >
            GitHub
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>

      {/* ── Ticker ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <Ticker />
      </motion.div>

      {/* ── Stats grid ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="grid grid-cols-2 border-t border-border sm:grid-cols-4"
      >
        {[
          { label: 'Degree', value: 'M.Sc.' },
          { label: 'Field', value: 'Quant DS' },
          { label: 'Work', value: 'Schwarz' },
          { label: 'Location', value: 'TÜB/STR' },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className={`px-6 py-4 ${i < 3 ? 'border-r border-border' : ''}`}
          >
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted">
              {label}
            </div>
            <div className="mt-1 font-display text-lg font-bold uppercase tracking-tight text-text">
              {value}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
