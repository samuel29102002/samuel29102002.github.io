'use client';

/**
 * PrismaHero — cinematic hero with WordsPullUp animation.
 * Adapted from the 21st.dev Prisma hero pattern. Video bg replaced by
 * <AnimatedGradient />. Nav items stripped — Samuel's nav lives in <Nav />.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import AnimatedGradient from './animated-gradient';
import { cn } from '@/lib/utils';

/* ── Particle scatter ── */
interface Particle { id: number; x: number; y: number; angle: number; dist: number; }

function ParticleLayer({ particles }: { particles: Particle[] }) {
  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="pointer-events-none absolute z-20 block h-1.5 w-1.5 rounded-full bg-accent"
          initial={{ x: p.x, y: p.y, scale: 1, opacity: 0.9 }}
          animate={{
            x: p.x + Math.cos(p.angle) * p.dist,
            y: p.y + Math.sin(p.angle) * p.dist,
            scale: 0,
            opacity: 0,
          }}
          exit={{}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </AnimatePresence>
  );
}

interface WordsPullUpProps {
  text: string;
  className?: string;
  staggerStart?: number;
  staggerStep?: number;
}

export const WordsPullUp = ({
  text,
  className,
  staggerStart = 0,
  staggerStep = 0.1,
}: WordsPullUpProps) => {
  const words = text.split(' ');
  return (
    <div className={cn('flex flex-wrap', className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.85,
            delay: staggerStart + i * staggerStep,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
          style={{ marginRight: '0.22em' }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

interface WordsPullUpMultiStyleProps {
  segments: { text: string; style?: 'normal' | 'italic' | 'accent' }[];
  className?: string;
  staggerStart?: number;
}

export const WordsPullUpMultiStyle = ({
  segments,
  className,
  staggerStart = 0.7,
}: WordsPullUpMultiStyleProps) => {
  return (
    <div className={cn('flex flex-wrap items-baseline', className)}>
      {segments.map((seg, i) => (
        <motion.span
          key={i}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: staggerStart + i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={cn(
            'inline-block',
            seg.style === 'italic' && 'italic',
            seg.style === 'accent' && 'text-accent'
          )}
          style={{ marginRight: '0.22em' }}
        >
          {seg.text}
        </motion.span>
      ))}
    </div>
  );
};

let _particleId = 0;

export default function PrismaHero() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const scatter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLElement).closest('section')!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const burst: Particle[] = Array.from({ length: 18 }, () => ({
      id: _particleId++,
      x: cx,
      y: cy,
      angle: Math.random() * Math.PI * 2,
      dist: 60 + Math.random() * 80,
    }));
    setParticles((prev) => [...prev, ...burst]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => !burst.includes(p))), 900);
  }, []);

  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden bg-bg">
      {/* WebGL gradient — always running */}
      <div className="absolute inset-0 z-0">
        <AnimatedGradient preset="prism" />
        {/* extra readability tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg/85" />
      </div>

      {/* Particle layer */}
      <ParticleLayer particles={particles} />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex h-full max-w-screen-xl flex-col justify-center px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-accent"
        >
          <span className="block h-px w-9 bg-accent" />
          <span>Tübingen · Stuttgart · DE</span>
        </motion.div>

        {/* Click to scatter particles */}
        <div onClick={scatter} className="cursor-default select-none">
          <WordsPullUp
            text="Samuel Heinrich"
            className="font-display font-medium leading-[0.92] tracking-tighter text-text"
            staggerStart={0.15}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-8 max-w-2xl"
        >
          <p className="font-mono text-fluid-base text-muted">
            Quantitative Data Science · MSc Tübingen
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-text backdrop-blur-md transition-all duration-300 ease-soft hover:-translate-y-[2px] hover:border-accent hover:bg-white/10"
          >
            Projects
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <a
            href="https://github.com/samuel29102002"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-accent backdrop-blur-md transition-all duration-300 ease-soft hover:-translate-y-[2px] hover:bg-accent hover:text-bg"
          >
            GitHub
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.22em] text-muted"
      >
        <span>scroll</span>
        <motion.span
          className="block h-8 w-px bg-gradient-to-b from-accent to-transparent"
          animate={{ y: [-12, 12] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
