import { addDynamicIconSelectors } from "@iconify/tailwind";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        card: {
          wanted: "#f2d98d",
          delete: "#FFEBEE",
          scraped: "#b8edbc",
          uncompressed: "#FFF3E0",
          imported: "#d8dab0",
        },
      },
    },
    fontFamily: {
      sans: ["PP Object Sans Regular", "sans-serif"],
      hasklig: ["Hasklig Regular", "monospace"],
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
  },

  plugins: [addDynamicIconSelectors()],
};
