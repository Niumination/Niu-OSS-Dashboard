import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#14110d', 2: '#1b1712', 3: '#241e17' },
        cream: { DEFAULT: '#f2ecdf', dim: '#b9b1a2' },
        ember: { DEFAULT: '#e05a1e', soft: '#f07f45' },
        spotlight: { DEFAULT: '#00e5ff', dim: '#0e7490' },
        success: '#3ddc97',
        warn: '#f5c518',
        danger: '#ff5d5d',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '3xl': '22px',
        '4xl': '28px',
      },
      boxShadow: {
        glow: '0 0 32px -8px rgba(224,90,30,0.55)',
        'glow-cyan': '0 0 32px -8px rgba(0,229,255,0.4)',
        card: '0 12px 40px -16px rgba(0,0,0,0.7)',
      },
      keyframes: {
        'float-orb': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(40px,-30px) scale(1.05)' },
          '66%': { transform: 'translate(-30px,20px) scale(0.97)' },
        },
        breathe: {
          '0%,100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)', filter: 'blur(6px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'float-orb': 'float-orb 14s ease-in-out infinite',
        breathe: 'breathe 3.2s ease-in-out infinite',
        rise: 'rise 0.8s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.8s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        marquee: 'marquee 42s linear infinite',
        'spin-slow': 'spin-slow 28s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
