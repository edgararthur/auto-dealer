import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from project root
  process.env = { ...process.env, ...loadEnv(mode, path.resolve(__dirname, '..'), '') };
  
  // Calculate path to shared folder for debugging
  const sharedPath = path.resolve(__dirname, './shared');
  console.log('Buyer vite.config.js: Resolved shared path:', sharedPath);
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'Autora-shared': sharedPath
      },
    },
    build: {
      // ENHANCED PERFORMANCE OPTIMIZATION: Advanced code splitting
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunk for React and core libraries
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }

            // Supabase and auth chunk
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'supabase';
            }

            // Icons chunk (usually large)
            if (id.includes('react-icons')) {
              return 'icons';
            }

            // UI libraries chunk
            if (id.includes('framer-motion') || id.includes('react-hook-form') || id.includes('react-toastify')) {
              return 'ui-libs';
            }

            // Utilities chunk
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('uuid') || id.includes('yup')) {
              return 'utils';
            }

            // Node modules chunk for other dependencies
            if (id.includes('node_modules')) {
              return 'vendor-misc';
            }
          }
        }
      },

      // Optimize chunk size warnings
      chunkSizeWarningLimit: 300, // Reduced from 500 for stricter optimization

      // Disable source maps for production for smaller bundles
      sourcemap: false,

      // Enhanced minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
          passes: 2 // Multiple passes for better compression
        },
        mangle: {
          safari10: true // Better Safari compatibility
        }
      },

      // CSS optimization
      cssCodeSplit: true,
      cssMinify: true
    },
    
    // Development server optimization
    server: {
      port: 3001,
      host: true,
      open: true,
      cors: true,
      // Fix WebSocket connection issues
      hmr: {
        port: 3001,
        host: 'localhost'
      },
      // Add caching headers for development
      headers: {
        'Cache-Control': 'public, max-age=31536000', // 1 year for static assets
      }
    },
    
    // Performance optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'react-icons'
      ]
    }
  };
}); 