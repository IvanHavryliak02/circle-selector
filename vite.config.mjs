import { defineConfig } from 'vite';
import viteImagemin from 'vite-plugin-imagemin';
import autoprefixer from 'autoprefixer';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  root: './src',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            const ext = name.split('.').pop().toLowerCase(); // ext is format without dot!
            // images
            if (/(png|jpe?g|gif|svg|webp|avif)$/.test(ext) && name.startsWith('img-')) {
                return 'images/[name]-[hash][extname]';
            }
            // icons
            if (/(png|jpe?g|gif|svg|webp|avif)$/.test(ext) && name.startsWith('ico-')) {
                return 'icons/[name]-[hash][extname]';
            }
            // fonts
            if (/(woff2?|ttf|eot|otf|svg)$/.test(ext) && name.startsWith('font-')) {
                return 'fonts/[name]-[hash][extname]';
            }
            // css
            if (ext === 'css') {
                return 'css/[name]-[hash][extname]';
            }
            return 'unsorted/[name]-[hash][extname]'; 
        },
      },
    },
  },
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 75,
      },
      pngquant: {
        quality: [0.65, 0.8],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox', active: false
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
    legacy({
      targets: ['defaults', 'not IE 11'],
    })
  ],
  css: {
    postcss: {
      plugins: [
        autoprefixer({}) // add options if needed
      ],
    }
  }
});
