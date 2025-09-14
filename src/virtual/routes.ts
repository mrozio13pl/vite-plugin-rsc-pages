import React, { ReactNode } from 'react';
import { createRouter, type RadixNodeData, type RadixRouter } from 'radix3';
import { NotFoundComponent } from '@/components/not-found';
import type { ProcessedRoute } from '@/types';

const LOCAL_URL = 'http://rsc.local';

function normalizeUrl(pathname: string) {
    try {
        pathname = new URL(pathname, LOCAL_URL).pathname;
    } catch { /* empty */ }

    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return pathname || '/';
}

function initRouter<T extends RadixNodeData>() {
    type Routes = { [pattern: string]: T };

    let router: RadixRouter<T> | undefined,
        routes: Routes = {};

    return {
        setRoutes(newRoutes: Routes) {
            routes = newRoutes;
            router = undefined;
        },
        getRouter() {
            if (!router) {
                router = createRouter({ strictTrailingSlash: false });
                for (const pattern in routes) {
                    router.insert(pattern, routes[pattern]);
                }
            }
            return router;
        },
        match(path: string) {
            const matched = this.getRouter().lookup(normalizeUrl(path));

            if (!matched) return;

            const { params, ...payload } = matched;

            return { params, payload: payload as T };
        },
    };
}

const pagesRouter = initRouter<ProcessedRoute>();
const notFoundRouter = initRouter<ProcessedRoute>();

export const { setRoutes: setPagesRoutes } = pagesRouter;
export const { setRoutes: setNotFoundRoutes } = notFoundRouter;

function toHeaders(h: Headers | Record<string, string>) {
    if (h instanceof Headers) return h;
    const real = new Headers();
    if (!h) return real;
    for (const [k, v] of Object.entries(h)) {
        real.set(k, v);
    }
    return real;
}

async function insertLayouts(element: ReactNode, layouts: any[], params: any) {
    for (let i = layouts.length - 1; i >= 0; i--) {
        const LayoutMod = await layouts[i]();
        const Layout = LayoutMod.default ?? (() => React.createElement(React.Fragment));
        element = React.createElement(Layout, { ...params }, element);
    }
    return element;
}

export async function resolveElementForRequest(request: Request) {
    const url = new URL(request.url, LOCAL_URL);
    const matched = pagesRouter.match(url.pathname);

    const headersObj = toHeaders(request.headers);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    let props: any = { headers: headersObj, url: url.toString(), searchParams };

    if (!matched) {
        const matchedNotFound = notFoundRouter.match(url.pathname);
        if (matchedNotFound) {
            props = { params: matchedNotFound.params, ...props };
            const PageMod = await matchedNotFound.payload.page();
            const Page = PageMod.default ?? (() => React.createElement(React.Fragment));
            const element = React.createElement(Page, props);
            return insertLayouts(element, matchedNotFound.payload.layouts, props);
        }
        const NotFound = async () => React.createElement(NotFoundComponent);
        const rootLayouts = notFoundRouter.match('/')?.payload.layouts ?? pagesRouter.match('/')?.payload.layouts ?? [];
        return insertLayouts(React.createElement(NotFound), rootLayouts, props);
    }

    const { params, payload } = matched;
    const PageMod = await payload.page();
    const Page = PageMod.default ?? PageMod.Page ?? (() => React.createElement(React.Fragment));

    props = { params, ...props };
    const element: ReactNode = React.createElement(Page, props);

    return insertLayouts(element, payload.layouts, props);
}
