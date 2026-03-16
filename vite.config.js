import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: "/",
  server: {
    host: true, // allow access from LAN/public IP
    port: 5173, // default Vite dev port (you can change if needed)
    proxy: {
      "/api": {
        target: "https://192.168.0.93:443", // backend API server
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ""), 
        // ^ uncomment if backend doesn't have `/api` prefix
      },
    },
  },
  esbuild: {
    // Drop console and debugger statements in production builds
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));


