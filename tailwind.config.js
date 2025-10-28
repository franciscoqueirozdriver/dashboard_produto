/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        background: "#0b1015",
        foreground: "#f5f6f9",
        card: {
          DEFAULT: "#131a22",
          foreground: "#f5f6f9"
        },
        muted: {
          DEFAULT: "#1c242e",
          foreground: "#8a9bb7"
        }
      }
    }
  },
  plugins: []
};
