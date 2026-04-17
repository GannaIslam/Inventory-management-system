/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        sidebar: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          active: '#1E3A5F',
          text: '#94A3B8',
          'text-active': '#FFFFFF',
        },
        primary: {
          DEFAULT: '#164E63',
          light: '#0E7490',
          hover: '#0E6680',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        background: '#F1F5F9',
        card: '#FFFFFF',
        'table-header': '#F8FAFC',
        danger: '#EF4444',
        'danger-light': '#FEE2E2',
        'danger-text': '#991B1B',
        success: '#22C55E',
        'success-light': '#DCFCE7',
        'success-text': '#166534',
        warning: '#F59E0B',
        'warning-light': '#FEF3C7',
      },
    },
  },
  plugins: [],
}
