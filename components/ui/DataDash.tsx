'use client';

import { useEffect, useRef, useCallback } from 'react';

type GameState = 'idle' | 'playing' | 'dead';

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'NULL' | '403' | 'TIMEOUT';
}

const W = 700;
const H = 340;
const GROUND = 265;
const PSIZE = 40;
const PX = 80;
const GRAVITY = 0.6;
const JUMP_V = -12;

const OBS_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  NULL: { fill: '#111', stroke: '#333', text: '#666' },
  '403': { fill: '#1f0a0a', stroke: '#ef4444', text: '#f87171' },
  TIMEOUT: { fill: '#1a1600', stroke: '#ca8a04', text: '#fbbf24' },
};
const OBS_TYPES: Obstacle['type'][] = ['NULL', '403', 'TIMEOUT'];

export default function DataDash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* game state refs — mutable without re-renders */
  const state = useRef<GameState>('idle');
  const score = useRef(0);
  const highScore = useRef(0);
  const playerY = useRef(GROUND - PSIZE);
  const velY = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const frame = useRef(0);
  const spawnIn = useRef(90);
  const speed = useRef(5);
  const raf = useRef(0);

  const resetGame = useCallback(() => {
    score.current = 0;
    playerY.current = GROUND - PSIZE;
    velY.current = 0;
    obstacles.current = [];
    frame.current = 0;
    spawnIn.current = 90;
    speed.current = 5;
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
    } catch {}

    /* ── draw helpers ── */
    function drawPlayer() {
      const y = playerY.current;
      ctx.strokeStyle = '#d4a843';
      ctx.lineWidth = 2;
      ctx.strokeRect(PX, y, PSIZE, PSIZE);
      /* inner glow */
      ctx.strokeStyle = 'rgba(212,168,67,0.15)';
      ctx.strokeRect(PX + 3, y + 3, PSIZE - 6, PSIZE - 6);
      ctx.fillStyle = '#d4a843';
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('df', PX + PSIZE / 2, y + 26);
    }

    function drawObs(o: Obstacle) {
      const c = OBS_COLORS[o.type];
      ctx.fillStyle = c.fill;
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = c.text;
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(o.type, o.x + o.w / 2, o.y + o.h / 2 + 4);
    }

    function collision(o: Obstacle): boolean {
      const margin = 5;
      return (
        PX + margin < o.x + o.w &&
        PX + PSIZE - margin > o.x &&
        playerY.current + margin < o.y + o.h &&
        playerY.current + PSIZE - margin > o.y
      );
    }

    function drawScene() {
      /* background */
      ctx.fillStyle = '#0d0d0d';
      ctx.fillRect(0, 0, W, H);

      /* subtle grid lines */
      ctx.strokeStyle = 'rgba(37,37,37,0.5)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 60) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }

      /* ground */
      ctx.strokeStyle = '#252525';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND);
      ctx.lineTo(W, GROUND);
      ctx.stroke();

      /* scanline overlay */
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      for (let sy = 0; sy < H; sy += 4) ctx.fillRect(0, sy, W, 2);
    }

    /* ── main loop ── */
    function loop() {
      raf.current = requestAnimationFrame(loop);
      drawScene();

      /* ─ IDLE ─ */
      if (state.current === 'idle') {
        drawPlayer();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#d4a843';
        ctx.font = 'bold 28px "Courier New", monospace';
        ctx.fillText('DATA DASH', W / 2, H / 2 - 22);
        ctx.fillStyle = '#888880';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText('SPACE / TAP to start', W / 2, H / 2 + 8);
        ctx.fillStyle = '#444';
        ctx.font = '11px "Courier New", monospace';
        ctx.fillText(`best: ${highScore.current}`, W / 2, H / 2 + 30);
        return;
      }

      /* ─ PLAYING ─ */
      if (state.current === 'playing') {
        frame.current++;
        score.current++;
        speed.current = 5 + Math.floor(score.current / 500) * 0.6;

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
          const h = 38 + Math.floor(Math.random() * 28);
          const w = 48 + Math.floor(Math.random() * 32);
          obstacles.current.push({ x: W + 10, y: GROUND - h, w, h, type });
          spawnIn.current = 75 + Math.floor(Math.random() * 65);
        }

        /* move + cull */
        obstacles.current = obstacles.current.filter((o) => {
          o.x -= speed.current;
          return o.x + o.w > -10;
        });

        /* collision */
        for (const o of obstacles.current) {
          if (collision(o)) {
            state.current = 'dead';
            if (score.current > highScore.current) {
              highScore.current = score.current;
              try { localStorage.setItem('datadash-hs', String(highScore.current)); } catch {}
            }
          }
        }

        for (const o of obstacles.current) drawObs(o);
        drawPlayer();

        /* HUD */
        ctx.textAlign = 'right';
        ctx.fillStyle = '#444';
        ctx.font = '11px "Courier New", monospace';
        ctx.fillText(`best  ${highScore.current}`, W - 12, 36);
        ctx.fillStyle = '#888880';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText(`score ${score.current}`, W - 12, 20);
      }

      /* ─ DEAD ─ */
      if (state.current === 'dead') {
        for (const o of obstacles.current) drawObs(o);
        drawPlayer();

        ctx.fillStyle = 'rgba(13,13,13,0.82)';
        ctx.fillRect(0, 0, W, H);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.fillText('PROCESS KILLED', W / 2, H / 2 - 24);

        ctx.fillStyle = '#888880';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText(`exit code: ${score.current} pts`, W / 2, H / 2 + 4);
        ctx.fillText('SPACE / TAP to restart', W / 2, H / 2 + 26);

        ctx.fillStyle = '#444';
        ctx.font = '11px "Courier New", monospace';
        ctx.fillText(`best: ${highScore.current}`, W / 2, H / 2 + 50);
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
        className="w-full cursor-pointer rounded-md border border-border"
        style={{ imageRendering: 'crisp-edges', touchAction: 'manipulation' }}
      />
      <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted/60">
        jump over NULL, 403, TIMEOUT · SPACE or tap
      </p>
    </div>
  );
}
