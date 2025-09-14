import { resolveInternalImport } from '@/utils';
import type { RawRoute } from '@/types';
import type { RscPluginOptions } from '@vitejs/plugin-rsc';
import type { RequiredDeep } from 'type-fest';

const VIRTUAL_BASE = 'virtual:rsc-pages';

function createVirtualEntry<T extends string>(id: T): `${typeof VIRTUAL_BASE}/${T}` {
    return `${VIRTUAL_BASE}/${id}`;
}

// Keep in mind to not directly import routes entry
// and use virtual module instead to make sure routes are loaded correctly
const VIRTUAL_ROUTES_ID = createVirtualEntry('routes');
const VIRTUAL_SHARED_ID = createVirtualEntry('shared');
const VIRTUAL_ENTRY_RSC_ID = createVirtualEntry('entry.rsc');
const VIRTUAL_ENTRY_SSR_ID = createVirtualEntry('entry.ssr');
const VIRTUAL_ENTRY_CLIENT_ID = createVirtualEntry('entry.client');

export const injectEntries: RequiredDeep<RscPluginOptions['entries']> = {
    rsc: VIRTUAL_ENTRY_RSC_ID,
    ssr: VIRTUAL_ENTRY_SSR_ID,
    client: VIRTUAL_ENTRY_CLIENT_ID,
};

function stringifyRoutes(routes: RawRoute[]) {
    return '{' + routes.map((r) => {
        return `
                    ${JSON.stringify(r.pattern)}: {
                        page: () => import('${r.page}'),
                        layouts: [${r.layouts.map((l) => `() => import('${l}')`).join(',')}],
                    }
                `;
    }).join(',') + '}';
}

// The code is largely based on:
// https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc/examples/basic
export const injections = {
    '~rsc':
        () => `
export * from '${resolveInternalImport('../dist/virtual/~rsc')}';
        `,
    [VIRTUAL_SHARED_ID]:
        () => `
export * from '${resolveInternalImport('../dist/virtual/shared')}';
`,
    [VIRTUAL_ROUTES_ID]:
        (routes: RawRoute[], notFound: RawRoute[]) => `
import { setPagesRoutes, setNotFoundRoutes } from '${resolveInternalImport('../dist/virtual/routes.js')}';

setPagesRoutes(${stringifyRoutes(routes)});
setNotFoundRoutes(${stringifyRoutes(notFound)});

export * from '${resolveInternalImport('../dist/virtual/routes.js')}';
`,
    [VIRTUAL_ENTRY_RSC_ID]:
        () => `
export { default } from '${resolveInternalImport('../dist/virtual/rsc.js')}';
`,
    [VIRTUAL_ENTRY_SSR_ID]:
        () => `
export * from '${resolveInternalImport('../dist/virtual/ssr.js')}';
`,
    [VIRTUAL_ENTRY_CLIENT_ID]:
        () => `
import { main } from '${resolveInternalImport('../dist/virtual/client.js')}';

main();
        `,
} satisfies Record<string, (...args: any[]) => string>;
