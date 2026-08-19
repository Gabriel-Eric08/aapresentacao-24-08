/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        institucional: {
          bg: '#F9F5FF',
          deep: '#5B21B6',
          vibrant: '#7E22CE',
          text: '#6B21A8',
          textAlt: '#9333EA',
          soft: '#F3E8FF',
          border: '#E9D5FF',
          amber: '#F59E0B',
          emerald: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(91, 33, 182, 0.08), 0 1px 2px -1px rgba(91, 33, 182, 0.08)',
        cardHover: '0 4px 12px -2px rgba(91, 33, 182, 0.15)',
      },
    },
  },
  plugins: [],
}
