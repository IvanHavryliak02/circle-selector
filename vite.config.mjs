import { defineConfig } from 'vite';
import viteImagemin from 'vite-plugin-imagemin';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  root: './src',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: ({ name }) => {
          if (!name) return 'assets/[name]-[hash][extname]';
          const ext = name.split('.').pop().toLowerCase();

          if (/(png|jpe?g|gif|svg|webp|avif)/.test(ext)) return 'images/[name][extname]';
          if (/(woff2?|ttf|otf|eot)/.test(ext)) return 'fonts/[name][extname]';
          if (ext === 'css') return 'css/[name][extname]';

          return 'assets/[name][extname]';
        },
      },
    },
  },
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 75 },
      pngquant: { quality: [0.65, 0.8], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
  ],
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
  },
});
