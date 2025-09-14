import React, { type PropsWithChildren, type ReactNode } from 'react';
import { createFromReadableStream } from '@vitejs/plugin-rsc/ssr';
import { renderToReadableStream } from 'react-dom/server.edge';
import { injectRSCPayload } from 'rsc-html-stream/server';
import { onError } from '@/virtual/shared';

export async function renderHTML(rscStream: ReadableStream, options: Record<string, any>) {
    // duplicate one RSC stream into two.
    // - one for SSR (ReactClient.createFromReadableStream below)
    // - another for browser hydration payload by injecting <script>...FLIGHT_DATA...</script>.
    const [rscStream1, rscStream2] = rscStream.tee();

    // deserialize RSC stream back to React VDOM
    let payload: any;
    function SsrRoot() {
        // deserialization needs to be kicked off inside ReactDOMServer context
        // for ReactDomServer preinit/preloading to work
        if (payload === undefined) {
            payload = createFromReadableStream(rscStream1);
        }
        const data = React.use<{ root: ReactNode }>(payload);
        return React.createElement(FixSsrThenable, null, data.root);
    }

    // Add an empty component in between SsrRoot and user root to avoid React SSR bugs.
    //   SsrRoot (use)
    //     => FixSsrThenable
    //       => root (which potentially has \`lazy\` + \`use\`)
    // https://github.com/facebook/react/issues/33937#issuecomment-3091349011
    function FixSsrThenable(props: PropsWithChildren) {
        return props.children;
    }

    // render html (traditional SSR)
    const bootstrapScriptContent
        = await import.meta.viteRsc.loadBootstrapScriptContent('index');
    const htmlStream = await renderToReadableStream(React.createElement(SsrRoot, null), {
        bootstrapScriptContent: options?.debugNojs
            ? undefined
            : bootstrapScriptContent,
        nonce: options?.nonce,
        onError,
        formState: options?.formState,
    });

    let responseStream: ReadableStream = htmlStream;
    if (!options?.debugNojs) {
        // initial RSC stream is injected in HTML stream as <script>...FLIGHT_DATA...</script>
        // using utility made by devongovett https://github.com/devongovett/rsc-html-stream
        responseStream = responseStream.pipeThrough(
            injectRSCPayload(rscStream2, {
                nonce: options?.nonce,
            }),
        );
    }

    return responseStream;
}
