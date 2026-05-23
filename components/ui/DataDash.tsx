'use client';

import { useEffect, useRef, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'dead';

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: ObsType;
}

type ObsType = 'NULL' | 'NaN' | '403' | 'TIMEOUT' | 'ENOENT' | 'undefined' | 'npm i';

const W = 700;
const H = 360;
const GROUND = 280;
const PSIZE = 40;
const PX = 80;
const GRAVITY = 0.58;
const JUMP_V = -13;

const OBS_DEFS: Record<ObsType, { fill: string; stroke: string; text: string; w: [number, number]; h: [number, number] }> = {
  'NULL':      { fill: '#0f0f0f', stroke: '#333', text: '#555',    w: [44, 60], h: [36, 52] },
  'NaN':       { fill: '#0a0f1a', stroke: '#3b5bdb', text: '#748ffc', w: [44, 56], h: [40, 56] },
  '403':       { fill: '#1f0a0a', stroke: '#e61919', text: '#ff6b6b', w: [48, 62], h: [38, 54] },
  'TIMEOUT':   { fill: '#1a1400', stroke: '#e67700', text: '#ffa94d', w: [60, 78], h: [42, 58] },
  'ENOENT':    { fill: '#0a1a0f', stroke: '#2f9e44', text: '#69db7c', w: [58, 74], h: [44, 60] },
  'undefined': { fill: '#150a1a', stroke: '#9c36b5', text: '#cc5de8', w: [74, 90], h: [36, 50] },
  'npm i':     { fill: '#0d0d0d', stroke: '#444', text: '#e61919',   w: [110, 130], h: [34, 46] },
};

const OBS_TYPES: ObsType[] = ['NULL', 'NaN', '403', 'TIMEOUT', 'ENOENT', 'undefined', 'npm i'];

const DEATH_MESSAGES = [
  'segfault (core dumped)',
  'TypeError: undefined is not a function',
  'fatal: not a git repository',
  'git blame: it was you. always you.',
  'your tests pass because you have no tests',
  'pip install everything and pray',
  'NullPointerException in prod',
  'rm -rf and regret',
  'localhost refused to connect',
  'infinite loop detected... eventually',
  'merge conflict: YOU vs REALITY',
  'out of memory. out of hope.',
];

