/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Consolas', '"Courier New"', 'monospace'],
        mono: ['Consolas', '"Courier New"', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.01em',
        tight: '0.015em',
        normal: '0.04em',
        wide: '0.065em',
        wider: '0.09em',
        widest: '0.14em',
      },
      colors: {
        darkBg: '#121212',
        darkSidebar: '#1A1A1A',
        darkCard: '#222222',
        brandBlue: '#4F8CFF',
        successGreen: '#4ADE80',
        dangerRed: '#EF4444',
        warningYellow: '#FBBF24',
        textPrimary: '#FFFFFF',
        textSecondary: '#B3B3B3',
        darkBorder: 'rgba(255,255,255,0.08)',
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        }
      }
    }
  },
  plugins: [],
}
