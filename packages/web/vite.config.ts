import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "ImageSquish",
        short_name: "ImageSquish",
        description:
          "Compress JPEG, PNG and WebP images right in your browser, fully offline. Nothing is uploaded.",
        theme_color: "#0a0a0b",
        background_color: "#0a0a0b",
        display: "standalone",
        start_url: "/",
        scope: "/",
        categories: ["photo", "utilities", "productivity"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@image-compressor/core": fileURLToPath(
        new URL("../core/src/index.ts", import.meta.url),
      ),
    },
  },
});
