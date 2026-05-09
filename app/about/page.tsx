'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  GraduationCap,
  Building2,
  Plane,
  Award,
  FlaskConical,
  BookOpen,
  Globe,
  Briefcase,
} from 'lucide-react';
import RadialOrbitalTimeline, {
  type OrbitalItem,
} from '@/components/ui/radial-orbital-timeline';
import { fetchRepos } from '@/lib/github';

const timelineData: OrbitalItem[] = [
  {
    id: 1,
    title: 'Born',
    date: '2002',
    content: 'Born in Germany.',
    category: 'Life',
    icon: MapPin,
    relatedIds: [2],
    status: 'completed',
    energy: 100,
  },
  {
    id: 2,
    title: 'Abitur',
    date: '2021',
    content: 'Finished secondary school.',
    category: 'Education',
    icon: GraduationCap,
    relatedIds: [1, 3],
    status: 'completed',
    energy: 100,
  },
  {
    id: 3,
    title: 'DHBW Stuttgart',
    date: '2021',
    content:
      'B.Sc. Wirtschaftsinformatik – Data Science. Partner company: TRUMPF SE.',
    category: 'Education',
    icon: Building2,
    relatedIds: [2, 4],
    status: 'completed',
    energy: 95,
  },
  {
    id: 4,
    title: 'USA',
    date: '2023',
    content: '6-month international assignment at TRUMPF Inc., Farmington CT.',
    category: 'Work',
    icon: Plane,
    relatedIds: [3, 5],
    status: 'completed',
    energy: 90,
  },
  {
    id: 5,
    title: 'Bachelor',
    date: 'Jun 2024',
    content: 'B.Sc. completed.',
    category: 'Education',
    icon: Award,
    relatedIds: [4, 6],
    status: 'completed',
    energy: 100,
  },
  {
    id: 6,
    title: "Master's",
    date: 'Oct 2024',
    content:
      'M.Sc. Quantitative Data Science Methods, Eberhard Karls Universität Tübingen. 15 admitted of 300 applicants.',
    category: 'Education',
    icon: FlaskConical,
    relatedIds: [5, 7, 8],
    status: 'in-progress',
    energy: 70,
  },
  {
    id: 7,
    title: 'Tutor',
    date: '2025',
    content: 'Statistics tutor, University of Tübingen.',
    category: 'Work',
    icon: BookOpen,
    relatedIds: [6],
    status: 'completed',
    energy: 80,
  },
  {
    id: 8,
    title: 'Tallinn',
    date: 'Aug 2025',
    content:
      'Exchange semester at TalTech, Tallinn, Estonia. Scholarship recipient. Projects: MLES_IMU, Energy Data Science.',
    category: 'Education',
    icon: Globe,
    relatedIds: [6, 9],
    status: 'completed',
    energy: 95,
  },
  {
    id: 9,
    title: 'Schwarz Group',
    date: 'Jan 2026',
    content:
      'Werkstudent at Schwarz Group (Lidl/Kaufland/PreZero) alongside Master’s and student organisation leadership.',
    category: 'Work',
    icon: Briefcase,
    relatedIds: [8],
    status: 'in-progress',
    energy: 85,
  },
];

function StatsCard() {
  const [repoCount, setRepoCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRepos()
      .then((repos) => {
        if (cancelled) return;
        const count = repos.filter((r) => !r.fork && !r.archived).length;
        setRepoCount(count);
      })
      .catch(() => {
        if (!cancelled) setRepoCount(13);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      label: 'Admitted',
      value: 'top 5%',
      detail: '15 / 300 applicants',
      progress: 95,
    },
    {
      label: 'Exchange',
      value: 'TalTech Tallinn',
      detail: 'scholarship recipient',
      progress: 100,
    },
    {
      label: 'Repos',
      value: repoCount === null ? '—' : `${repoCount}+`,
      detail: 'live · github API',
      progress: 80,
    },
  ];

  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.24em] text-muted">
          Quick Stats
        </span>
        <span className="inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Currently studying
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted">
                {s.label}
              </span>
              <span className="font-mono text-[0.66rem] text-muted">{s.detail}</span>
            </div>
            <span className="font-display text-2xl tracking-tight text-text">{s.value}</span>
            <div className="h-[3px] overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${s.progress}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 + 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-accent-dim to-accent"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {['Statistics', 'Machine Learning', 'Time Series', 'Quant Finance'].map((t) => (
          <span
            key={t}
            className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="pt-32">
      <section className="mx-auto max-w-screen-xl px-6 pb-12 lg:px-12">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
          About
        </span>
        <h1 className="mt-3 max-w-[18ch] font-display text-fluid-3xl font-medium tracking-tighter">
          Samuel Heinrich.
        </h1>
      </section>

      <section className="mx-auto max-w-screen-xl px-6 pb-16 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* LEFT — Orbital timeline */}
          <div className="relative">
            <div className="mb-6 flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted">
              <span className="block h-px w-8 bg-accent" />
              Timeline · click a node
            </div>
            <RadialOrbitalTimeline items={timelineData} radius={210} />
          </div>

          {/* RIGHT — Bio + stats + portrait */}
          <div className="flex flex-col gap-8">
            <div className="img-slot aspect-[3/4] w-full max-w-[420px]">
              <span>
                [ add photo here:
                <br />
                /assets/images/samuel-portrait.jpg ]
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4 text-fluid-base text-text/90"
            >
              <p>
                I study quantitative data science at the University of Tübingen. Before that, a
                dual B.Sc. at DHBW Stuttgart with TRUMPF SE — including six months at TRUMPF Inc.
                in Farmington, Connecticut.
              </p>
              <p>
                Werkstudent at the Schwarz Group, alongside the Master's. Most of my work sits at
                the intersection of statistics, machine learning, and finance.
              </p>
            </motion.div>

            <StatsCard />
          </div>
        </div>
      </section>
    </div>
  );
}
