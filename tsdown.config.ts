import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: [
        'src/virtual/*',
        'src/index.ts',
    ],
    outDir: 'dist',
    format: 'esm',
    sourcemap: true,
});
