import { defineConfig } from 'bumpp';

export default defineConfig({
    commit: 'v%s',
    execute: 'npm run changelog',
});
