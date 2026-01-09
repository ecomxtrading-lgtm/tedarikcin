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
          manualChunks: (id) => {
            // Vendor chunk'ları ayır
            if (id.includes('node_modules')) {
              // React core
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              // Supabase - ayrı chunk (lazy load için)
              if (id.includes('@supabase')) {
                return 'supabase';
              }
              // React Query
              if (id.includes('@tanstack/react-query')) {
                return 'query';
              }
              // Radix UI - daha küçük chunk'lara ayır
              if (id.includes('@radix-ui')) {
                // Sadece kullanılan component'leri yükle
                const usedComponents = ['slot', 'dialog', 'dropdown-menu', 'toast', 'tooltip', 'label', 'select'];
                const componentName = usedComponents.find(comp => id.includes(comp));
                return componentName ? `ui-${componentName}` : 'ui-vendor';
              }
              // Diğer vendor'lar
              return 'vendor';
            }
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
