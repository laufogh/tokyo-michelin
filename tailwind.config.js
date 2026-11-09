/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        michelin: {
          red: '#BD2333',
          darkRed: '#8F1522',
          gold: '#C5A059',
          lightGold: '#E6D5B8',
        },
        tabelog: {
          orange: '#FF6B00',
          amber: '#E65100',
        },
        reddit: {
          orange: '#FF4500',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
