'use client';

/**
 * SiteFooter — Samuel Heinrich's site footer.
 * 3-column layout · rotating "AVAILABLE FOR WORK" SVG circle · back-to-top.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram, Mail, ArrowUp } from 'lucide-react';

const NAV_LINKS = [
  ['/about', 'About'],
  ['/projects', 'Projects'],
  ['/hobbies', 'Hobbies'],
  ['/contact', 'Contact'],
  ['/play', '$ ./play_game.sh'],
] as const;

const CHANNELS = [
  {
    href: 'https://github.com/samuel29102002',
    icon: Github,
    label: 'GitHub',
    handle: '@samuel29102002',
  },
  {
    href: 'https://linkedin.com/in/samuel-heinrich-5b7145226/',
    icon: Linkedin,
    label: 'LinkedIn',
    handle: 'samuel-heinrich',
  },
  {
    href: 'https://www.instagram.com/_samaezy_',
    icon: Instagram,
    label: 'Instagram',
    handle: '@_samaezy_',
  },
  {
    href: 'mailto:samuelheinrich2002@gmail.com',
    icon: Mail,
    label: 'Email',
    handle: 'samuelheinrich2002',
  },
] as const;

export default function SiteFooter() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-bg pt-16">
      {/* Giant background type — hover to distort */}
      <div
        aria-hidden
        className="group absolute inset-x-0 bottom-[-1rem] flex cursor-default justify-center text-center font-display font-light leading-[0.82] tracking-tightest select-none"
        style={{ fontSize: 'clamp(7rem, 24vw, 20rem)' }}
      >
        <span
          className="text-white/[0.035] transition-all duration-500 ease-soft group-hover:tracking-[0.1em] group-hover:text-white/[0.07]"
        >
          HEINRICH
        </span>
      </div>

      {/* Top accent line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-accent/8 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-screen-xl px-6 lg:px-12">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 gap-14 pb-16 md:grid-cols-3">
          {/* ── Col 1: Identity + rotating circle ── */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              {/* Rotating SVG text circle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
                className="h-[88px] w-[88px] flex-shrink-0"
                aria-hidden
              >
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <defs>
                    <path
                      id="sf-circle"
                      d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    />
                  </defs>
                  <text
                    fontSize="8"
                    fontFamily="var(--font-fira), monospace"
                    fill="rgb(212,168,67)"
                    letterSpacing="3.2"
                  >
                    <textPath href="#sf-circle" startOffset="0%">
                      AVAILABLE FOR WORK · AVAILABLE FOR WORK ·
                    </textPath>
                  </text>
                </svg>
              </motion.div>

              <div>
                <div className="font-display text-xl tracking-tight text-text">
                  Samuel Heinrich
                </div>
                <div className="mt-1 font-mono text-[0.63rem] uppercase tracking-[0.18em] text-muted">
                  Quant Data Science
                </div>
              </div>
            </div>

            <p className="max-w-[260px] font-mono text-[0.72rem] leading-relaxed text-muted">
              M.Sc. student at Eberhard Karls Universität Tübingen. Werkstudent at Schwarz Group.
            </p>
          </div>

          {/* ── Col 2: Navigation ── */}
          <div>
            <p className="mb-5 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted">
              Navigate
            </p>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="group relative inline-flex items-center font-mono text-sm text-muted transition-colors hover:text-text"
                >
                  {/* Amber accent dash */}
                  <span className="mr-0 inline-block h-px w-0 bg-accent transition-all duration-300 group-hover:mr-2.5 group-hover:w-3" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Col 3: Channels ── */}
          <div>
            <p className="mb-5 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted">
              Channels
            </p>
            <div className="flex flex-col gap-3">
              {CHANNELS.map(({ href, icon: Icon, label, handle }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 font-mono text-sm text-muted transition-colors hover:text-text"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface transition-all duration-200 group-hover:border-accent/60 group-hover:bg-accent/10">
                    <Icon className="h-3.5 w-3.5 transition-colors group-hover:text-accent" />
                  </span>
                  <span className="text-[0.78rem]">{handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 py-6 font-mono text-[0.63rem] uppercase tracking-[0.2em] text-muted">
          <span>© {year} Samuel Heinrich</span>
          <span>Tübingen · Stuttgart · Germany</span>
          <span>Next.js · Tailwind · Framer Motion</span>
        </div>
      </div>

      {/* Back-to-top */}
      <motion.button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={false}
        animate={{ opacity: showTop ? 1 : 0, y: showTop ? 0 : 12 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-bg/80 text-accent backdrop-blur-md transition-colors hover:bg-accent hover:text-bg ${
          !showTop && 'pointer-events-none'
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
      </motion.button>
    </footer>
  );
}
