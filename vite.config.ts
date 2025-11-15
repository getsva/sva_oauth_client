import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === "development";
  const isProduction = mode === "production";

  return {
    // Environment mode
    mode,
    
    // Server configuration
    server: {
      host: "::",
      port: 8081,
      // Enable CORS for development
      cors: isDevelopment,
    },
    
    // Build configuration
    build: {
      // Source maps for production debugging (can be disabled for smaller builds)
      sourcemap: isDevelopment,
      // Minification
      minify: isProduction ? "esbuild" : false,
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Output directory (Cloudflare Pages expects 'dist')
      outDir: "dist",
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          },
        },
      },
    },
    
    // Plugins
    plugins: [
      react(),
      // Only use component tagger in development
      isDevelopment && componentTagger(),
    ].filter(Boolean),
    
    // Path resolution
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // Environment variables
    envPrefix: "VITE_",
    
    // Preview server (for testing production builds)
    preview: {
      port: 8081,
      host: "::",
    },
  };
});
