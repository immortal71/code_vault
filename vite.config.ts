import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Only import Replit plugin if it's available
let runtimeErrorOverlay;
try {
  runtimeErrorOverlay = (await import("@replit/vite-plugin-runtime-error-modal")).default;
} catch {
  runtimeErrorOverlay = () => null;
}

export default defineConfig({
  plugins: [
    react(),
    ...(typeof runtimeErrorOverlay === 'function' ? [runtimeErrorOverlay()] : []),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ).catch(() => null),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ).catch(() => null),
        ].filter(Boolean)
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
