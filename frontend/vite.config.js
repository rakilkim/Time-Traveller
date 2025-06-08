import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name:        'Time Traveller',
        short_name:  'TimeTrav',
        start_url:   '/',
        display:     'standalone',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        icons: [
          {
            src: 'clock-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'clock-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
