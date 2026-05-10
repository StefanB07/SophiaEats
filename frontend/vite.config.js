import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // Frontend makes request to /api/catalog/...
            // Proxy sends it to http://localhost:8081/...
            '/api/catalog': {
                target: 'http://localhost:8081',
                changeOrigin: true,
                // /api/catalog/restaurants -> /restaurants
                rewrite: (path) => path.replace(/^\/api\/catalog/, ''),
            },
            // NEW: Proxy cart & order API to OrderService (port 8082)
            '/api/cart': {
                target: 'http://localhost:8082',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/cart/, '/cart'),
            },
            '/api/orders': {
                target: 'http://localhost:8082',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/orders/, '/orders'),
            },
        },
    },
})
