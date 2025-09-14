import eslintJs from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import { globalIgnores, defineConfig } from 'eslint/config';

export default defineConfig([
    globalIgnores(
        [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.react-router/**',
            '**/source.generated.ts',
            '**/coverage/**',
            '**/templates/**',
            '**/.templates/**',
            '**/tsconfig.json',
        ],
    ),
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs', '**/*.cts', '**/*.mts'],
        rules: {
            'prefer-const': 'error',
            'react-refresh/only-export-components': 'off',
            '@eslint-react/dom/no-missing-button-type': 'off',
            '@eslint-react/no-array-index-key': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@eslint-react/dom/no-dangerously-set-innerhtml': 'off',
            '@eslint-react/no-nested-component-definitions': 'off',
            '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'off',
            '@stylistic/jsx-one-expression-per-line': 'off',
            '@stylistic/no-tabs': 'off',
            '@stylistic/multiline-ternary': 'off',
            '@stylistic/brace-style': 'off',
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        extends: [
            eslintJs.configs.recommended,
            react.configs['recommended-typescript'],
            tseslint.configs.recommended,
            reactRefresh.configs.vite,
            stylistic.configs.customize({
                indent: 4,
                quotes: 'single',
                quoteProps: 'as-needed',
                arrowParens: true,
                semi: true,
            }),
        ],
    },
]);
