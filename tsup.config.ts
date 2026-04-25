import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  // Adds "use client" at the top of each output file so the package works
  // correctly in Next.js App Router without requiring consumers to add it.
  banner: {
    js: '"use client";',
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
