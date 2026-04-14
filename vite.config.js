import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  publicDir: "public",
  base: "",
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query", "@tanstack/react-table"],
          "ui-vendor": [
            "styled-components",
            "react-toastify",
            "react-select",
            "react-modal",
            "react-sliding-pane",
            "embla-carousel-react",
            "react-day-picker",
            "react-loader-spinner",
          ],
          "utils-vendor": [
            "lodash",
            "date-fns",
            "dayjs",
            "axios",
            "socket.io-client",
            "i18next",
            "react-i18next",
          ],
        },
      },
    },
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  esbuild: {
    supported: {
      "top-level-await": true, //browsers can handle top-level-await features
    },
  },
  server: { host: true },
  plugins: [
    tailwindcss(),
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: "**/*.{jsx,tsx}",
      babel: {
        plugins: ["babel-plugin-styled-components"],
      },
    }),
  ],
});
