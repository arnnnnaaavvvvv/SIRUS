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
      colors: {
        background: "#050814",
        "background-secondary": "#090D16",
        card: "#0F172A",
        "card-dark": "#0D1324",
        border: "#1F2937",
        accent: {
          cyan: "#00F2FE",
          blue: "#3B82F6",
          green: "#10B981",
          emerald: "#10B981",
          red: "#EF4444",
          violet: "#8B5CF6",
        },
        primary: {
          DEFAULT: "#00F2FE",
          foreground: "#050814",
        },
        secondary: {
          DEFAULT: "#1E293B",
          foreground: "#F8FAFC",
        },
        muted: {
          DEFAULT: "#1E293B",
          foreground: "#94A3B8",
        },
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 0.4, transform: "scale(1)" },
          "50%": { opacity: 0.8, transform: "scale(1.05)" },
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
