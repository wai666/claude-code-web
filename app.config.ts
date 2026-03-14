import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: false,  // 完全禁用 SSR
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
