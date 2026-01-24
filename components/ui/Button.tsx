'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    disabled,
    children,
    ...props
}: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={cn(baseClass, variantClass, sizeClasses[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <span className="spinner" style={{ width: '1rem', height: '1rem' }} />
            )}
            {children}
        </button>
    );
}
