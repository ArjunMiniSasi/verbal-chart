import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: [
        "**/venv/**",
        "**/node_modules/**",
        "**/functions/**",
        "**/scripts/**",
        "**/.git/**",
        "**/medical_pdfs/**",
        "**/prisma/**",
        "**/dist/**",
      ],
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
