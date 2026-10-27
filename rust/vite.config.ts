import { defineConfig } from "vite";

// Tauri expects a fixed port; fail if it is taken.
export default defineConfig({
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
});
