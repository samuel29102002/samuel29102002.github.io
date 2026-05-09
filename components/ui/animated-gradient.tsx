'use client';

/**
 * AnimatedGradient — full WebGL fragment-shader gradient that runs continuously.
 *
 * CRITICAL: the animation loop is driven solely by performance.now() and rAF.
 * It never pauses on scroll, only when document.visibilityState === 'hidden'
 * (browser tab background — saves CPU, resumes instantly when visible again).
 *
 * Preset: "prism" — dark navy / cool prism-light flow.
 */

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_resolution;
uniform float u_time;

vec3 palette(float t) {
  vec3 a = vec3(0.04, 0.06, 0.11);
  vec3 b = vec3(0.42, 0.50, 0.65);
  vec3 c = vec3(0.55, 0.70, 1.00);
  vec3 d = vec3(0.05, 0.20, 0.55);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv = uv * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.045;
  float v = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 q = uv + vec2(cos(t + fi * 1.7), sin(t * 0.85 + fi * 2.1)) * 0.55;
    v += 1.0 / max(length(q) - 0.10 * sin(t + fi), 0.06) * 0.034;
  }

  vec3 col = palette(v);
  col = mix(vec3(0.035, 0.045, 0.07), col, smoothstep(0.0, 1.0, v * 0.55));
  // gentle vignette
  float r = length(uv * 0.6);
  col *= 1.0 - smoothstep(0.85, 1.4, r);
  col = clamp(col, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface AnimatedGradientProps {
  preset?: 'prism';
  className?: string;
}

function compile(gl: WebGLRenderingContext, src: string, type: number) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn('shader compile error', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function AnimatedGradient({ className }: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) {
      canvas.style.background =
        'linear-gradient(135deg, #0a0e1a 0%, #1a2335 50%, #0a0e1a 100%)';
      return;
    }

    const vs = compile(gl, VERT, gl.VERTEX_SHADER);
    const fs = compile(gl, FRAG, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('link error', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let running = true;
    const t0 = performance.now();
    const loop = () => {
      if (!running) return;
      const t = (performance.now() - t0) / 1000;
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Pause only when tab is in background — never on scroll
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      try {
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(buf);
        const lose = gl.getExtension('WEBGL_lose_context');
        if (lose) lose.loseContext();
      } catch {}
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('block h-full w-full pointer-events-none', className)}
    />
  );
}
