import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background decorations */}
            <div
                style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(217, 70, 239, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-15%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '28rem' }}>
                {children}
            </div>
        </div>
    );
}
