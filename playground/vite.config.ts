import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';
import rscPages from 'vite-plugin-rsc-pages';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        // minify: true,
    },
    plugins: [react(), rsc(), rscPages(), tailwindcss()],
});
