import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // publicDir: './public',
  build: "esnext",
  plugins: [
    // …
    react({
      // Use React plugin in all *.jsx and *.tsx files
      include: '**/*.{jsx,tsx}',
      babel: {
        plugins: ['babel-plugin-styled-components'],
      },
    }),
  ],
});