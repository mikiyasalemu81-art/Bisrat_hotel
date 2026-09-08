/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skybrand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#4FA8DA',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        navybrand: {
          800: '#1E293B',
          900: '#0F172A',
          950: '#090D16',
        },
        softbg: '#F7FAFC',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(14, 165, 233, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'soft-hover': '0 20px 40px -10px rgba(14, 165, 233, 0.15), 0 8px 16px -4px rgba(15, 23, 42, 0.08)',
        'glass': '0 8px 32px 0 rgba(14, 165, 233, 0.10)',
      }
    },
  },
  plugins: [],
}
