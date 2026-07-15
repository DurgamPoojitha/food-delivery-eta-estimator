export default {
  content: [
    './index.html',
    './src*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:        '#f97316',
          'orange-dark': '#ea580c',
          'orange-light':'#fb923c',
        },
        navy: {
          950: '#060a14',
          900: '#0a0e1a',
          800: '#0f1429',
          700: '#151b35',
          600: '#1e2642',
          500: '#2a3354',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      animation: {
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'slide-up':   'slideUp 0.45s ease-out forwards',
        'slide-in':   'slideIn 0.4s ease-out forwards',
        'spin-slow':  'spin 1.8s linear infinite',
        'pulse-soft': 'pulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },

      backgroundImage: {
        'hero-gradient':   'radial-gradient(ellipse at top, #1e2642 0%, #0a0e1a 65%)',
        'card-gradient':   'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'orange-gradient': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      },

      boxShadow: {
        'glow-orange': '0 0 35px rgba(249, 115, 22, 0.3)',
        'glow-green':  '0 0 25px rgba(34, 197, 94, 0.2)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover':  '0 8px 40px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
