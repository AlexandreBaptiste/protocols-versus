import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/graphql': 'http://localhost:5000',
      // gRPC-Web: proto package routes to /{package}.{Service}/{Method}
      // Remove Accept-Encoding so the proxy never compresses binary protobuf frames
      '/catalog.CatalogGrpcService': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('Accept-Encoding');
          });
        },
      },
      '/hub': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
})
