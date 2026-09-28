import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

const REQUIRED_ENV = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];

export default defineConfig(({ command, mode }) => {
  // Fail the build (e.g. on Vercel) rather than ship a site whose signup form
  // can't reach Supabase.
  if (command === 'build') {
    const env = loadEnv(mode, import.meta.dirname);
    const missing = REQUIRED_ENV.filter((name) => !env[name]);
    if (missing.length > 0) {
      throw new Error(
        `Missing environment variables: ${missing.join(', ')}. Set them in .env locally or in Vercel → Project Settings → Environment Variables.`,
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
      },
    },
  };
});
