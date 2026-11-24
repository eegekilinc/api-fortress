/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        fortress: {
          950: "#0c0f14",
          900: "#121820",
          800: "#1a2332",
          accent: "#38bdf8",
          warn: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 0 0 1px rgba(148, 163, 184, 0.08), 0 12px 40px -12px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
