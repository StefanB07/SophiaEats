export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-sea-navy': '#1A365D',
        'ocean-blue': '#2B6CB0',
        'sunset-coral': '#FF6B6B',
        'sandstone-gold': '#F6AD55',
        'seabreeze-white': '#F8FAFC',
        'pure-white': '#FFFFFF',
        'slate-dark': '#0F172A',
        'slate-light': '#475569',
        'border-gray': '#E2E8F0',
        'mint-green': '#10B981',
        'warning-yellow': '#F59E0B',
        'crimson-alert': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
