/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Deep Emerald / Forest Green Palette (#1B4D3E)
        brandgreen: {
          50: '#F2F7F4',
          100: '#E2EEE7',
          200: '#C2DCCF',
          300: '#94C3B0',
          400: '#4D8E73',
          500: '#1B4D3E', // Primary Luxury Emerald
          600: '#163E32',
          700: '#123229',
          800: '#0E2720',
          900: '#0A1C17',
          DEFAULT: '#1B4D3E',
        },
        forest: {
          DEFAULT: '#1B4D3E',
          dark: '#123229',
          light: '#2A6B57',
        },
        // Accent Warm Champagne Gold Palette (#C5A059)
        brandyellow: {
          50: '#FAF7F0',
          100: '#F4ECD8',
          200: '#E8D8B0',
          300: '#DCC388',
          400: '#D0B06B',
          500: '#C5A059', // Accent Warm Champagne Gold
          600: '#B08B42',
          700: '#8C6C2F',
          800: '#674E20',
          900: '#453313',
          DEFAULT: '#C5A059',
        },
        maxyellow: {
          DEFAULT: '#C5A059',
          hover: '#B59048',
          dark: '#8C6C2F',
        },
        gold: {
          DEFAULT: '#C5A059',
          hover: '#B59048',
          light: '#E8D8B0',
          50: '#FAF7F0',
          100: '#F4ECD8',
          200: '#E8D8B0',
          300: '#DCC388',
          400: '#D0B06B',
          500: '#C5A059',
          600: '#B08B42',
          700: '#8C6C2F',
        },
        // Deep Charcoal Palette (#1A1C19)
        charcoal: {
          500: '#323631',
          700: '#232622',
          800: '#1A1C19', // Base text dark
          900: '#121411',
          950: '#0B0C0A',
          DEFAULT: '#1A1C19',
        },
        textdark: '#1A1C19',
        // Surfaces & Backgrounds (#FDFCF7 Warm Linen)
        softbg: '#FDFCF7',
        bgmain: '#FDFCF7',
        surface: '#FFFFFF',
        'surface-card': '#FFFFFF',
        // Subtle Border & Container (#E8EFE9 Light Sage)
        'border-subtle': '#E8EFE9',
        sage: {
          50: '#F6F9F7',
          100: '#E8EFE9',
          200: '#D2DFD5',
          300: '#ADC4B2',
          DEFAULT: '#E8EFE9',
        },
        cream: {
          50: '#FDFCF7',
          100: '#F7F5EE',
          200: '#EFECE0',
          300: '#E2DEC9',
        },
        // Legacy aliases
        skybrand: {
          DEFAULT: '#1B4D3E',
          500: '#1B4D3E',
          600: '#163E32',
          700: '#123229',
        },
        navybrand: {
          800: '#1A1C19',
          900: '#121411',
          950: '#0B0C0A',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(27, 77, 62, 0.08), 0 4px 12px -2px rgba(26, 28, 25, 0.05)',
        'soft-hover': '0 20px 40px -10px rgba(27, 77, 62, 0.16), 0 8px 16px -4px rgba(26, 28, 25, 0.08)',
        'glass': '0 8px 32px 0 rgba(27, 77, 62, 0.12)',
      }
    },
  },
  plugins: [],
}
