'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, FileText } from 'lucide-react';
import { loadProjects, langColor, type Repo } from '@/lib/github';

const FILTERS = ['ALL', 'DATA', 'WEB', 'ML', 'TOOLS'] as const;
type Filter = (typeof FILTERS)[number];

function repoMatchesFilter(repo: Repo, filter: Filter): boolean {
  if (filter === 'ALL') return true;
  const tags = repo.topics ?? [];
  const lang = (repo.language ?? '').toLowerCase();

  if (filter === 'DATA') {
    return (
      tags.some((t) =>
        ['time-series', 'data', 'forecasting', 'statistics', 'energy', 'data-science', 'quant', 'pandas', 'numpy'].includes(t)
      ) || lang === 'jupyter notebook'
    );
  }
  if (filter === 'WEB') {
    return (
      ['typescript', 'javascript', 'html', 'css'].includes(lang) ||
      tags.some((t) => ['nextjs', 'react', 'web', 'frontend'].includes(t))
    );
  }
  if (filter === 'ML') {
    return (
      tags.some((t) =>
        ['ml', 'pytorch', 'scikit-learn', 'machine-learning', 'classification', 'shap', 'causal', 'imu', 'sensor-ml', 'embedded'].includes(t)
      ) || lang === 'python'
    );
  }
  if (filter === 'TOOLS') {
    return (
      ['shell', 'rust', 'go'].includes(lang) ||
      tags.some((t) => ['tool', 'cli', 'rust', 'automation'].includes(t))
    );
  }
  return true;
}

function FeaturedStrip({ repo }: { repo: Repo }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ height: 480 }}>
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        {repo.cover ? (
          <img
            src={repo.cover}
            alt={repo.name}
            className="h-[130%] w-full object-cover opacity-25"
          />
        ) : (
          <div className="h-[130%] w-full bg-gradient-to-br from-accent/12 to-bg" />
        )}
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg/96 via-bg/80 to-bg/30" />

      {/* # marker */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 font-display font-light text-accent/10 select-none"
        style={{ fontSize: 'clamp(8rem, 18vw, 16rem)' }}
      >
        #
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-screen-xl px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-accent">
              ★ Featured
            </span>
            <h2 className="mt-3 font-display text-fluid-2xl tracking-tighter text-text">
              {repo.name.replace(/[-_]/g, ' ')}
            </h2>
            <p className="mt-4 max-w-lg text-fluid-base leading-relaxed text-text/65">
              {repo.tagline ?? repo.description ?? ''}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent px-6 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-bg transition-all hover:bg-transparent hover:text-accent"
              >
                View Repo
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              {repo.paperUrl && (
                <a
                  href={repo.paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-all hover:border-accent/60 hover:text-accent"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Paper
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function TableRow({ repo, index }: { repo: Repo; index: number }) {
  const tags = repo.topics?.slice(0, 3) ?? [];
  const year = repo.pushed_at ? new Date(repo.pushed_at).getFullYear() : '—';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.035, ease: [0.16, 1, 0.3, 1] }}
      className="group border-b border-border transition-all duration-200 hover:bg-surface/60"
      style={{ boxShadow: 'none' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'inset 3px 0 0 #d4a843';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <td className="py-4 pl-5 pr-6 font-mono text-[0.66rem] text-muted">
        {String(index + 1).padStart(2, '0')}
      </td>
      <td className="py-4 pr-8">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-body text-sm text-text transition-all duration-200 group-hover:translate-x-2 group-hover:text-accent"
        >
          {repo.name.replace(/[-_]/g, ' ')}
        </a>
        {repo.tagline && (
          <p className="mt-0.5 max-w-xs font-mono text-[0.63rem] text-muted/70 line-clamp-1">
            {repo.tagline}
          </p>
        )}
      </td>
      <td className="py-4 pr-8 font-mono text-[0.68rem]">
        <div className="flex flex-wrap items-center gap-2">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: langColor(repo.language) }}
              />
              {repo.language}
            </span>
          )}
          {tags.map((t) => (
            <span key={t} className="text-muted/50">
              #{t}
            </span>
          ))}
        </div>
      </td>
      <td className="py-4 pr-8 font-mono text-[0.7rem] text-muted">{year}</td>
      <td className="py-4 pr-5">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[0.7rem] text-muted transition-colors hover:text-accent"
          aria-label={`Open ${repo.name} on GitHub`}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </td>
    </motion.tr>
  );
}

export default function ProjectsPage() {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('ALL');

  useEffect(() => {
    let cancelled = false;
    loadProjects().then((r) => {
      if (!cancelled) setRepos(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = repos?.find((r) => r.name === 'orderflow-lab') ?? repos?.[0];
  const filtered = repos?.filter((r) => repoMatchesFilter(r, activeFilter)) ?? [];

  return (
    <div className="pt-28">
      {/* Header */}
      <section className="mx-auto max-w-screen-xl px-6 pb-10 lg:px-12">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
          Projects
        </span>
        <h1 className="mt-3 font-display text-fluid-3xl tracking-tighter">Selected work.</h1>
        <p className="mt-4 max-w-lg font-mono text-sm text-muted">
          Live from{' '}
          <a
            href="https://github.com/samuel29102002"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            github.com/samuel29102002
          </a>
          . Sorted by activity.
        </p>
      </section>

      {/* Featured parallax strip */}
      {featured ? (
        <FeaturedStrip repo={featured} />
      ) : (
        <div className="relative h-[480px] animate-pulse bg-surface/30" />
      )}

      {/* Filter + table */}
      <section className="mx-auto max-w-screen-xl px-6 py-16 lg:px-12">
        {/* Filter pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full border px-4 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.18em] transition-all duration-200 ${
                activeFilter === f
                  ? 'border-accent bg-accent text-bg'
                  : 'border-border text-muted hover:border-accent/60 hover:text-accent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {repos === null ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="relative h-14 overflow-hidden rounded border border-border bg-surface/40"
              >
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-t border-border">
              <thead>
                <tr className="border-b border-border">
                  {['#', 'Name', 'Stack', 'Year', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`py-3 text-left font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted ${
                        i === 0 ? 'pl-5 pr-6' : i === 4 ? 'pr-5' : 'pr-8'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((repo, i) => (
                  <TableRow key={repo.name} repo={repo} index={i} />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center font-mono text-sm text-muted">
                      No repos match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
