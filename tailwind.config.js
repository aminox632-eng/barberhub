/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0A0A0A', 800: '#141414', 700: '#1C1C1C', 600: '#262626' },
        gold: { DEFAULT: '#D4AF37', light: '#E8CB6B', dark: '#A8871F' },
        line: '#2E2E2E',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pole: { '0%': { backgroundPosition: '0 0' }, '100%': { backgroundPosition: '0 80px' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: { pole: 'pole 2.4s linear infinite', shimmer: 'shimmer 1.4s infinite' },
    },
  },
  plugins: [],
};
