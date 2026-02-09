/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        meta: {
          peach: '#f2ece6',
          orange: '#e2761b',
          navy: '#241150',
          charcoal: '#111827',
        },
        brand: {
          50: '#f5f7ff',
          500: '#e2761b', // Aligning brand-500 with meta-orange
          600: '#d16a18'
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
