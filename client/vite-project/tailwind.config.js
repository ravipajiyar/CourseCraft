/**
 * CourseCraft design system
 * @type {import('tailwindcss').Config}
 */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base canvas — deep midnight with a cool blue undertone
        ink: {
          950: '#05050A',
          900: '#08080F',
          850: '#0B0B15',
          800: '#10101C',
          700: '#161626',
          600: '#1E1E30',
        },
        // Primary brand — violet
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        // Secondary — indigo
        iris: {
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
        // Accent — cyan, used for AI / live signals
        aqua: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        // Warm accent — amber, used for highlights & streaks
        amber: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        mint: {
          400: '#34D399',
          500: '#10B981',
        },
        rose: {
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
        },
        // Text ramp
        chalk: {
          DEFAULT: '#F8FAFC',
          soft: '#CBD5E1',
          muted: '#94A3B8',
          // >= 4.5:1 against the #05050A base (WCAG AA for small text)
          faint: '#6E7F99',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      spacing: {
        13: '3.25rem',
        18: '4.5rem',
        22: '5.5rem',
      },
      // Extend Tailwind's 5-step opacity ramp with the subtler values the
      // glass surfaces rely on (e.g. border-white/12).
      opacity: {
        ...defaultTheme.opacity,
        3: '0.03',
        4: '0.04',
        6: '0.06',
        8: '0.08',
        12: '0.12',
        18: '0.18',
        22: '0.22',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(139,92,246,0.25), 0 18px 50px -12px rgba(139,92,246,0.55)',
        'glow-cyan':
          '0 0 0 1px rgba(34,211,238,0.25), 0 18px 50px -12px rgba(34,211,238,0.45)',
        lift: '0 24px 60px -20px rgba(0,0,0,0.85)',
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #22D3EE 100%)',
        'brand-gradient-soft':
          'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.14) 50%, rgba(34,211,238,0.14) 100%)',
        'grid-fade':
          'linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -60px) scale(1.12)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.92)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%': { transform: 'translateY(-6px)', opacity: '1' },
        },
        'caret-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        blob: 'blob 14s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.5s ease-out both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'spin-slow': 'spin-slow 14s linear infinite',
        marquee: 'marquee 38s linear infinite',
        'bounce-dot': 'bounce-dot 1.2s ease-in-out infinite',
        'caret-blink': 'caret-blink 1s step-end infinite',
      },
    },
  },
  /*
   * Plugins: none.
   *
   * daisyUI was removed on purpose — daisyUI 5 targets Tailwind CSS v4 and,
   * when loaded into a v3 project, ships colliding utility classes (`.glass`,
   * `.btn`, …) that silently override the CourseCraft design-system classes
   * defined in src/index.css. The project now uses a bespoke Tailwind design
   * system instead.
   *
   * The FontAwesome plugin was removed for the same reason it is no longer
   * needed: every icon now renders as an inline SVG through `react-icons/fa6`,
   * so the FontAwesome webfont and its `fa-*` classes are dead weight.
   */
  plugins: [],
};
