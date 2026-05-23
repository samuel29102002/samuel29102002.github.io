'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ────────────────────────────────────────────────
   Three.js Dodecahedron opener
   ─────────────────────────────────────────────── */

function DodecahedronScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    (async () => {
      const THREE = await import('three');
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(200, 200);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 3.2;

      const geometry = new THREE.DodecahedronGeometry(1, 0);
      const material = new THREE.MeshBasicMaterial({ color: 0xd4a843, wireframe: true });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      let raf: number;
      const animate = () => {
        raf = requestAnimationFrame(animate);
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.008;
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <canvas ref={canvasRef} width={200} height={200} className="opacity-75" />;
}

/* ────────────────────────────────────────────────
   Panel 1 — Piano: SVG Equalizer bars
   ─────────────────────────────────────────────── */

const BAR_HEIGHTS = [0.45, 0.85, 0.6, 1.0, 0.75, 0.55, 0.9, 0.48, 0.7, 0.38];

function Equalizer() {
  return (
    <div className="flex h-28 items-end gap-1.5">
      {BAR_HEIGHTS.map((maxH, i) => (
        <motion.div
          key={i}
          className="w-4 rounded-t-sm bg-accent"
          animate={{ height: ['18%', `${maxH * 100}%`, '18%'] }}
          transition={{
            duration: 0.5 + i * 0.07,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.06,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────
   Panel 2 — Running: SVG path self-draw
   ─────────────────────────────────────────────── */

function RunningRoute() {
  const PATH = 'M20,120 Q50,80 90,100 Q130,120 170,55 Q210,10 250,45 Q290,80 330,20 L380,15';

  return (
    <svg viewBox="0 0 400 140" className="w-full max-w-xs" fill="none">
      {/* Grid lines */}
      {[0, 35, 70, 105, 140].map((y) => (
        <line key={y} x1={0} y1={y} x2={400} y2={y} stroke="#252525" strokeWidth={1} />
      ))}
      {/* Route */}
      <motion.path
        d={PATH}
        stroke="#d4a843"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 2.2, ease: 'easeInOut', opacity: { duration: 0.3 } }}
      />
      {/* Distance markers */}
      {[
        { cx: 20, cy: 120, label: '0 km' },
        { cx: 170, cy: 55, label: '5 km' },
        { cx: 380, cy: 15, label: '10 km' },
      ].map((d) => (
        <g key={d.label}>
          <circle cx={d.cx} cy={d.cy} r={4} fill="#d4a843" />
          <text
            x={d.cx + 7}
            y={d.cy - 6}
            fill="#888880"
            fontSize={9}
            fontFamily="var(--font-fira), monospace"
          >
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────
   Panel 3 — Roguelikes: Interactive dice
   ─────────────────────────────────────────────── */

const DICE_FACES: [number, number][][] = [
  [[50, 50]],
  [[30, 30], [70, 70]],
  [[30, 30], [50, 50], [70, 70]],
  [[30, 30], [70, 30], [30, 70], [70, 70]],
  [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  [[30, 30], [70, 30], [30, 50], [70, 50], [30, 70], [70, 70]],
];

function Dice() {
  const [face, setFace] = useState(6);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setTimeout(() => {
      setFace(Math.floor(Math.random() * 6) + 1);
      setRolling(false);
    }, 550);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        onClick={roll}
        animate={rolling ? { rotateY: 360, scale: 1.08 } : { rotateY: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        className="cursor-pointer"
        style={{ perspective: 500 }}
      >
        <svg
          viewBox="0 0 100 100"
          width={130}
          height={130}
          className="rounded-xl border-2 border-accent/60 bg-surface"
          style={{ boxShadow: '0 0 24px rgba(212,168,67,0.12)' }}
        >
          {DICE_FACES[face - 1].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={8} fill="#d4a843" />
          ))}
        </svg>
      </motion.div>
      <button
        onClick={roll}
        disabled={rolling}
        className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-accent transition-colors hover:text-text disabled:opacity-50"
      >
        {rolling ? 'rolling...' : '⚄  roll  ⚄'}
      </button>
      <span className="font-mono text-[0.65rem] text-muted/60">rolled: {face}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Panel 4 — Travel: SVG world map
   ─────────────────────────────────────────────── */

const CONTINENTS = [
  'M70,25 L140,20 L155,32 L158,52 L148,72 L132,88 L112,100 L88,110 L72,95 L54,80 L48,60 L52,40 Z',
  'M165,32 L195,27 L210,38 L214,50 L208,62 L194,68 L172,66 L160,55 L158,40 Z',
  'M170,68 L204,65 L218,78 L222,102 L216,132 L198,152 L180,154 L165,140 L159,114 L162,82 Z',
  'M108,102 L140,97 L152,112 L148,148 L136,168 L118,170 L104,156 L96,130 L98,112 Z',
  'M215,24 L322,20 L358,38 L354,68 L328,82 L296,90 L266,92 L238,82 L215,68 L212,46 Z',
  'M294,140 L328,134 L346,150 L338,168 L312,172 L292,158 Z',
];

const TRAVEL_DOTS = [
  { x: 188, y: 44, label: 'Germany' },
  { x: 118, y: 56, label: 'Connecticut' },
  { x: 200, y: 37, label: 'Tallinn' },
  { x: 186, y: 59, label: 'Sardinia' },
  { x: 224, y: 50, label: 'Georgia' },
];

function WorldMap() {
  return (
    <div className="relative w-full max-w-md">
      <svg
        viewBox="0 0 400 200"
        className="w-full rounded-md border border-border/40"
        style={{ background: '#0f1014' }}
      >
        {/* Ocean grid */}
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * 22}
            x2={400}
            y2={i * 22}
            stroke="#1a1a1a"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * 22}
            y1={0}
            x2={i * 22}
            y2={200}
            stroke="#1a1a1a"
            strokeWidth={0.5}
          />
        ))}

        {/* Continents */}
        {CONTINENTS.map((d, i) => (
          <path key={i} d={d} fill="#1e2028" stroke="#2e3040" strokeWidth={0.8} />
        ))}

        {/* Pulsing dots */}
        {TRAVEL_DOTS.map((dot) => (
          <g key={dot.label}>
            <motion.circle
              cx={dot.x}
              cy={dot.y}
              r={6}
              fill="rgba(212,168,67,0.15)"
              animate={{ r: [6, 12, 6], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle cx={dot.x} cy={dot.y} r={3} fill="#d4a843" />
            <text
              x={dot.x + 5}
              y={dot.y - 6}
              fill="#888880"
              fontSize={7}
              fontFamily="var(--font-fira), monospace"
              className="select-none"
            >
              {dot.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Panel definitions
   ─────────────────────────────────────────────── */

type PanelDef = {
  n: string;
  title: string;
  bullets: string[];
  gradient: string;
  visual: React.ReactNode;
};

const PANELS: PanelDef[] = [
  {
    n: '01 / 04',
    title: 'Piano',
    bullets: [
      'Trained classically from childhood.',
      'Competed in regional competitions.',
      'Currently working through Chopin Ballades.',
    ],
    gradient: 'from-[#0d0d10] to-[#14141c]',
    visual: <Equalizer />,
  },
  {
    n: '02 / 04',
    title: 'Running',
    bullets: [
      'Regular long-distance runs through Tübingen.',
      'Half-marathon training since 2024.',
      'Trail running in the Swabian Alps.',
    ],
    gradient: 'from-[#0d100d] to-[#0d160d]',
    visual: <RunningRoute />,
  },
  {
    n: '03 / 04',
    title: 'Roguelikes',
    bullets: [
      'Dead Cells, Hades, Balatro.',
      'Drawn to emergent difficulty and permadeath.',
      'The intersection of probability and pattern.',
    ],
    gradient: 'from-[#100d0d] to-[#1c1414]',
    visual: <Dice />,
  },
  {
    n: '04 / 04',
    title: 'Travel',
    bullets: [
      'Farmington CT (USA) · 6 months.',
      'Tallinn, Estonia · exchange semester.',
      'Sardinia · April 2026.',
      'Georgia · July 2026 (planned).',
    ],
    gradient: 'from-[#10100d] to-[#1a1a0d]',
    visual: <WorldMap />,
  },
];

/* ────────────────────────────────────────────────
   Page
   ─────────────────────────────────────────────── */

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
            start: 'left 75%',
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
      {/* ── Opener ── */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden py-28">
        {/* Giant bg text */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display font-light leading-[0.85] text-white/[0.03] select-none"
          style={{ fontSize: 'clamp(6rem, 18vw, 14rem)' }}
        >
          BEYOND
        </div>

        {/* Gradient haze */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-accent/8 to-transparent"
        />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <DodecahedronScene />
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-fluid-3xl tracking-tighter"
          >
            Beyond the Code
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-md font-mono text-sm text-muted"
          >
            Four things I keep doing when I close the laptop.
          </motion.p>
        </div>
      </section>

      {/* ── Horizontal pinned panels ── */}
      <div ref={wrapRef} className="relative overflow-hidden">
        <div ref={trackRef} className="flex h-screen items-stretch will-change-transform">
          {PANELS.map((p) => (
            <section
              key={p.title}
              className={`relative flex h-screen w-screen flex-shrink-0 items-center bg-gradient-to-br ${p.gradient}`}
            >
              <div
                data-panel-inner
                className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-col gap-8 px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-12"
              >
                {/* Text */}
                <div className="flex max-w-md flex-col gap-5">
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

                {/* Visual */}
                <div className="flex items-center justify-center">{p.visual}</div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ── Footer note ── */}
      <section className="mx-auto max-w-screen-md px-6 py-20 text-center">
        <h3 className="font-display text-fluid-xl tracking-tight">More on the about page.</h3>
        <p className="mx-auto mt-3 max-w-sm font-mono text-sm text-muted">
          Full timeline, projects, and contact channels.
        </p>
      </section>
    </div>
  );
}
