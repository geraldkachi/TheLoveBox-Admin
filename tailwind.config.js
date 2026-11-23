/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // All colours come from src/theme.css — edit that file, not this one.
        ink: { DEFAULT: "rgb(var(--ink) / <alpha-value>)", soft: "rgb(var(--ink-soft) / <alpha-value>)", muted: "rgb(var(--ink-muted) / <alpha-value>)" },
        primary: { 50: "rgb(var(--primary-50) / <alpha-value>)", 100: "rgb(var(--primary-100) / <alpha-value>)", 200: "rgb(var(--primary-200) / <alpha-value>)", 300: "rgb(var(--primary-300) / <alpha-value>)", 400: "rgb(var(--primary-400) / <alpha-value>)", 500: "rgb(var(--primary-500) / <alpha-value>)", 600: "rgb(var(--primary-600) / <alpha-value>)", 700: "rgb(var(--primary-700) / <alpha-value>)", 800: "rgb(var(--primary-800) / <alpha-value>)", 900: "rgb(var(--primary-900) / <alpha-value>)" },
        gold: { 50: "rgb(var(--gold-50) / <alpha-value>)", 100: "rgb(var(--gold-100) / <alpha-value>)", 200: "rgb(var(--gold-200) / <alpha-value>)", 300: "rgb(var(--gold-300) / <alpha-value>)", 400: "rgb(var(--gold-400) / <alpha-value>)", 500: "rgb(var(--gold-500) / <alpha-value>)", 600: "rgb(var(--gold-600) / <alpha-value>)" },
        cream: { 50: "rgb(var(--cream-50) / <alpha-value>)", 100: "rgb(var(--cream-100) / <alpha-value>)", 200: "rgb(var(--cream-200) / <alpha-value>)", 300: "rgb(var(--cream-300) / <alpha-value>)" },
        canvas: "rgb(var(--cream-50) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        leaf: "rgb(var(--leaf) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
        script: ['"Mrs Saint Delafield"', "cursive"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(30,22,27,0.04), 0 1px 3px rgba(30,22,27,0.06)",
        pop: "0 24px 60px -20px rgba(30,22,27,0.35)",
      },
    },
  },
  plugins: [],
};
