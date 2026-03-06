import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
            "rxjs",
            "socket.io-client",
            "i18next",
            "react-i18next",
          ],
        },
      },
    },
  },
  esbuild: {
    supported: {
      "top-level-await": true, //browsers can handle top-level-await features
    },
  },
  server: { host: true },
  plugins: [
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: "**/*.{jsx,tsx}",
      babel: {
        plugins: ["babel-plugin-styled-components"],
      },
    }),
  ],
});
