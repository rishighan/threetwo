import react from "@vitejs/plugin-react";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "public",
  base: "",
  build: "esnext",
  esbuild: {
    supported: {
      "top-level-await": true, //browsers can handle top-level-await features
    },
  },
  server: { host: true },
  plugins: [
    nodeResolve({
      // browser: true
      exportConditions: ["node"],
    }),
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: "**/*.{jsx,tsx}",
      babel: {
        plugins: ["babel-plugin-styled-components"],
      },
    }),
  ],
});
