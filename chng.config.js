import { defineConfig } from 'chng';

export default defineConfig({
    outputPath: 'changelog.md',
    versionCommit(commit) {
        if (commit.startsWith('v')) {
            return commit.slice(1); // version string, `x.x.x`
        }

        return false;
    },
});
