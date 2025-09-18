# vite-plugin-rsc-pages

[React Server Components](https://react.dev/reference/rsc/server-components) (RSC) NextJS-like app router plugin for Vite.

## Overview

The plugin is built on top of [@vitejs/plugin-rsc](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc) and provides file system based routing with RSC and server actions.

### Features

- RSC (React Server Components) & SSR (Server Side Rendering)
- Server Actions
- File system based routing with pages and layouts
- Custom not found pages
- Support for CSS and static assets
- Helpers for RSC components
- Works out of the box

## Basic Concepts

This example is a basic NextJS-like app router that uses RSC components to render pages.

`app/layout.tsx`:

```tsx
'use client';

import { LayoutProps } from '~rsc';

export default function Layout({ children }: LayoutProps) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
```

`app/page.tsx`:

```tsx
'use client';

import { PageProps } from '~rsc';

export default function Page({ url }: PageProps) {
    return <h1>{url}</h1>;
}
```

`app/not-found.tsx`:

```tsx
'use client';

import { PageProps } from '~rsc';

export default function NotFound({ /* ... */ }: PageProps) {
    return <h1>Not Found.</h1>;
}
```

### Routing

`app/path/page.tsx` - will be rendered at `/path`

`app/path/layout.tsx` - will be used as a layout for `/path/*`

`app/path/[id]/page.tsx` - will be rendered at `/path/123` where `id` is a dynamic parameter:

```tsx
import { PageProps } from '~rsc';

export default function Page({ params }: PageProps<{ id: string }>) {
    return <h1>{params.id}</h1>;
}
```

`app/path/[...all]/page.tsx` - will be rendered at any path starting with `/path/`

### Server Actions

```ts
'use server'

let serverCounter = 0

export async function getServerCounter() {
    return serverCounter
}

export async function updateServerCounter(change: number) {
    serverCounter += change
}
```

Taken from [github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-rsc/examples/starter/src/action.tsx](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-rsc/examples/starter/src/action.tsx).

## Getting Started

Install necessary RSC plugins:

```bash
npm i -D vite-plugin-rsc-pages @vitejs/plugin-rsc
```

Make sure you also have `@vitejs/plugin-react` or `@vitejs/plugin-react-swc` installed.

Add plugins to your config:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';

export default defineConfig({
    plugins: [
        react(),
        rsc(),
        rscPages(),
    ],
});
```

Update your `tsconfig.json`:

```json
{
    "compilerOptions": {
        // ...
        "types": ["vite/client", "@vitejs/plugin-rsc/types", "vite-plugin-rsc-pages/types"],
    }
}
```

## Options

### `root`

Type: `string`\
Default: `./app`

Path used to resolve pages and layouts.

### `patterns`

Glob patterns used to match pages and layouts.\

#### `page`

Type: `string`\
Default: `**/page.{js,jsx,ts,tsx}`

Glob pattern used to match pages.

#### `layout`

Type: `string`\
Default: `**/layout.{js,jsx,ts,tsx}`

Glob pattern used to match layouts.

### Other Options

For more complex setups, see [@vitejs/plugin-rsc](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc).

## Helpers

Helpers are exported from `~rsc` a virtual module.

### `rsc`

Type: `(request: Request) => Promise<Response>`

Server request handler for RSC pages.

### `redirect`

Type: `(location: string, status?: 303 | 307 | 308) => void`\
Default status: `308` (Permanent Redirect)

Redirects to another location in the server environment.

```ts
'use server';

import { redirect } from '~rsc';

export default async function Page() {
    redirect('/path');
}
```

### Helper types

```ts
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
```

## License

MIT 💖