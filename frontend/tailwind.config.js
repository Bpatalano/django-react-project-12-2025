/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',      // slate-900
          surface: '#1e293b', // slate-800
          elevated: '#334155', // slate-700
          border: '#475569',  // slate-600
        },
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          hover: '#2563eb',   // blue-600
          light: '#60a5fa',   // blue-400
        },
        success: {
          DEFAULT: '#10b981', // emerald-500
          hover: '#059669',   // emerald-600
          light: '#34d399',   // emerald-400
          bg: '#064e3b',      // emerald-900
        },
        danger: {
          DEFAULT: '#ef4444', // red-500
          hover: '#dc2626',   // red-600
          light: '#f87171',   // red-400
          bg: '#7f1d1d',      // red-900
        },
        warning: {
          DEFAULT: '#f59e0b', // amber-500
          hover: '#d97706',   // amber-600
          bg: '#78350f',      // amber-900
        },
      },
    },
  },
  plugins: [],
}
