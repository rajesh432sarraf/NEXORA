/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          bg: '#0D0D0D',
          surface: '#171717',
          card: '#232323',
          border: '#343434',
          text: {
            primary: '#F8F8F8',
            secondary: '#A3A3A3',
            muted: '#666666'
          },
          emerald: '#18C29C',
          ai: '#5EF2C7',
          gold: '#D6B25E',
          copper: '#B87333',
          warning: '#FFB547',
          danger: '#FF4D6D'
        }
      },
      borderRadius: {
        'obsidian': '14px',
        'DEFAULT': '14px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'emerald-glow': '0 0 20px rgba(24, 194, 156, 0.25)',
        'ai-glow': '0 0 20px rgba(94, 242, 199, 0.3)',
        'gold-glow': '0 0 20px rgba(214, 178, 94, 0.25)'
      }
    },
  },
  plugins: [],
}
