import addDynamicIconSelectors from "@iconify/tailwind4";
import type { Config } from "tailwindcss";

/**
 * Tailwind CSS configuration
 * @type {Config}
 */
const config: Config = {
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
          missing: "#fee2e2",
          info: "#cdd9eb",
        },
        comicvine: "#29cc82",
        metron: "#4258ff",
        locg: "#fd6401",
        gcd: "#e49b26",
        "control-surface": "#6B5B71",
        warning: "#b7b784",
        theme: {
          light: {
            bg: "#f1f2f3",
            accent: "#d2d8df",
            heading: "#2f3d51",
          },
          dark: {
            bg: "#20252d",
            accent: "#46566d",
            heading: "#b7bec8",
          },
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
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1280px",
      },
    },
  },

  plugins: [addDynamicIconSelectors()],
};

export default config;
