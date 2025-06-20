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
      // PERFORMANCE OPTIMIZATION: Code splitting configuration
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for React and core libraries
            vendor: ['react', 'react-dom', 'react-router-dom'],
            
            // Supabase and auth chunk
            supabase: ['@supabase/supabase-js'],
            
            // Icons chunk (usually large)
            icons: ['react-icons']
          }
        }
      },
      
      // Optimize chunk size warnings
      chunkSizeWarningLimit: 500,
      
      // Enable source maps for production debugging (optional)
      sourcemap: false,
      
      // Minify for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true
        }
      }
    },
    
    // Development server optimization
    server: {
      port: 3001,
      open: true,
      cors: true
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