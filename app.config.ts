import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: false,
  server: {
    preset: "node-server",
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
  vite: {
    server: {
      hmr: {
        overlay: false,
      },
    },
    optimizeDeps: {
      exclude: ['@webcontainer/api'],
    },
  },
});