export default function DataDash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const state = useRef<GameState>('idle');
  const score = useRef(0);
  const highScore = useRef(0);
  const streak = useRef(0);
  const bestStreak = useRef(0);
  const playerY = useRef(GROUND - PSIZE);
  const velY = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const frame = useRef(0);
  const spawnIn = useRef(90);
  const speed = useRef(5);
  const raf = useRef(0);
  const deathMsg = useRef('');
  const lastObsX = useRef(0);

  const resetGame = useCallback(() => {
    score.current = 0;
    streak.current = 0;
    playerY.current = GROUND - PSIZE;
    velY.current = 0;
    obstacles.current = [];
    frame.current = 0;
    spawnIn.current = 90;
    speed.current = 5;
    lastObsX.current = 0;
    deathMsg.current = '';
    state.current = 'playing';
  }, []);

  const jump = useCallback(() => {
    if (state.current === 'idle' || state.current === 'dead') {
      resetGame();
      return;
    }
    if (playerY.current >= GROUND - PSIZE - 2) {
      velY.current = JUMP_V;
    }
  }, [resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    try {
      highScore.current = parseInt(localStorage.getItem('datadash-hs') || '0');
      bestStreak.current = parseInt(localStorage.getItem('datadash-bs') || '0');
    } catch {}

    function drawPlayer() {
      const y = playerY.current;
      const isJumping = y < GROUND - PSIZE - 2;

      /* body */
      ctx.strokeStyle = '#e61919';
      ctx.lineWidth = isJumping ? 2.5 : 2;
      ctx.strokeRect(PX, y, PSIZE, PSIZE);
      /* inner box */
      ctx.strokeStyle = 'rgba(230,25,25,0.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(PX + 4, y + 4, PSIZE - 8, PSIZE - 8);
      /* label */
      ctx.fillStyle = '#e61919';
      ctx.font = 'bold 12px "JetBrains Mono", "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('df', PX + PSIZE / 2, y + 26);
    }

    function drawObs(o: Obstacle) {
      const d = OBS_DEFS[o.type];
      ctx.fillStyle = d.fill;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = d.stroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
      /* top accent line */
      ctx.fillStyle = d.stroke;
      ctx.fillRect(o.x, o.y, o.w, 2);
      /* label */
      ctx.fillStyle = d.text;
      ctx.font = `bold ${o.type.length > 6 ? 9 : 10}px "JetBrains Mono", "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(o.type, o.x + o.w / 2, o.y + o.h / 2 + 4);
    }

    function collision(o: Obstacle): boolean {
      const m = 6;
      return (
        PX + m < o.x + o.w &&
        PX + PSIZE - m > o.x &&
        playerY.current + m < o.y + o.h &&
        playerY.current + PSIZE - m > o.y
      );
    }

    function drawScene() {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      /* vertical grid */
      ctx.strokeStyle = 'rgba(28,28,28,0.8)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 70) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }

      /* ground line */
      ctx.strokeStyle = '#1c1c1c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND);
      ctx.lineTo(W, GROUND);
      ctx.stroke();

      /* subtle scanlines */
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      for (let sy = 0; sy < H; sy += 4) ctx.fillRect(0, sy, W, 2);
    }

    function drawHUD() {
      /* score */
      ctx.textAlign = 'right';
      ctx.fillStyle = '#585854';
      ctx.font = '10px "JetBrains Mono", "Courier New", monospace';
      ctx.fillText(`BEST ${highScore.current}`, W - 12, 20);
      ctx.fillStyle = '#e4e0d8';
      ctx.font = '12px "JetBrains Mono", "Courier New", monospace';
      ctx.fillText(`${score.current}`, W - 12, 38);

      /* streak */
      if (streak.current >= 3) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#e61919';
        ctx.font = `bold 11px "JetBrains Mono", "Courier New", monospace`;
        ctx.fillText(`STREAK x${streak.current}`, 12, 20);
      }

      /* speed indicator */
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1c1c1c';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`SPD ${speed.current.toFixed(1)}`, 12, H - 10);
    }

    function loop() {
      raf.current = requestAnimationFrame(loop);
      drawScene();

      /* ── IDLE ── */
      if (state.current === 'idle') {
        drawPlayer();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e61919';
        ctx.font = 'bold 32px "JetBrains Mono", "Courier New", monospace';
        ctx.fillText('DATA DASH', W / 2, H / 2 - 28);
        ctx.strokeStyle = '#e61919';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 80, H / 2 - 16);
        ctx.lineTo(W / 2 + 80, H / 2 - 16);
        ctx.stroke();
        ctx.fillStyle = '#585854';
        ctx.font = '11px "JetBrains Mono", "Courier New", monospace';
        ctx.fillText('SPACE / TAP TO INITIALIZE', W / 2, H / 2 + 10);
        ctx.fillStyle = '#1c1c1c';
        ctx.font = '10px "JetBrains Mono", "Courier New", monospace';
        ctx.fillText(`BEST RUN: ${highScore.current} · BEST STREAK: ${bestStreak.current}`, W / 2, H / 2 + 34);
        return;
      }

      /* ── PLAYING ── */
      if (state.current === 'playing') {
        frame.current++;
        score.current++;
        speed.current = 5 + Math.floor(score.current / 400) * 0.7;

        /* physics */
        velY.current += GRAVITY;
        playerY.current += velY.current;
        if (playerY.current >= GROUND - PSIZE) {
          playerY.current = GROUND - PSIZE;
          velY.current = 0;
        }

        /* spawn */
        spawnIn.current--;
        if (spawnIn.current <= 0) {
          const type = OBS_TYPES[Math.floor(Math.random() * OBS_TYPES.length)];
          const d = OBS_DEFS[type];
          const h = d.h[0] + Math.floor(Math.random() * (d.h[1] - d.h[0]));
          const w = d.w[0] + Math.floor(Math.random() * (d.w[1] - d.w[0]));
          obstacles.current.push({ x: W + 10, y: GROUND - h, w, h, type });
          spawnIn.current = 68 + Math.floor(Math.random() * 72);
        }

        /* move + cull + streak */
        const before = obstacles.current.length;
        obstacles.current = obstacles.current.filter((o) => {
          o.x -= speed.current;
          if (o.x + o.w < PX - 10 && lastObsX.current !== o.x) {
            lastObsX.current = o.x;
            streak.current++;
            if (streak.current > bestStreak.current) {
              bestStreak.current = streak.current;
              try { localStorage.setItem('datadash-bs', String(bestStreak.current)); } catch {}
            }
          }
          return o.x + o.w > -10;
        });

        /* collision */
        for (const o of obstacles.current) {
          if (collision(o)) {
            state.current = 'dead';
            deathMsg.current = DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)];
            if (score.current > highScore.current) {
              highScore.current = score.current;
              try { localStorage.setItem('datadash-hs', String(highScore.current)); } catch {}
            }
            streak.current = 0;
          }
        }

        for (const o of obstacles.current) drawObs(o);
        drawPlayer();
        drawHUD();
      }

      /* ── DEAD ── */
      if (state.current === 'dead') {
        for (const o of obstacles.current) drawObs(o);
        drawPlayer();

        ctx.fillStyle = 'rgba(10,10,10,0.88)';
        ctx.fillRect(0, 0, W, H);

        /* red border frame */
        ctx.strokeStyle = '#e61919';
        ctx.lineWidth = 1;
        ctx.strokeRect(W / 2 - 200, H / 2 - 72, 400, 138);
        ctx.strokeStyle = 'rgba(230,25,25,0.2)';
        ctx.strokeRect(W / 2 - 196, H / 2 - 68, 392, 130);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#e61919';
        ctx.font = 'bold 18px "JetBrains Mono", "Courier New", monospace';
        ctx.fillText('[ PROCESS KILLED ]', W / 2, H / 2 - 42);

        ctx.fillStyle = '#585854';
        ctx.font = '10px "JetBrains Mono", "Courier New", monospace';
        ctx.fillText(`> ${deathMsg.current}`, W / 2, H / 2 - 20);

        ctx.fillStyle = '#e4e0d8';
        ctx.font = '13px "JetBrains Mono", "Courier New", monospace';
        ctx.fillText(`exit code: ${score.current}`, W / 2, H / 2 + 8);

        ctx.fillStyle = '#1c1c1c';
        ctx.font = '10px "JetBrains Mono", "Courier New", monospace';
        ctx.fillText(`best: ${highScore.current}  ·  streak: ${bestStreak.current}`, W / 2, H / 2 + 30);

        ctx.fillStyle = '#585854';
        ctx.font = '10px "JetBrains Mono", "Courier New", monospace';
        ctx.fillText('SPACE / TAP TO RESPAWN', W / 2, H / 2 + 54);
      }
    }

    raf.current = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); jump(); }
    };
    const onClick = () => jump();

    window.addEventListener('keydown', onKey);
    canvas.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('click', onClick);
    };
  }, [jump]);

  return (
    <div className="select-none">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full cursor-pointer border border-border"
        style={{ imageRendering: 'crisp-edges', touchAction: 'manipulation' }}
      />
      <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted/60">
        dodge NULL · NaN · 403 · TIMEOUT · ENOENT · undefined · npm i — SPACE or tap
      </p>
    </div>
  );
}
