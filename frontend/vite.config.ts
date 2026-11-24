import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/__api_insecure": {
        target: "http://api_insecure:5001",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/__api_insecure/, "") || "/",
      },
      "/__api_secure": {
        target: "http://api_secure:5002",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/__api_secure/, "") || "/",
      },
    },
  },
});
