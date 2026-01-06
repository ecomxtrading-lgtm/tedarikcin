import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // GitHub Pages için base path
  const base = process.env.NODE_ENV === "production" || mode === "production" ? "/tedarikcin/" : "/";
  return {
  base,
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Environment variables'ı build-time'da replace et
    'import.meta.env.VITE_ADMIN_EMAILS': JSON.stringify(process.env.VITE_ADMIN_EMAILS || ''),
  },
  };
});
