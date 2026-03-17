// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
        monster: ['Bungee', 'sans-serif'],
      },

      colors: {
        moonPurple: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        moonLime: {
          50:  '#f7ffe0',
          100: '#edffc0',
          200: '#dbff85',
          300: '#c8ff47',
          400: '#a3ff47',
          500: '#85e620',
          600: '#65b80e',
          700: '#4d8c0d',
          800: '#3d6e11',
          900: '#335c12',
          950: '#193305',
        },
        moonGold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        moonCyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
      },

      animation: {
        shimmer:    'shimmer 2s linear infinite',
        glow:       'glow-violet 3.5s ease-in-out infinite',
        float:      'float-gentle 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out both',
        'spin-slow': 'spin-slow 22s linear infinite',
      },

      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1)' },
          '50%':      { boxShadow: '0 0 40px rgba(139,92,246,0.6), 0 0 80px rgba(139,92,246,0.25)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },

      boxShadow: {
        'glow-purple': '0 0 30px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.15)',
        'glow-purple-sm': '0 0 15px rgba(124,58,237,0.3)',
        'glow-lime':   '0 0 30px rgba(163,255,71,0.4),  0 0 60px rgba(163,255,71,0.15)',
        'glow-lime-sm':'0 0 15px rgba(163,255,71,0.3)',
        'glow-gold':   '0 0 30px rgba(245,158,11,0.4),  0 0 60px rgba(245,158,11,0.15)',
        'glow-gold-sm':'0 0 15px rgba(245,158,11,0.3)',
        'glow-cyan':   '0 0 30px rgba(6,182,212,0.4),   0 0 60px rgba(6,182,212,0.15)',
        'card':        '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.25) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}

export default config
