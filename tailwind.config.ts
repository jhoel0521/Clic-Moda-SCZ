import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/shared/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* Paleta de marca */
        brand: {
          DEFAULT: '#c2410c',
          dark: '#9a3412',
          light: '#ea580c',
          subtle: 'rgba(194, 65, 12, 0.12)',
        },

        /* Fondos */
        bg: {
          DEFAULT: '#fafaf9',
          secondary: '#f5f5f4',
        },

        /* Superficies */
        surface: {
          DEFAULT: '#ffffff',
          raised: '#ffffff',
          hover: '#f5f5f4',
        },

        /* Bordes */
        border: {
          DEFAULT: 'rgba(30, 22, 28, 0.08)',
          hover: 'rgba(30, 22, 28, 0.16)',
          brand: 'rgba(194, 65, 12, 0.24)',
        },

        /* Texto */
        text: {
          primary: '#1c1917',
          secondary: '#57534e',
          muted: '#78716c',
          inverse: '#ffffff',
        },

        /* Semánticos */
        success: '#16a34a',
        'success-dark': '#15803d',
        warning: '#d97706',
        danger: '#dc2626',
        'danger-dark': '#b91c1c',
        info: '#0284c7',
      },

      boxShadow: {
        sm: '0 1px 2px rgba(42, 24, 34, 0.05)',
        md: '0 6px 20px rgba(42, 24, 34, 0.08)',
        lg: '0 18px 40px rgba(42, 24, 34, 0.12)',
        brand: '0 12px 26px rgba(194, 65, 12, 0.22)',
      },

      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },

      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },

      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out both',
        'slide-in': 'slideIn 0.3s ease-out both',
        'pulse-brand': 'pulse-brand 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(8px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideIn: {
          from: {
            opacity: '0',
            transform: 'translateX(-16px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'pulse-brand': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(194, 65, 12, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 0 8px rgba(194, 65, 12, 0)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
