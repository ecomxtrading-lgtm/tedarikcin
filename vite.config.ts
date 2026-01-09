import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // GitHub Pages için base path
  const base = process.env.NODE_ENV === "production" || mode === "production" ? "/tedarikcin/" : "/";
  const isProduction = process.env.NODE_ENV === "production" || mode === "production";
  
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
    build: {
      // Code splitting ve tree shaking için optimizasyonlar
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk'ları ayır
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
            'supabase': ['@supabase/supabase-js'],
            'query': ['@tanstack/react-query'],
          },
        },
      },
      // Chunk size uyarıları için limit
      chunkSizeWarningLimit: 1000,
      // Minification (esbuild varsayılan olarak kullanılır, daha hızlı)
      minify: 'esbuild',
      // CSS code splitting
      cssCodeSplit: true,
      // CSS minification
      cssMinify: true,
      // Source maps sadece development'ta
      sourcemap: !isProduction,
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});
