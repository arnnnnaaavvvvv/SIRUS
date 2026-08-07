/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090D16',
        card: '#111827',
        border: '#1F2937',
        accent: {
          blue: '#3B82F6',
          green: '#10B981',
          red: '#EF4444',
          cyan: '#06B6D4',
        },
      },
    },
  },
  plugins: [],
}
