import react from '@vitejs/plugin-react';

export default defineConfig({
  publicDir: './public',
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