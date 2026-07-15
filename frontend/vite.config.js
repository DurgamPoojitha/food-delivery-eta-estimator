/**
 * vite.config.js
 * ==============
 * Purpose:
 *   Vite build tool configuration for the DeliverIQ frontend.
 *
 * Key configuration:
 *   - React plugin: enables JSX transform and Fast Refresh (HMR) in dev.
 *   - Dev proxy: forwards /api/* requests to the FastAPI backend during
 *     local development. This eliminates CORS preflight issues entirely in
 *     dev mode because the browser sees requests as same-origin.
 *     In production, VITE_API_URL env var points directly to the Render backend.
 *
 * Why a proxy instead of CORS in dev?
 *   CORS configuration only fixes cross-origin requests in production.
 *   During development, using Vite's proxy is cleaner because:
 *     1. No CORS headers needed on the backend for dev
 *     2. The backend URL can change without touching frontend code
 *     3. Exactly mirrors how a reverse proxy (Nginx, Vercel rewrites) works in prod
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All requests matching /api/* are forwarded to FastAPI on port 8000.
      // changeOrigin: true rewrites the Host header so FastAPI accepts the request.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
