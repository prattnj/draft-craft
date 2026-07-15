import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dce7ff',
          200: '#bdd0ff',
          300: '#90aeff',
          400: '#6284fd',
          500: '#4560f9',
          600: '#2e3fee',
          700: '#2530d3',
          800: '#2129aa',
          900: '#202885',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
