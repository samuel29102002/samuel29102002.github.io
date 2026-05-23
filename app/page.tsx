'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PrismaHero from '@/components/ui/prisma-hero';
import { ArrowUpRight } from 'lucide-react';

/* ────────────────────────────────────────────────
   Section number scramble label
   ─────────────────────────────────────────────── */

const SCRAMBLE_CHARS = '0123456789';

function ScrambleLabel({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(children);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          obs.disconnect();
          let count = 0;
          const total = 14;
          const id = setInterval(() => {
            const rand = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            setText(rand + children.slice(1));
            count++;
            if (count >= total) {
              clearInterval(id);
              setText(children);
            }
          }, 48);
        }
      },
      { threshold: 0.8 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [children]);

  return <span ref={ref}>{text}</span>;
}

/* ────────────────────────────────────────────────
   Terminal Skills Section
   ─────────────────────────────────────────────── */

const SKILL_LINES = [
  { cat: 'Core Languages   ', skills: 'python  r  javascript  google-apps-script' },
  { cat: 'ML & Modeling    ', skills: 'pytorch  scikit-learn  statsmodels  numpy  matplotlib  seaborn' },
  { cat: 'Data Engineering ', skills: 'pandas  openpyxl  jupyter' },
  { cat: 'Tools            ', skills: 'git  vscode  jupyter  google-workspace' },
] as const;

function SkillsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);
  const [typed, setTyped] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState(-1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          obs.disconnect();
          runTyping();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  /* Pause blink when out of viewport */
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        cursor.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      },
      { threshold: 0.1 }
    );
    obs.observe(cursor);
    return () => obs.disconnect();
  }, []);

  function runTyping() {
    let lineIdx = 0;
    let colIdx = 0;
    const buf: string[] = [];

    function next() {
      if (lineIdx >= SKILL_LINES.length) {
        setActiveLine(-1);
        setDone(true);
        return;
      }
      const full = SKILL_LINES[lineIdx].skills;
      if (colIdx === 0) {
        buf.push('');
        setTyped([...buf]);
        setActiveLine(lineIdx);
      }
      if (colIdx < full.length) {
        buf[lineIdx] = full.slice(0, colIdx + 1);
        setTyped([...buf]);
        colIdx++;
        setTimeout(next, 14 + Math.random() * 10);
      } else {
        lineIdx++;
        colIdx = 0;
        setTimeout(next, 240);
      }
    }
    next();
  }

  return (
    <section ref={sectionRef} className="relative py-24">
      <div className="mx-auto max-w-screen-xl px-6 lg:px-12">
        <div className="mb-10">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
            <ScrambleLabel>02 · Skills</ScrambleLabel>
          </span>
          <h2 className="mt-3 font-display text-fluid-2xl tracking-tighter">Tools.</h2>
        </div>

        <div
          className="overflow-hidden rounded-md border border-border bg-[#0d0d0d] p-5 font-mono leading-relaxed"
          style={{ fontSize: '0.88rem', minHeight: 220 }}
        >
          {/* Prompt line */}
          <div className="mb-4 text-[0.76rem]">
            <span className="text-accent">samuel@tübingen</span>
            <span className="text-muted">:</span>
            <span className="text-accent">~</span>
            <span className="text-muted">$ </span>
            <span className="text-text">cat skills.txt</span>
          </div>

          {/* Typed lines */}
          {SKILL_LINES.slice(0, typed.length === 0 ? 0 : typed.length).map((line, i) => (
            <div key={line.cat} className="flex gap-3 py-[3px]">
              <span className="whitespace-pre text-accent" style={{ userSelect: 'none' }}>
                {line.cat}
              </span>
              <span className="text-text">
                {typed[i] ?? ''}
                {activeLine === i && (
                  <span
                    className="ml-[1px] inline-block w-[0.52em] bg-accent align-text-bottom"
                    style={{
                      height: '1.05em',
                      animation: 'terminal-blink 1s step-end infinite',
                    }}
                  />
                )}
              </span>
            </div>
          ))}

          {/* Final cursor */}
          {done && (
            <div className="mt-4 text-[0.76rem]">
              <span className="text-accent">samuel@tübingen</span>
              <span className="text-muted">:</span>
              <span className="text-accent">~</span>
              <span className="text-muted">$ </span>
              <span
                ref={cursorRef}
                className="inline-block w-[0.52em] bg-accent align-text-bottom"
                style={{
                  height: '1.05em',
                  animation: 'terminal-blink 1s step-end infinite',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   About Preview
   ─────────────────────────────────────────────── */

function AboutPreview() {
  return (
    <section className="relative py-24" id="about">
      <div className="mx-auto max-w-screen-xl px-6 lg:px-12">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
              <ScrambleLabel>01 · About</ScrambleLabel>
            </span>
            <h2 className="mt-3 font-display text-fluid-2xl tracking-tighter">
              Quantitative data science. Tübingen.
            </h2>
          </div>
          <p className="max-w-xs font-mono text-sm text-muted">
            M.Sc. at Eberhard Karls Universität Tübingen. B.Sc. from DHBW Stuttgart with TRUMPF
            SE.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-[1fr_1.3fr] md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4 text-fluid-base text-text/90"
          >
            <p>
              I study quantitative data science at the University of Tübingen. Before that, a dual
              B.Sc. at DHBW Stuttgart with TRUMPF SE, including six months at TRUMPF Inc. in
              Farmington, Connecticut.
            </p>
            <p>
              Most of my work sits at the intersection of statistics, machine learning, and
              finance. Currently a Werkstudent at the Schwarz Group alongside my Master&apos;s.
            </p>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="border-t border-border font-mono text-sm"
          >
            {[
              ['Studying', 'M.Sc. Quantitative Data Science Methods'],
              ['University', 'Eberhard Karls Universität Tübingen'],
              ['Bachelor', 'B.Sc. Wirtschaftsinformatik · DHBW Stuttgart'],
              ['Working', 'Werkstudent · Schwarz Group'],
              ['Languages', 'German (native) · English (fluent)'],
              ['Location', 'Tübingen / Stuttgart, Germany'],
            ].map(([k, v]) => (
              <li
                key={k}
                className="grid grid-cols-[120px_1fr] gap-4 border-b border-border py-3"
              >
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                  {k}
                </span>
                <span className="text-text">{v}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   Home Page
   ─────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <PrismaHero />
      <AboutPreview />
      <SkillsSection />

      {/* Selected work */}
      <section className="relative py-24">
        <div className="mx-auto max-w-screen-xl px-6 lg:px-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
                <ScrambleLabel>03 · Selected work</ScrambleLabel>
              </span>
              <h2 className="mt-3 font-display text-fluid-2xl tracking-tighter">
                Recent projects.
              </h2>
            </div>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-accent"
            >
              All projects
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <p className="max-w-2xl text-fluid-base text-muted">
            Live from GitHub. Featured:{' '}
            {['orderflow-lab', 'MLES_IMU', 'Continuous-Time-Derivatives-Pricing',
              'Energy_Data_Science', 'LEMON-Love-Predictor'].join(', ')}.
          </p>
        </div>
      </section>

      {/* Play invitation */}
      <section className="border-t border-border/40 py-12">
        <div className="mx-auto max-w-screen-xl px-6 lg:px-12">
          <div className="flex items-center justify-between gap-6">
            <div className="font-mono text-[0.78rem] text-muted">
              <span className="text-muted/50">$ </span>
              <Link
                href="/play"
                className="text-accent underline-offset-4 transition-colors hover:text-text hover:underline"
              >
                ./play_game.sh
              </Link>
              <span className="ml-2 animate-pulse text-muted/40">▌</span>
            </div>
            <Link
              href="/play"
              className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
            >
              Data Dash →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
