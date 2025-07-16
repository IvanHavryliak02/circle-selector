import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/js/modules/circular-selector.js'),
      name: 'circularSelector',
      fileName: (format) => `circular-selector.${format}.js`,
      formats: ['es', 'iife'],
    },
    outDir: 'dist/module',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: (chunkInfo) => {

        if (chunkInfo.format === 'iife') {
          return {
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            name: 'circularSelector', 
          };
        }
        return {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
        };
      },
    },
  },
});
