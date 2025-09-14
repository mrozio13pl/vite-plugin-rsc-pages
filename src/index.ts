import path from 'node:path';
import { glob } from 'tinyglobby';
import { injectEntries, injections } from '@/inject';
import { collectLayouts, maybeInvalidate, toPosix, toRadixPattern } from '@/utils';
import { name } from '@/package.json';
import type { Plugin } from 'vite';
import type { Patterns, RawRoute, RscPagesOptions } from '@/types';

export type * from '@/types';

export default function rscPages(options: RscPagesOptions = {}): Plugin {
    const pagesRoot = options.root ?? './app';

    const state = {
        routes: [] as RawRoute[],
        notFound: [] as RawRoute[],
    };

    return {
        name,
        enforce: 'pre',
        config() {
            return {
                environments: {
                    rsc: {
                        resolve: { conditions: ['react-server'] },
                        build: { rollupOptions: { input: { index: injectEntries!.rsc } } },
                    },
                    ssr: {
                        build: { rollupOptions: { input: { index: injectEntries!.ssr } } },
                    },
                    client: {
                        build: { rollupOptions: { input: { index: injectEntries!.client } } },
                    },
                },
                optimizeDeps: {
                    entries: ['react', 'react-dom/client', 'react-dom/server', 'react/server.edge'],
                },
            };
        },
        configureServer(server) {
            server.watcher.add(path.join(pagesRoot, '**/*.{js,jsx,ts,tsx}'));
            const invalidate = (p: string) => maybeInvalidate(server, p);
            server.watcher.on('add', invalidate);
            server.watcher.on('unlink', invalidate);
            server.watcher.on('change', invalidate);
        },
        resolveId(id) {
            if (Object.keys(injections).includes(id)) {
                return id;
            }
        },
        load(id) {
            if (Object.keys(injections).includes(id)) {
                return injections[id as keyof typeof injections](state.routes, state.notFound);
            }
        },
        async buildStart() {
            const patterns: Patterns = {
                page: options.patterns?.page ?? '**/page.{js,jsx,ts,tsx}',
                layout: options.patterns?.layout ?? '**/layout.{js,jsx,ts,tsx}',
                notFound: options.patterns?.notFound ?? '**/not-found.{js,jsx,ts,tsx}',
            };

            const pages = await glob(patterns.page, { cwd: pagesRoot, absolute: true });
            const layouts = await glob(patterns.layout, { cwd: pagesRoot, absolute: true });
            const notFound = await glob(patterns.notFound, { cwd: pagesRoot, absolute: true });

            const layoutMap = new Map<string, string>();
            const notFoundMap = new Map<string, string>();

            for (const file of layouts) {
                const dir = path.dirname(path.relative(pagesRoot, file));
                layoutMap.set(dir === '.' ? '' : dir, file);
            }

            for (const file of notFound) {
                const dir = path.dirname(path.relative(pagesRoot, file));
                notFoundMap.set(dir === '.' ? '' : dir, file);
            }

            const routes: RawRoute[] = [];
            for (const page of pages) {
                const dir = path.dirname(path.relative(pagesRoot, page));
                const pattern = toRadixPattern('/', dir);
                const layoutChain = collectLayouts(layoutMap, toPosix(dir));
                routes.push({ pattern, page, layouts: layoutChain });
            }

            const notFounds: RawRoute[] = [];
            for (const page of notFound) {
                const dir = path.dirname(path.relative(pagesRoot, page));
                const pattern = toRadixPattern('/', dir, true);
                const layoutChain = collectLayouts(layoutMap, toPosix(dir));
                notFounds.push({ pattern, page, layouts: layoutChain });
            }

            routes.sort((a, b) => b.pattern.length - a.pattern.length);
            notFounds.sort((a, b) => b.pattern.length - a.pattern.length);
            state.routes = routes;
            state.notFound = notFounds;
        },
    };
};
