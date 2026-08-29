/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      letterSpacing: {
        "paddle-tight": "-0.6px",
        "paddle-display": "-1.6px",
      },
      colors: {
        background: {
          DEFAULT: "#0f1515",
          secondary: "#182222",
          elevated: "#283031",
        },
        card: {
          DEFAULT: "#0f1515",
          dark: "#141c1c",
          elevated: "#182222",
        },
        border: {
          DEFAULT: "#272f30",
          light: "#414b4e",
        },
        foreground: {
          DEFAULT: "#f4f4f5",
          muted: "#797c7c",
        },
        paddle: {
          bg: "#0f1515",
          card: "#182222",
          accent: "#fff800",
          accentGlow: "#fddd35",
          cyanGlow: "#4d94ff",
          border: "#272f30",
          borderLight: "#414b4e",
          muted: "#797c7c",
        },
        accent: {
          cyan: "#00F2FE",
          blue: "#3B82F6",
          green: "#10B981",
          emerald: "#10B981",
          red: "#EF4444",
          violet: "#8B5CF6",
          yellow: "#fff800",
        },
        primary: {
          DEFAULT: "#f8fafc",
          foreground: "#0f172a",
        },
        secondary: {
          DEFAULT: "#182222",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#182222",
          foreground: "#797c7c",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "14px",
        sm: "12px",
        xs: "8px",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        marquee: "marquee 35s linear infinite",
        "pulse-glow": "pulse-glow 6s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
