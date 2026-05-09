'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PrismaHero from '@/components/ui/prisma-hero';
import { ArrowUpRight } from 'lucide-react';

interface Skill {
  name: string;
  from: 'left' | 'right' | 'top' | 'bottom';
}

const SKILL_GROUPS: { label: string; skills: Skill[] }[] = [
  {
    label: 'Core Languages',
    skills: [
      { name: 'Python', from: 'left' },
      { name: 'R', from: 'top' },
      { name: 'JavaScript', from: 'right' },
      { name: 'Google Apps Script', from: 'bottom' },
    ],
  },
  {
    label: 'ML & Modeling',
    skills: [
      { name: 'PyTorch', from: 'right' },
      { name: 'scikit-learn', from: 'left' },
      { name: 'statsmodels', from: 'bottom' },
      { name: 'NumPy', from: 'top' },
      { name: 'matplotlib', from: 'left' },
      { name: 'seaborn', from: 'right' },
    ],
  },
  {
    label: 'Data Engineering',
    skills: [
      { name: 'pandas', from: 'bottom' },
      { name: 'openpyxl', from: 'left' },
      { name: 'Jupyter', from: 'right' },
    ],
  },
  {
    label: 'Tools',
    skills: [
      { name: 'Git', from: 'top' },
      { name: 'VS Code', from: 'right' },
      { name: 'Jupyter', from: 'left' },
      { name: 'Google Workspace', from: 'bottom' },
    ],
  },
];

function ftDelta(dir: Skill['from']) {
  if (dir === 'left') return { x: -200, y: 0 };
  if (dir === 'right') return { x: 200, y: 0 };
  if (dir === 'top') return { x: 0, y: -150 };
  return { x: 0, y: 150 };
}

function easeFor(dir: Skill['from']) {
  return dir === 'top' || dir === 'bottom' ? 'back.out(1.4)' : 'power3.out';
}

function SkillsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggers = useRef<Array<{ kill: () => void }>>([]);

  useEffect(() => {
    let cancelled = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const root = sectionRef.current;
      if (!root) return;

      if (reduced) {
        root.querySelectorAll<HTMLElement>('.skill-pill').forEach((p) => {
          p.style.opacity = '1';
          p.style.transform = 'none';
        });
        return;
      }

      root.querySelectorAll<HTMLElement>('[data-cluster]').forEach((cluster) => {
        const pills = Array.from(cluster.querySelectorAll<HTMLElement>('.skill-pill'));
        pills.forEach((pill, idx) => {
          const dir = (pill.dataset.from as Skill['from']) || 'bottom';
          const { x, y } = ftDelta(dir);
          gsap.fromTo(
            pill,
            { x, y, opacity: 0 },
            {
              x: 0,
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: easeFor(dir),
              delay: idx * 0.06,
              scrollTrigger: {
                trigger: cluster,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      });

      triggers.current = ScrollTrigger.getAll();
    })();

    return () => {
      cancelled = true;
      triggers.current.forEach((t) => t.kill());
      triggers.current = [];
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24">
      <div className="mx-auto max-w-screen-xl px-6 lg:px-12">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
              02 · Skills
            </span>
            <h2 className="mt-3 font-display text-fluid-2xl tracking-tighter">Tools.</h2>
          </div>
          <p className="max-w-xs font-mono text-sm text-muted">
            Grouped by domain. No self-rated bars.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {SKILL_GROUPS.map((g) => (
            <div key={g.label} data-cluster>
              <p className="mb-5 border-b border-border pb-2 font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted">
                {g.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.skills.map((s, i) => (
                  <span
                    key={`${g.label}-${s.name}-${i}`}
                    className="skill-pill"
                    data-from={s.from}
                    style={{ opacity: 0 }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPreview() {
  return (
    <section className="relative py-24" id="about">
      <div className="mx-auto max-w-screen-xl px-6 lg:px-12">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
              01 · About
            </span>
            <h2 className="mt-3 font-display text-fluid-2xl tracking-tighter">
              Quantitative data science. Tübingen.
            </h2>
          </div>
          <p className="max-w-xs font-mono text-sm text-muted">
            M.Sc. at Eberhard Karls Universität Tübingen.
            B.Sc. from DHBW Stuttgart with TRUMPF SE.
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
              finance. Currently a Werkstudent at the Schwarz Group alongside my Master's.
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
              <li key={k} className="grid grid-cols-[120px_1fr] gap-4 border-b border-border py-3">
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

export default function HomePage() {
  return (
    <>
      <PrismaHero />
      <AboutPreview />
      <SkillsSection />

      <section className="relative py-24">
        <div className="mx-auto max-w-screen-xl px-6 lg:px-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
                03 · Selected work
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
            Live from GitHub. Featured: orderflow-lab, MLES_IMU, Continuous-Time-Derivatives-Pricing,
            Energy_Data_Science, LEMON-Love-Predictor.
          </p>
        </div>
      </section>
    </>
  );
}
