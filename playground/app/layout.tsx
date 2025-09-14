'use server';

import type { LayoutProps } from '~rsc';
import './global.css';

export default async function Layout({ children }: LayoutProps) {
    console.log('Hello Server!');

    return <main>{children}</main>;
}
