'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LampContainer } from '@/components/ui/lamp';

const PANELS = [
  {
    n: '01 / 03',
    title: 'Piano',
    bullets: [
      'Trained classically from childhood.',
      'Competed in regional competitions.',
      'Currently working through Chopin Ballades.',
    ],
    image: '/assets/piano.jpg',
    gradient: 'from-[#0d0d10] to-[#15151c]',
  },
  {
    n: '02 / 03',
    title: 'Music',
    bullets: [
      'Aurelius Sängerknaben Calw — boys’ choir.',
      'Operas in Paris, Dresden, Berlin (ages 10–13).',
      'Viola: Landesjugendorchester Baden-Württemberg.',
      'Viola: Donauphilharmonie.',
    ],
    image: '/assets/music.jpg',
    gradient: 'from-[#1a130b] to-[#221a10]',
  },
  {
    n: '03 / 03',
    title: 'Travel',
    bullets: [
      'Farmington CT (USA) · 6 months.',
      'Tallinn, Estonia · 6 months.',
      'Sardinia · April 2026.',
      'Georgia · July 2026 (planned).',
    ],
    image: '/assets/travel.jpg',
    gradient: 'from-[#15110a] to-[#221a0d]',
  },
];

const TRAVEL_DOTS = [
  { x: 22, y: 32, label: 'Farmington CT' },
  { x: 50, y: 30, label: 'Tallinn' },
  { x: 52, y: 40, label: 'Sardinia' },
  { x: 64, y: 32, label: 'Georgia' },
];

export default function HobbiesPage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let triggers: Array<{ kill: () => void }> = [];

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track || window.innerWidth < 760) return;

      const totalScroll = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -totalScroll() + 'px',
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          pin: true,
          scrub: 1,
          end: () => '+=' + totalScroll(),
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      track.querySelectorAll<HTMLElement>('[data-panel-inner]').forEach((inner) => {
        gsap.from(inner, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: inner.parentElement!,
            containerAnimation: tween,
            start: 'left 70%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      triggers = ScrollTrigger.getAll();
    })();

    return () => {
      cancelled = true;
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div>
      <LampContainer className="pt-32">
        <motion.h1
          initial={{ opacity: 0.5, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
          className="bg-gradient-to-br from-text to-text/60 bg-clip-text text-center font-display text-fluid-3xl tracking-tighter text-transparent"
        >
          Beyond the Code
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-4 max-w-md text-center font-mono text-sm text-muted"
        >
          Three things I keep doing when I close the laptop.
        </motion.p>
      </LampContainer>

      {/* horizontal pinned scroll */}
      <div ref={wrapRef} className="relative overflow-hidden">
        <div ref={trackRef} className="flex h-screen items-stretch will-change-transform">
          {PANELS.map((p) => (
            <section
              key={p.title}
              className={`relative flex h-screen w-screen flex-shrink-0 items-center bg-gradient-to-br ${p.gradient}`}
            >
              <div
                data-panel-inner
                className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-12"
              >
                <div className="flex max-w-2xl flex-col gap-5">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-accent">
                    {p.n} · {p.title}
                  </span>
                  <h2 className="font-display text-fluid-3xl tracking-tighter text-text">
                    {p.title}.
                  </h2>
                  <ul className="flex flex-col gap-2 font-mono text-sm text-text/80">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-3">
                        <span className="text-accent">·</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative w-full max-w-md">
                  {p.title === 'Travel' ? (
                    <div className="flex flex-col gap-4">
                      <div
                        className="relative aspect-[16/10] overflow-hidden rounded-lg border border-dashed border-border"
                        style={{
                          background:
                            'radial-gradient(ellipse at 52% 42%, rgba(212,168,67,0.07), transparent 65%)',
                        }}
                      >
                        {TRAVEL_DOTS.map((d) => (
                          <span
                            key={d.label}
                            className="absolute"
                            style={{ top: `${d.y}%`, left: `${d.x}%` }}
                          >
                            <motion.span
                              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                              className="block h-2 w-2 rounded-full bg-accent"
                              style={{
                                boxShadow: '0 0 12px rgba(212, 168, 67, 0.5)',
                              }}
                            />
                            <span
                              className="absolute left-3 -top-1 whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted"
                              style={{ transform: 'translateY(-100%)' }}
                            >
                              {d.label}
                            </span>
                          </span>
                        ))}
                      </div>
                      <div className="img-slot aspect-[21/9] w-full">
                        <span>[ add photo: {p.image} ]</span>
                      </div>
                    </div>
                  ) : (
                    <div className="img-slot aspect-[3/4] w-full">
                      <span>
                        [ add photo:
                        <br />
                        {p.image} ]
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-screen-md px-6 py-24 text-center">
        <h3 className="font-display text-fluid-xl tracking-tight">More on the about page.</h3>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          Full timeline, projects, and contact channels.
        </p>
      </section>
    </div>
  );
}
