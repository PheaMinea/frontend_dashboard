/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          900: '#0B1849',
          800: '#16265f',
          700: '#1f3a7a',
        },
        red: {
          400: '#E8524A',
          500: '#C0392B',
          600: '#A93226',
          700: '#7B241C',
        },
        yellow: {
          400: '#f6c23e',
          500: '#e5b532',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Kantumruy Pro', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(50px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}