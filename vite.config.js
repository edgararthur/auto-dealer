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
    server: {
      port: 3001,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'autoplus-shared': sharedPath
      },
    },
  };
}); 