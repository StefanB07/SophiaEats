export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'midnight-navy': '#0B132B',
        'luminescent-line': '#1C2B54',
        'deep-sea-surface': '#152243',
        'sunset-coral': '#FF6B6B',
        'neon-gold': '#FBD38D',
        'wave-crest-blue': '#38BDF8',
        'starlight-white': '#F8FAFC',
        'fog-gray': '#94A3B8',
        'mint-glow': '#34D399',
        'amber-warning': '#FBBF24',
        'crimson-alert': '#F87171',
        // Legacy colors kept for backward compatibility during refactor
        'deep-sea-navy': '#1A365D',
        'ocean-blue': '#2B6CB0',
        'sandstone-gold': '#F6AD55',
        'seabreeze-white': '#F8FAFC',
        'pure-white': '#FFFFFF',
        'slate-dark': '#0F172A',
        'slate-light': '#475569',
        'border-gray': '#E2E8F0',
        'mint-green': '#10B981',
        'warning-yellow': '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
