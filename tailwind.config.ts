import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        bg: '#0f0f0f',
        surface: '#181818',
        border: '#252525',
        muted: '#888880',
        text: '#f2ede7',
        accent: {
          DEFAULT: '#d4a843',
          dim: '#9a7830',
          glow: 'rgba(212, 168, 67, 0.22)',
        },
        prism: {
          deep: '#0a0e1a',
          mid: '#1a2335',
          light: '#c0d0ff',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'fluid-sm': 'clamp(0.85rem, 0.8rem + 0.2vw, 0.95rem)',
        'fluid-base': 'clamp(0.95rem, 0.9rem + 0.3vw, 1.08rem)',
        'fluid-lg': 'clamp(1.12rem, 1rem + 0.5vw, 1.35rem)',
        'fluid-xl': 'clamp(1.5rem, 1.2rem + 1.5vw, 2.4rem)',
        'fluid-2xl': 'clamp(2.2rem, 1.5rem + 3vw, 3.8rem)',
        'fluid-3xl': 'clamp(3rem, 2rem + 5vw, 5.5rem)',
        'fluid-hero': 'clamp(3.5rem, 2.5rem + 8vw, 11rem)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
      },
      backgroundImage: {
        'gradient-conic':
          'conic-gradient(from var(--tw-gradient-from-position), var(--tw-gradient-stops))',
        'gradient-radial':
          'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(1.4)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
        'fade-up': 'fade-up 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 1.6s linear infinite',
        marquee: 'marquee 32s linear infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'soft': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
