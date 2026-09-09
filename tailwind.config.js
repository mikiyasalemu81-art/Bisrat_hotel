/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gold Palette (#C8A24A primary)
        gold: {
          50: '#FDFBF7',
          100: '#FAF2E1',
          200: '#F3E3BE',
          300: '#E6D094',
          400: '#D8B96D',
          500: '#C8A24A', // Primary Gold
          600: '#B58E38', // Hover Gold
          700: '#977227',
          800: '#78591F',
          900: '#5C4318',
        },
        // Dark Charcoal Palette (#1A1A1A base)
        charcoal: {
          500: '#2A2A2A',
          700: '#222222',
          800: '#1A1A1A', // Dark Base
          900: '#141414',
          950: '#0D0D0D',
        },
        // Warm Cream Palette (#FAF7F0 background)
        cream: {
          50: '#FAF7F0',  // Warm cream page bg
          100: '#F4EFE6', // Light surface card
          200: '#E8E0D2',
          300: '#D6C8B2',
        },
        // Map skybrand -> gold and navybrand -> charcoal for full backwards compatibility
        skybrand: {
          50: '#FDFBF7',
          100: '#FAF2E1',
          200: '#F3E3BE',
          300: '#E6D094',
          400: '#D8B96D',
          500: '#C8A24A',
          600: '#B58E38',
          700: '#977227',
          800: '#78591F',
          900: '#5C4318',
        },
        navybrand: {
          800: '#222222',
          900: '#1A1A1A',
          950: '#0F0F0F',
        },
        softbg: '#FAF7F0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(200, 162, 74, 0.12), 0 4px 12px -2px rgba(26, 26, 26, 0.08)',
        'soft-hover': '0 20px 40px -10px rgba(200, 162, 74, 0.22), 0 8px 16px -4px rgba(26, 26, 26, 0.12)',
        'glass': '0 8px 32px 0 rgba(200, 162, 74, 0.15)',
      }
    },
  },
  plugins: [],
}
