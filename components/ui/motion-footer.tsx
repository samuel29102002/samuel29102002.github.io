'use client';

/**
 * Cinematic footer — adapted for Samuel.
 * Magnetic CTA button physics, marquee, giant background type, glass pills.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowUp,
  Github,
  Linkedin,
  Instagram,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────────── Magnetic Button ─────────────────── */

const MagneticButton = ({
  children,
  className,
  strength = 0.35,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    },
    [strength, x, y]
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full',
        className
      )}
    >
      {children}
    </motion.button>
  );
};

/* ─────────────────── Glass Pill ─────────────────── */

const GlassPill = ({
  href,
  icon: Icon,
  label,
  handle,
  external,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  handle: string;
  external?: boolean;
}) => {
  const Tag: any = external ? 'a' : Link;
  const props = external
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { href };

  return (
    <Tag
      {...props}
      className="group flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md transition-all duration-300 ease-soft hover:-translate-y-[2px] hover:border-accent/60 hover:bg-white/10"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted">
          {label}
        </span>
        <span className="truncate font-mono text-sm text-text">{handle}</span>
      </span>
      <ArrowUpRight className="ml-auto h-4 w-4 text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
    </Tag>
  );
};

/* ─────────────────── Marquee ─────────────────── */

const Marquee = ({ items }: { items: string[] }) => {
  const list = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-border/60 py-4">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
        className="flex shrink-0 gap-12 whitespace-nowrap font-mono text-[0.72rem] uppercase tracking-[0.28em] text-muted"
      >
        {list.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-12">
            {it}
            <span className="text-accent">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

/* ─────────────────── Footer ─────────────────── */

export default function CinematicFooter() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-bg pt-20">
      {/* giant background type */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-2rem] flex justify-center text-center font-display font-light leading-[0.85] tracking-tightest text-white/[0.04]"
        style={{ fontSize: 'clamp(8rem, 26vw, 22rem)' }}
      >
        HEINRICH
      </div>

      {/* gradient haze */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-accent/10 via-accent/0 to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-screen-xl px-6 lg:px-12">
        <Marquee
          items={[
            'Quantitative Data Science',
            'Machine Learning',
            'Financial Engineering',
            'Data Engineering',
            'Statistics',
          ]}
        />

        <div className="grid grid-cols-1 gap-16 py-20 md:grid-cols-12">
          {/* CTA */}
          <div className="md:col-span-7">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent"
            >
              <span className="block h-px w-9 bg-accent" />
              Reach
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 font-display text-fluid-3xl tracking-tighter text-text"
            >
              Get in touch.
            </motion.h2>

            <p className="mb-10 max-w-md text-fluid-base text-muted">
              Email reaches me fastest. For project work, an issue on the relevant
              repo also works.
            </p>

            <MagneticButton
              className="border border-accent bg-accent px-8 py-4 font-mono text-xs uppercase tracking-[0.18em] text-bg transition-colors duration-300 hover:bg-transparent hover:text-accent"
              onClick={() => {
                window.location.href = 'mailto:samuelheinrich2002@gmail.com';
              }}
            >
              Email Samuel
              <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>
          </div>

          {/* Glass pills */}
          <div className="md:col-span-5">
            <p className="mb-5 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted">
              Channels
            </p>
            <div className="flex flex-col gap-3">
              <GlassPill
                external
                href="https://github.com/samuel29102002"
                icon={Github}
                label="GitHub"
                handle="@samuel29102002"
              />
              <GlassPill
                external
                href="https://linkedin.com/in/samuel-heinrich-5b7145226/"
                icon={Linkedin}
                label="LinkedIn"
                handle="samuel-heinrich"
              />
              <GlassPill
                external
                href="https://www.instagram.com/_samaezy_"
                icon={Instagram}
                label="Instagram"
                handle="@_samaezy_"
              />
              <GlassPill
                external
                href="mailto:samuelheinrich2002@gmail.com"
                icon={Mail}
                label="Email"
                handle="samuelheinrich2002@gmail.com"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 py-6 font-mono text-[0.66rem] uppercase tracking-[0.22em] text-muted">
          <span>© {year} Samuel Heinrich</span>
          <span>Tübingen · Stuttgart</span>
          <span>Built with Next.js · Tailwind · Framer Motion</span>
        </div>
      </div>

      {/* Back-to-top */}
      <motion.button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={false}
        animate={{ opacity: showTop ? 1 : 0, y: showTop ? 0 : 12 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-bg/80 text-accent backdrop-blur-md transition-colors hover:bg-accent hover:text-bg',
          !showTop && 'pointer-events-none'
        )}
        aria-label="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
      </motion.button>
    </footer>
  );
}
