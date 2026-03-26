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
        surface: {
          950: '#0a0a0f',
          900: '#111118',
          800: '#1a1a24',
          700: '#24242f',
          600: '#2e2e3a',
        },
        accent: {
          green: '#22c55e',
          'green-hover': '#16a34a',
          'green-dim': '#166534',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
