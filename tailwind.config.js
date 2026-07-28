/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: "#090D12",
          card: "#121820",
          cardHover: "#18222E",
          border: "#232F3E",
          borderActive: "#3A4D66",
          accent: "#3875F6",
          accentGlow: "rgba(56, 117, 246, 0.25)",
          success: "#10B981",
          successGlow: "rgba(16, 185, 129, 0.25)",
          warning: "#F59E0B",
          warningGlow: "rgba(245, 158, 11, 0.25)",
          danger: "#EF4444",
          dangerGlow: "rgba(239, 68, 68, 0.25)",
          info: "#06B6D4",
          textPrimary: "#F1F5F9",
          textSecondary: "#94A3B8",
          textMuted: "#64748B",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'scada': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'scada-glow': '0 0 20px rgba(56, 117, 246, 0.3)',
        'success-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'danger-glow': '0 0 20px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  plugins: [],
}
