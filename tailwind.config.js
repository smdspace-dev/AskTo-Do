/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'voice-blue': '#3B82F6',
        'voice-green': '#10B981',
        'voice-red': '#EF4444',
        'voice-yellow': '#F59E0B',
        'priority-high': '#DC2626',
        'priority-medium': '#D97706',
        'priority-low': '#059669',
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        'waveform': 'waveform 1s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.33)',
          },
          '80%, 100%': {
            opacity: '0',
          },
        },
        'waveform': {
          '0%': {
            transform: 'scaleY(1)',
          },
          '100%': {
            transform: 'scaleY(0.3)',
          },
        },
      },
    },
  },
  plugins: [],
}