'use client';

/**
 * PrismaHero — Industrial Brutalist hero with Fable5 entrance choreography.
 * Boot sequence: status bar → SAMUEL letterpress → HEINRICH (+120ms) →
 * subtitle → CTAs → double ticker → stats row.
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

/* ── Letterpress reveal — per-letter blur + lift ── */
function Letterpress({ word, baseDelay }: { word: string; baseDelay: number }) {
  return (
    <>
      {word.split('').map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: 80, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{
            duration: 0.6,
            delay: baseDelay + i * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {ch}
        </motion.span>
      ))}
    </>
  );
}

/* ── Character scramble — settles to final text ── */
function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);
  const started = useRef(false);
  const interval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        obs.disconnect();
        const frames = 20; // 600ms at 30ms per frame
        let f = 0;
        interval.current = setInterval(() => {
          f++;
          const settled = Math.floor((f / frames) * text.length);
          setDisplay(
            text
              .split('')
              .map((ch, i) =>
                i < settled || ch === ' ' || ch === '.'
                  ? ch
                  : String.fromCharCode(33 + Math.floor(Math.random() * 94))
              )
              .join('')
          );
          if (f >= frames) {
            clearInterval(interval.current);
            setDisplay(text);
          }
        }, 30);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (interval.current) clearInterval(interval.current);
    };
  }, [text]);

  return <span ref={ref}>{display}</span>;
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

/* ── Double ticker — opposing belts, CSS-composited ── */
const TICKER_TOP = [
  'QUANT DATA SCIENCE',
  'MSC TÜBINGEN',
  'ML & FINANCE',
  'WERKSTUDENT · SCHWARZ GROUP',
  'PYTHON · R · PYTORCH',
  'OPEN TO OPPORTUNITIES',
];

const TICKER_BOTTOM = [
  'LOADED DICE',
  'RD CREDIBILITY DASHBOARD',
  'SPF AUDIT FRAMEWORK',
  'LEANIX×JIRA BRIDGE',
  'TONNETZ EXPLORER',
];

function TickerBelt({ items, reverse }: { items: readonly string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-2">
      <div className={`ticker-belt ${reverse ? 'ticker-belt--reverse' : ''}`}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted"
          >
            {item}
            <span className="mx-6 text-accent">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const STATS = [
  { label: 'Degree', value: 'M.Sc.' },
  { label: 'Field', value: 'Quant DS' },
  { label: 'Work', value: 'Schwarz' },
  { label: 'Location', value: 'TÜB/STR' },
] as const;

/* per-index border classes — 2×2 on mobile, 1×4 on sm+ */
const STAT_BORDERS = ['border-r', 'sm:border-r', 'border-r', ''] as const;

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
    <section ref={sectionRef} className="relative flex min-h-screen flex-col bg-bg pt-[65px]">
      <ParticleLayer particles={particles} />

      {/* ── Status bar — boots first (200ms) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
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
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted"
        >
          <span className="h-px w-8 bg-accent" />
          <span>Portfolio · v2026</span>
        </motion.div>

        {/* HUGE name — letterpress entrance, glitch on hover, click to scatter */}
        <div onClick={scatter} className="cursor-default select-none">
          <h1
            className="glitch hero-name font-display uppercase text-text"
            data-text="SAMUEL"
          >
            <Letterpress word="SAMUEL" baseDelay={0.35} />
          </h1>
          <h1 className="hero-name hero-name--overlap font-display uppercase">
            <span className="text-text">
              <Letterpress word="HEIN" baseDelay={0.47} />
            </span>
            <span className="text-accent">
              <Letterpress word="RICH" baseDelay={0.63} />
            </span>
          </h1>
        </div>

        {/* Subtitle row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3"
        >
          <p className="font-mono text-sm text-muted">
            Builds models. Studies quant data science in Tübingen. <Cursor />
          </p>
        </motion.div>

        {/* CTA buttons — sharp corners */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.15 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 border border-text bg-text px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-bg transition-all [transition-duration:80ms] hover:bg-accent hover:border-accent hover:text-bg"
          >
            Projects
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <a
            href="https://github.com/samuel29102002"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 border border-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent transition-all [transition-duration:80ms] hover:bg-accent hover:text-bg"
          >
            GitHub
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>

      {/* ── Double ticker — opposing directions, bottom belt at 0.7× ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="border-t border-border"
      >
        <TickerBelt items={TICKER_TOP} />
        <div className="border-t border-border/50">
          <TickerBelt items={TICKER_BOTTOM} reverse />
        </div>
      </motion.div>

      {/* ── Stats grid — slides in from bottom ── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 border-t border-border sm:grid-cols-4"
      >
        {STATS.map(({ label, value }, i) => (
          <div
            key={label}
            className={`border-border px-6 py-4 ${STAT_BORDERS[i]} ${
              i < 2 ? 'border-b sm:border-b-0' : ''
            }`}
          >
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted">
              <ScrambleText text={label.toUpperCase()} />
            </div>
            <div className="mt-1 font-display text-lg font-bold uppercase tracking-tight text-text">
              <ScrambleText text={value} />
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
