declare module '~rsc' {
    import type { ReactNode } from 'react';

    export function rsc(request: Request): Promise<Response>;
    export function resolveElementForRequest(request: Request): Promise<Element>;

    export function redirect(location: string, status?: 303 | 307 | 308): never;

    export interface PageProps<
        TParams extends Record<string, string> = Record<string, string>,
        TSearch extends Record<string, string> = Record<string, string>,
    > {
        params: TParams;
        searchParams: TSearch;
        headers: Headers;
        url: string;
    }

    export interface LayoutProps<
        TParams extends Record<string, string> = Record<string, string>,
        TSearch extends Record<string, string> = Record<string, string>,
    > extends PageProps<TParams, TSearch> {
        children: ReactNode;
    }
}

declare module 'virtual:rsc-pages/routes' {
    import type { ReactNode } from 'react';

    /** @internal */
    export function resolveElementForRequest(request: Request): Promise<ReactNode>;
}
