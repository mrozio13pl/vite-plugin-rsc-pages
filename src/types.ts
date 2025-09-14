export interface RawRoute {
    pattern: string;
    page: string;
    layouts: string[];
};

export interface ProcessedRoute {
    page: () => Promise<any>;
    layouts: (() => Promise<any>)[];
}

export interface Patterns {
    /**
     * Glob pattern for pages.
     * @default "**\/page.{js,jsx,ts,tsx}"
     */
    page: string | string[];
    /**
     * Glob pattern for layouts.
     * @default "**\/layout.{js,jsx,ts,tsx}"
     */
    layout: string | string[];
    /**
     * Glob pattern for not found pages.
     * @default "**\/not-found.{js,jsx,ts,tsx}"
     */
    notFound: string | string[];
}

export interface RscPagesOptions {
    patterns?: Partial<Patterns>;
    /**
     * The root of pages directory.
     * @default './app'
     */
    root?: string;
}
