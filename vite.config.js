import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const appUrl = new URL(env.APP_URL || 'http://localhost:8000');
    const hmrHost = env.VITE_HMR_HOST || appUrl.hostname;
    const hmrPort = Number(env.VITE_HMR_PORT || 5173);
    const hmrProtocol = env.VITE_HMR_PROTOCOL || (appUrl.protocol === 'https:' ? 'wss' : 'ws');

    return {
        plugins: [
            laravel({
                input: 'resources/js/app.jsx',
                refresh: true,
            }),
            react(),
        ],
        server: {
            host: '0.0.0.0',
            port: hmrPort,
            strictPort: true,
            hmr: {
                host: hmrHost,
                clientPort: hmrPort,
                protocol: hmrProtocol,
                timeout: 120000,
            },
        },
    };
});
