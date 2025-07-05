/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark theme base colors
        dark: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          850: "#0f172a",
          900: "#0a0d14",
          950: "#020617",
        },
        // Neon accent colors
        neon: {
          cyan: "#00f5ff",
          purple: "#bf00ff",
          pink: "#ff0080",
          green: "#00ff80",
          yellow: "#ffff00",
          orange: "#ff8000",
        },
        // Primary brand colors (cyber theme)
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Secondary purple accent
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
        },
      },
      backgroundImage: {
        "gradient-cyber": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        "gradient-neon": "linear-gradient(135deg, #00f5ff 0%, #bf00ff 100%)",
        "gradient-card": "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      },
      boxShadow: {
        "neon-cyan": "0 0 20px rgba(0, 245, 255, 0.5)",
        "neon-purple": "0 0 20px rgba(191, 0, 255, 0.5)",
        cyber: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
