import path from "path";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "offline.html",
        "icon-192.svg",
        "icon-512.svg",
        "maskable-icon.svg",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-512x512.png",
        "apple-touch-icon.png"
      ],
      manifest: {
        name: "Smart Career Hub",
        short_name: "CareerHub",
        description: "AI-powered resume analysis and optimization for developers.",
        theme_color: "#0f1720",
        background_color: "#f4f7f6",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "documents",
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: ({ request }) =>
              ["style", "script", "worker", "font", "image"].includes(request.destination),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets"
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("gsap")) {
            return "gsap";
          }

          if (id.includes("recharts") || id.includes("/d3-")) {
            return "charts";
          }

          if (id.includes("@supabase")) {
            return "supabase";
          }

          if (id.includes("@radix-ui")) {
            return "radix";
          }

          if (id.includes("@tanstack")) {
            return "query";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          return "vendor";
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src")
    }
  }
});
