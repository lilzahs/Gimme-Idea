import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import importmapPlugin from './vite-plugin-importmap.js';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3002, // Changed to 3002 to avoid conflict with old UI
        host: '0.0.0.0',
      },
      plugins: [react(), importmapPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.VITE_SOLANA_NETWORK': JSON.stringify(env.VITE_SOLANA_NETWORK),
        'process.env.VITE_SOLANA_RPC_URL': JSON.stringify(env.VITE_SOLANA_RPC_URL),
        'process.env.VITE_ACCESS_CODE': JSON.stringify(env.VITE_ACCESS_CODE),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'react-dom/client',
            'framer-motion',
            'lucide-react',
            'recharts',
            '@google/genai'
          ]
        }
      }
    };
});
