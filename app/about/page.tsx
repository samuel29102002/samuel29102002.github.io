'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const TIMELINE = [
  { year: '2002', title: 'Born', desc: 'Born in Germany.', side: 'left' as const },
  { year: '2021', title: 'Abitur', desc: 'Finished secondary school.', side: 'right' as const },
  {
    year: '2021',
    title: 'DHBW Stuttgart',
    desc: 'B.Sc. Wirtschaftsinformatik – Data Science. Partner company: TRUMPF SE.',
    side: 'left' as const,
  },
  {
    year: '2023',
    title: 'USA',
    desc: '6-month international assignment at TRUMPF Inc., Farmington CT.',
    side: 'right' as const,
  },
  { year: 'Jun 2024', title: 'Bachelor', desc: 'B.Sc. completed.', side: 'left' as const },
  {
    year: 'Oct 2024',
    title: "Master's",
    desc: 'M.Sc. Quantitative Data Science Methods, Eberhard Karls Universität Tübingen. 15 admitted of 300 applicants.',
    side: 'right' as const,
  },
  {
    year: '2025 →',
    title: 'Schwarz Group',
    desc: "Werkstudent at Schwarz Group (Lidl/Kaufland/PreZero) alongside the Master's and student organisation leadership.",
    side: 'left' as const,
  },
];

const STATS = [
  { value: 15, suffix: '', label: 'of 300 admitted', note: 'M.Sc. · Tübingen' },
  { value: 6, suffix: ' mo', label: "int'l assignment", note: 'TRUMPF · Connecticut' },
  { value: 3, suffix: '', label: 'countries studied', note: 'DE · US · EE' },
];

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const dur = 1200;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - t0) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(ease * target) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function AboutPage() {
  return (
    <div className="pt-28">
      {/* ── Split-screen intro ── */}
      <section className="mx-auto max-w-screen-xl px-6 pb-16 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[55fr_45fr] lg:gap-14">
          {/* Portrait — clip-path reveal */}
          <motion.div
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[70vh] overflow-hidden rounded-sm"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(212,168,67,0.35)' }}
          >
            <Image
              src="/assets/images/samuel-portrait.jpg"
              alt="Samuel Heinrich"
              fill
              priority
              sizes="(min-width:1024px) 55vw, 90vw"
              className="object-cover grayscale-[15%] transition-all duration-700 ease-soft hover:grayscale-0"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/50 via-transparent to-transparent"
            />
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center gap-6"
          >
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
              About
            </span>
            <h1 className="font-display text-fluid-3xl tracking-tighter" style={{ lineHeight: 1 }}>
              Data + Finance.
              <br />
              Tübingen.
            </h1>
            <div className="flex flex-col gap-3 text-fluid-base leading-relaxed text-text/80">
              <p>
                I study quantitative data science at the University of Tübingen — 15 admitted of
                300 applicants. Before that, a dual B.Sc. at DHBW Stuttgart with TRUMPF SE,
                including six months at TRUMPF Inc. in Farmington, Connecticut.
              </p>
              <p>
                Most of my work sits at the intersection of statistics, machine learning, and
                finance. Currently a Werkstudent at the Schwarz Group alongside my Master&apos;s.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {['M.Sc. · Tübingen', 'TRUMPF · Connecticut', 'Schwarz Group'].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-accent/40 px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-accent"
                >
                  {pill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats row ── */}
      <section className="mx-auto max-w-screen-xl px-6 pb-20 lg:px-12">
        <div className="grid grid-cols-1 divide-y divide-border border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-1 px-8 py-8"
            >
              <span className="font-display text-5xl tracking-tighter text-text">
                <CountUp target={s.value} suffix={s.suffix} />
              </span>
              <span className="font-mono text-xs text-accent">{s.note}</span>
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="mx-auto max-w-screen-xl px-6 pb-28 lg:px-12">
        <div className="mb-14 text-center">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
            · Timeline ·
          </span>
        </div>

        <div className="relative">
          {/* Center line (desktop only) */}
          <div
            aria-hidden
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border lg:block"
          />

          <div className="flex flex-col gap-14">
            {TIMELINE.map((entry, i) => (
              <motion.div
                key={`${entry.title}-${i}`}
                initial={{ opacity: 0, x: entry.side === 'left' ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-8%' }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_3rem_1fr] lg:items-start"
              >
                {entry.side === 'left' ? (
                  <>
                    <div className="lg:pr-8 lg:text-right">
                      <span className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-accent">
                        {entry.year}
                      </span>
                      <h3 className="mt-1 font-display text-fluid-xl tracking-tight text-text">
                        {entry.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{entry.desc}</p>
                    </div>
                    <div className="hidden items-start justify-center pt-2 lg:flex">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-25" />
                        <span className="relative inline-flex h-3 w-3 rounded-full border border-accent bg-bg" />
                      </span>
                    </div>
                    <div />
                  </>
                ) : (
                  <>
                    <div />
                    <div className="hidden items-start justify-center pt-2 lg:flex">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-25" />
                        <span className="relative inline-flex h-3 w-3 rounded-full border border-accent bg-bg" />
                      </span>
                    </div>
                    <div className="lg:pl-8">
                      <span className="font-mono text-[0.64rem] uppercase tracking-[0.22em] text-accent">
                        {entry.year}
                      </span>
                      <h3 className="mt-1 font-display text-fluid-xl tracking-tight text-text">
                        {entry.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{entry.desc}</p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
