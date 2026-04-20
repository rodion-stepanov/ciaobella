import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/",
  plugins: [
    tailwindcss(),
    createHtmlPlugin({
      minify: true,
      entry: "/script.js",
      template: "index.html",
      inject: {
        data: {
          currentYear: new Date().getFullYear(),
        },
        ejsOptions: {
          views: [path.resolve(__dirname)],
        },
      },
    }),
  ],
  build: {
    minify: "terser",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
