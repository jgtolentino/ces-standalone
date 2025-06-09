import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Skip DTS generation for now
  clean: true,
  external: ['react', 'react-dom'],
  // Don't build CSS since we're using source imports
});