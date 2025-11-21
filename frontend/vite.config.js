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
        },
    },
})
