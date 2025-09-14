import React from 'react';

export function NotFoundComponent() {
    return (
        <div
            style={{
                display: 'flex',
                gap: '2rem',
                width: '100vw',
                height: '100vh',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'Arial, sans-serif',
                overflow: 'hidden',
            }}
        >
            <h1>404</h1>
            <p>The page could not be found.</p>
        </div>
    );
}
