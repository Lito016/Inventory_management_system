/** @type {import('tailwindcss').Config} */
const alpha = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        gray: {
          50: alpha('--gray-50'), 100: alpha('--gray-100'), 200: alpha('--gray-200'),
          300: alpha('--gray-300'), 400: alpha('--gray-400'), 500: alpha('--gray-500'),
          600: alpha('--gray-600'), 700: alpha('--gray-700'), 800: alpha('--gray-800'),
          900: alpha('--gray-900'),
        },
        slate: {
          50: alpha('--slate-50'), 100: alpha('--slate-100'), 200: alpha('--slate-200'),
          300: alpha('--slate-300'), 400: alpha('--slate-400'), 500: alpha('--slate-500'),
          600: alpha('--slate-600'), 700: alpha('--slate-700'), 800: alpha('--slate-800'),
          900: alpha('--slate-900'),
        },
        primary: {
          50: alpha('--accent-50'), 100: alpha('--accent-100'), 400: alpha('--accent-400'),
          500: alpha('--accent-500'), 600: alpha('--accent-600'), 700: alpha('--accent-700'),
        },
        accent: {
          50: alpha('--accent-50'), 100: alpha('--accent-100'), 400: alpha('--accent-400'),
          500: alpha('--accent-500'), 600: alpha('--accent-600'), 700: alpha('--accent-700'),
        },
        blue: {
          50: alpha('--accent-50'), 100: alpha('--accent-100'), 400: alpha('--accent-400'),
          500: alpha('--accent-500'), 600: alpha('--accent-600'), 700: alpha('--accent-700'),
        },
        info: {
          50: alpha('--accent-50'), 500: alpha('--accent-500'),
          600: alpha('--accent-600'), 700: alpha('--accent-700'),
        },
        success: {
          50: alpha('--success-50'), 500: alpha('--success-500'),
          600: alpha('--success-600'), 700: alpha('--success-700'),
        },
        warning: {
          50: alpha('--warning-50'), 500: alpha('--warning-500'),
          600: alpha('--warning-600'), 700: alpha('--warning-700'),
        },
        error: {
          50: alpha('--error-50'), 500: alpha('--error-500'),
          600: alpha('--error-600'), 700: alpha('--error-700'),
        },
        amber: {
          50: alpha('--amber-50'), 200: alpha('--amber-200'), 300: alpha('--amber-300'),
          800: alpha('--amber-800'), 900: alpha('--amber-900'),
        },
        /* legacy hue aliases — keep old badge classes on semantic, theme-aware tokens */
        red: {
          50: alpha('--error-50'), 200: alpha('--error-200'), 500: alpha('--error-500'),
          600: alpha('--error-600'), 700: alpha('--error-700'),
        },
        green: {
          50: alpha('--success-50'), 200: alpha('--success-200'), 500: alpha('--success-500'),
          600: alpha('--success-600'), 700: alpha('--success-700'),
        },
        purple: {
          50: alpha('--accent-50'), 200: alpha('--accent-200'), 500: alpha('--accent-500'),
          600: alpha('--accent-600'), 700: alpha('--accent-700'),
        },
        indigo: {
          50: alpha('--accent-50'), 200: alpha('--accent-200'), 500: alpha('--accent-500'),
          600: alpha('--accent-600'), 700: alpha('--accent-700'),
        },
        /* semantic aliases for new code */
        canvas: alpha('--page'),
        surface: alpha('--surface'),
        sunken: alpha('--sunken'),
        'on-accent': alpha('--on-accent'),
        link: alpha('--link'),
        'link-hover': alpha('--link-hover'),
        rail: alpha('--rail'),
        'rail-border': alpha('--rail-border'),
        'rail-text': alpha('--rail-text'),
        'rail-muted': alpha('--rail-muted'),
        'rail-ink': alpha('--rail-ink'),
        'rail-active': alpha('--rail-active'),
        'rail-hover': alpha('--rail-hover'),
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(10 14 23 / 0.06)',
        md: '0 4px 10px -2px rgb(10 14 23 / 0.10), 0 2px 4px -2px rgb(10 14 23 / 0.06)',
        lg: '0 12px 24px -6px rgb(10 14 23 / 0.16), 0 4px 8px -4px rgb(10 14 23 / 0.08)',
        glow: '0 0 0 1px rgb(var(--accent-500) / 0.35), 0 4px 16px -4px rgb(var(--accent-600) / 0.35)',
      },
      fontSize: {
        '3xl': ['1.875rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        '2xl': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        lg: ['1.125rem', { lineHeight: '1.556' }],
        base: ['1rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.429' }],
        xs: ['0.75rem', { lineHeight: '1.333' }],
      },
    },
  },
  plugins: [],
};
