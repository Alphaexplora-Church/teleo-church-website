/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-linen': '#E6EDEF',
        'deep-teal': '#074F56',
        'midnight-teal': '#002E38',
        'harvest-orange': '#EC662C',
      },
      fontFamily: {
        serif: ['Vogun', 'serif'],
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}