/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          vanilla: '#F4EDE3',
          alpine: '#D9CEC1',
          greige: '#B5A69D',
          cherry: '#542126',
          bordeaux: '#291218',
          teal: '#2F7775',
          sage: '#718B78',
          red: '#9E3F45',
          gold: '#D6C09A',
          charcoal: '#2E2E2E',
        },
        command: {
          light: '#F8F4EE', // Vanilla Silk Light baseline
          card: '#FFFFFF',  // Pure crisp white card
          panel: '#F3EDE4', // Soft Alpine Oat panel fill
          border: '#D9CEC1',// Clean Oat border
          cherryBorder: '#542126',
          accent: '#2F7775',// Deep Teal
          gold: '#D6C09A'   // Soft Gold
        },
        status: {
          critical: '#9E3F45',
          high: '#d97706',
          watch: '#D6C09A',
          stable: '#718B78'
        }
      }
    },
  },
  plugins: [],
}


