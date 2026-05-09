'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Star, FileText } from 'lucide-react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { loadProjects, langColor, type Repo } from '@/lib/github';

function ProjectCard({ repo, featured }: { repo: Repo; featured?: boolean }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`group flex h-full flex-col overflow-hidden rounded-lg border bg-surface/60 backdrop-blur-sm transition-colors duration-300 ${
        featured
          ? 'border-accent/40 shadow-[0_0_0_1px_rgba(212,168,67,0.18)]'
          : 'border-border hover:border-accent/60'
      }`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-bg">
        {repo.cover ? (
          <img
            src={repo.cover}
            alt={`${repo.name} preview`}
            loading="lazy"
            width={800}
            height={450}
            className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
          />
        ) : (
          <div className="img-slot h-full rounded-none border-0">
            <span>
              [ screenshot:
              <br />
              /assets/images/{repo.name}-preview.jpg ]
            </span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          {featured && (
            <span className="rounded border border-accent bg-bg/80 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent backdrop-blur-md">
              ★ Featured
            </span>
          )}
          {repo.paperUrl && (
            <a
              href={repo.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 rounded border border-red-500/60 bg-bg/80 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-red-400 backdrop-blur-md transition-colors hover:bg-red-500/15"
            >
              <FileText className="h-3 w-3" />
              Paper
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-fluid-xl tracking-tight text-text">
          {repo.name.replace(/[-_]/g, ' ')}
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-muted">
          {repo.tagline ?? repo.description ?? 'Repository on GitHub.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 font-mono text-[0.7rem] text-muted">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: langColor(repo.language) }}
              />
              {repo.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3" />
            {repo.stargazers_count}
          </span>
          {repo.pushed_at && (
            <span>{new Date(repo.pushed_at).getFullYear()}</span>
          )}
        </div>

        {repo.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 5).map((t) => (
              <span
                key={t}
                className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.62rem] text-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 border-t border-border pt-3 font-mono text-sm text-accent transition-colors hover:text-text"
        >
          View Repo
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </motion.article>
  );
}

function Skeleton() {
  return (
    <div className="relative h-[380px] overflow-hidden rounded-lg border border-border bg-surface/40">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export default function ProjectsPage() {
  const [featured, setFeatured] = useState<Repo[] | null>(null);
  const [all, setAll] = useState<Repo[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadProjects({ featuredOnly: true }),
      loadProjects({ featuredOnly: false }),
    ]).then(([f, a]) => {
      if (cancelled) return;
      setFeatured(f);
      setAll(a);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-screen-xl px-6 pb-10 lg:px-12">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
          Projects
        </span>
        <h1 className="mt-3 font-display text-fluid-3xl tracking-tighter">Selected work.</h1>
        <p className="mt-5 max-w-2xl text-fluid-base text-muted">
          Live from{' '}
          <a
            href="https://github.com/samuel29102002"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            github.com/samuel29102002
          </a>
          . Featured five at the top.
        </p>
      </section>

      {/* ContainerScroll wrapping featured */}
      <ContainerScroll
        titleComponent={
          <div className="text-center">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
              Featured
            </span>
            <h2 className="mt-3 font-display text-fluid-2xl tracking-tighter">
              The five that got the most love.
            </h2>
          </div>
        }
      >
        <div className="grid h-full grid-cols-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          {(featured ?? Array.from({ length: 5 })).map((repo, i) =>
            repo ? (
              <ProjectCard key={(repo as Repo).name} repo={repo as Repo} featured />
            ) : (
              <Skeleton key={i} />
            )
          )}
        </div>
      </ContainerScroll>

      {/* Full grid */}
      <section className="mx-auto max-w-screen-xl px-6 pb-24 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-fluid-xl tracking-tight">All repos</h2>
          <span className="font-mono text-xs text-muted">
            Updated · {new Date().toISOString().slice(0, 10)}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(all ?? Array.from({ length: 6 })).map((repo, i) =>
            repo ? (
              <ProjectCard
                key={(repo as Repo).name}
                repo={repo as Repo}
                featured={
                  ['orderflow-lab', 'MLES_IMU', 'Continuous-Time-Derivatives-Pricing',
                   'Energy_Data_Science', 'LEMON-Love-Predictor'].includes(
                    (repo as Repo).name
                  )
                }
              />
            ) : (
              <Skeleton key={i} />
            )
          )}
        </div>
      </section>
    </div>
  );
}
