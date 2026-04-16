/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sand: {
          50: '#fdf8f3',
          100: '#faeede',
          200: '#f3d9b8',
          300: '#ebc189',
          400: '#e0a85e',
          500: '#d18d3e',
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.06)',
        card: '0 4px 14px rgba(2,132,199,0.08)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'pulse-soft': 'pulseSoft 2.2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
