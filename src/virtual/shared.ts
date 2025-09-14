import React from 'react';
import type { ErrorInfo } from 'react-dom/client';

const ERROR_REDIRECT = '__RSC_REDIRECT__';

export function isRedirectError(err: any): err is RedirectError {
    return typeof err?.digest === 'string' && err.digest.startsWith(ERROR_REDIRECT + ';');
}

export function parseRedirect(err: RedirectError) {
    const [, s, l] = (err.digest || '').split(';');
    return { status: Number(s) || 308, location: decodeURIComponent(l || '/') };
}

export class RedirectError extends Error {
    public readonly digest: string;

    constructor(public location: string, status = 308) {
        super(ERROR_REDIRECT);
        this.digest = `${ERROR_REDIRECT};${status};${encodeURIComponent(location)}`;
    }
}

export const onError = (e: unknown, info: ErrorInfo) => {
    if (
        e
        && typeof e === 'object'
        && 'digest' in e
        && typeof e.digest === 'string'
    ) {
        return e.digest;
    }

    // eslint-disable-next-line @eslint-react/no-misused-capture-owner-stack
    console.error('[SSR Error]', React?.captureOwnerStack?.() || info?.componentStack || '', '\\n', e);
};
