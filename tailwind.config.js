/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  darkMode: ['class', '[data-mui-color-scheme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Soft, calm primary leaning blue-violet
        primary: {
          DEFAULT: '#7C8CF8',
          50: '#F3F6FF',
          100: '#E6EBFF',
          200: '#CCD7FF',
          300: '#B3C3FF',
          400: '#99AEFF',
          500: '#8099FF',
          600: '#7C8CF8',
          700: '#6A78E6',
          800: '#5A69CC',
          900: '#4A59B3',
        },
        roseSoft: {
          100: '#FDE7EF',
          200: '#FCCFE0',
          300: '#FAB8D2',
        },
        indigoSoft: {
          100: '#E9ECFF',
          200: '#D6DBFF',
          300: '#C3CAFF',
        },
        skySoft: {
          100: '#E9F7FF',
          200: '#D4F0FF',
          300: '#BFE9FF',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.1)',
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out both',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
