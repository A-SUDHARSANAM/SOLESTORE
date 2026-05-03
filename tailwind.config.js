/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#111318',
        soft: '#F4F5F7',
      },
      boxShadow: {
        premium: '0 20px 40px -26px rgba(17, 19, 24, 0.45)',
      },
    },
  },
  plugins: [],
}

