import path from 'node:path';
import { createRequire } from 'node:module';
import type { ViteDevServer } from 'vite';

export function toPosix(p: string) {
    return p.replaceAll(path.sep, path.posix.sep);
}

export function maybeInvalidate(server: ViteDevServer, id: string) {
    const mod = server.moduleGraph.getModuleById(id);

    if (mod) {
        server.moduleGraph.invalidateModule(mod);
        if (server.ws) {
            server.ws.send({ type: 'full-reload', path: '*' });
        }
    }
}

const require = createRequire(import.meta.url);

export function resolveInternalImport(id: string) {
    return toPosix(require.resolve(id));
}

export function toRadixPattern(basePath: string, dir: string, isGlobal = false) {
    // Convert paths to patterns:
    // '' -> '/'
    // 'blog' -> '/blog'
    // 'blog/[slug]' -> '/blog/:slug'
    // '[...rest]' -> '/**:rest'
    const segs = dir === '' || dir === '.' ? [] : dir.split('/');
    const mapped = segs.filter((seg) => !(/^\(.+\)$/.test(seg))).map((seg) => {
        const mCatch = seg.match(/^\[\.\.\.(.+)\]$/);
        const mDyn = seg.match(/^\[(.+)\]$/);
        if (mCatch) {
            const name = mCatch[1];
            return `**:${name}`;
        }
        if (mDyn) return `:${mDyn[1]}`;
        return seg;
    });
    let pattern = (basePath === '/' ? '' : basePath) + (mapped.length ? '/' + mapped.join('/') : '/');

    if (isGlobal) {
        if (pattern.endsWith('/')) pattern = pattern.slice(0, -1);
        pattern += '**';
    }

    return pattern;
}

export function collectLayouts(layoutMap: Map<string, string>, leafDir: string) {
    const parts = leafDir === '' || leafDir === '.' ? [] : leafDir.split('/');
    const chain: string[] = [];
    for (let i = 0; i <= parts.length; i++) {
        const dir = parts.slice(0, i).join('/');
        const f = layoutMap.get(dir);
        if (f) chain.push(f);
    }
    return chain;
}
