/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        mint: '#2EE59D',
        coral: '#FF6B5F',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(16, 24, 40, 0.10)',
      },
    },
  },
  plugins: [],
};
