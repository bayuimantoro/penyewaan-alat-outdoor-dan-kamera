'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className, hover = true, onClick }: CardProps) {
    return (
        <div
            className={cn('card', !hover && 'hover:transform-none hover:shadow-none', className)}
            onClick={onClick}
            style={onClick ? { cursor: 'pointer' } : undefined}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div
            className={className}
            style={{
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
            }}
        >
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    return (
        <h3 className={className} style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {children}
        </h3>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return <div className={className}>{children}</div>;
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div
            className={className}
            style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
            }}
        >
            {children}
        </div>
    );
}
