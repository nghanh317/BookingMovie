/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F5C518',
          50:  '#FFFDE7',
          100: '#FFF9C4',
          200: '#FFF176',
          300: '#FFE940',
          400: '#FFDE0A',
          500: '#F5C518',
          600: '#D4A800',
          700: '#A87E00',
          800: '#7C5D00',
          900: '#503C00',
        },
        accent: {
          DEFAULT: '#E50914',
          light: '#FF3B47',
          dark:  '#B0070F',
        },
        cinema: {
          black:   '#0A0A0F',
          dark:    '#111118',
          surface: '#1A1A24',
          card:    '#1E1E2C',
          border:  '#2A2A3E',
          muted:   '#A0A0B4',
          text:    '#E8E8F0',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-cinema': 'linear-gradient(180deg, rgba(10,10,15,0) 0%, rgba(10,10,15,0.8) 60%, #0A0A0F 100%)',
        'gradient-card':   'linear-gradient(135deg, #1E1E2C 0%, #141420 100%)',
        'gradient-gold':   'linear-gradient(135deg, #F5C518 0%, #D4A800 100%)',
        'gradient-red':    'linear-gradient(135deg, #E50914 0%, #B0070F 100%)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(245,197,24,0.25)',
        'glow-red':  '0 0 20px rgba(229,9,20,0.25)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in':     'fadeIn 0.3s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}
