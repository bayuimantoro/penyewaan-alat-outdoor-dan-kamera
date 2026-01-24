'use client';

import React from 'react';

interface TableProps {
    children: React.ReactNode;
}

export function Table({ children }: TableProps) {
    return (
        <div className="table-container">
            <table className="table">{children}</table>
        </div>
    );
}

interface TableHeadProps {
    children: React.ReactNode;
}

export function TableHead({ children }: TableHeadProps) {
    return <thead>{children}</thead>;
}

interface TableBodyProps {
    children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
    return <tbody>{children}</tbody>;
}

interface TableRowProps {
    children: React.ReactNode;
    onClick?: () => void;
}

export function TableRow({ children, onClick }: TableRowProps) {
    return (
        <tr onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
            {children}
        </tr>
    );
}

interface TableHeaderProps {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right';
}

export function TableHeader({ children, align = 'left' }: TableHeaderProps) {
    return <th style={{ textAlign: align }}>{children}</th>;
}

interface TableCellProps {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right';
    colSpan?: number;
}

export function TableCell({ children, align = 'left', colSpan }: TableCellProps) {
    return <td style={{ textAlign: align }} colSpan={colSpan}>{children}</td>;
}

// Empty state component
export function TableEmpty({ message = 'Tidak ada data' }: { message?: string }) {
    return (
        <tr>
            <td
                colSpan={100}
                style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                    </svg>
                    <span>{message}</span>
                </div>
            </td>
        </tr>
    );
}
