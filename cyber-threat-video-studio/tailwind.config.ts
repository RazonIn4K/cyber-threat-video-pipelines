import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: {
          DEFAULT: '#0d1718',
          card: '#142426',
          softer: '#1b2f31',
        },
        primary: {
          DEFAULT: '#0ddff2',
          dark: '#0bcce0',
          fg: '#041c1f',
        },
        accent: '#7c3aed',
        border: '#244143',
        muted: '#6b7c7d',
        status: {
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#0ea5e9',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(13,223,242,0.25), 0 10px 30px rgba(13,223,242,0.15)',
      },
      spacing: {
        13: '3.25rem',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        pulse: 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
