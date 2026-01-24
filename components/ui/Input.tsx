'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="input-group">
                {label && (
                    <label htmlFor={inputId}>{label}</label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn('input', error && 'input-error', className)}
                    {...props}
                />
                {error && <span className="error-text">{error}</span>}
                {helperText && !error && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {helperText}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="input-group">
                {label && (
                    <label htmlFor={inputId}>{label}</label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={cn('input', error && 'input-error', className)}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    {...props}
                />
                {error && <span className="error-text">{error}</span>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="input-group">
                {label && (
                    <label htmlFor={inputId}>{label}</label>
                )}
                <select
                    ref={ref}
                    id={inputId}
                    className={cn('input', error && 'input-error', className)}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <span className="error-text">{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
