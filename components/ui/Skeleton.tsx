'use client';

import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    radius?: string;
    className?: string;
    style?: React.CSSProperties;
}

// Base skeleton box with shimmer animation
export function SkeletonBox({
    width = '100%',
    height = '1rem',
    radius = '0.5rem',
    className = '',
    style = {}
}: SkeletonProps) {
    return (
        <div
            className={`skeleton-box ${className}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: radius,
                ...style
            }}
        />
    );
}

// Alias for SkeletonBox
export const Skeleton = SkeletonBox;

// Stat card skeleton (for dashboard stat cards)
export function SkeletonStatCard() {
    return (
        <div className="stat-card skeleton-stat-card">
            <div className="skeleton-stat-icon">
                <SkeletonBox width={48} height={48} radius="0.75rem" />
            </div>
            <div className="stat-content">
                <SkeletonBox width="60%" height="0.75rem" />
                <SkeletonBox width="40%" height="1.5rem" style={{ marginTop: '0.5rem' }} />
            </div>
        </div>
    );
}

// Table row skeleton
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="skeleton-table-row">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} style={{ padding: '1rem' }}>
                    <SkeletonBox height="1rem" width={i === 0 ? '80%' : i === columns - 1 ? '60%' : '100%'} />
                </td>
            ))}
        </tr>
    );
}

// Full page loading skeleton for dashboard
export function DashboardSkeleton() {
    return (
        <div className="dashboard-skeleton">
            {/* Header skeleton */}
            <div className="skeleton-header">
                <SkeletonBox width="250px" height="2rem" />
                <SkeletonBox width="300px" height="1rem" style={{ marginTop: '0.5rem' }} />
            </div>

            {/* Stats grid skeleton */}
            <div className="skeleton-stats-grid">
                {[1, 2, 3, 4].map(i => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>

            {/* Content cards skeleton */}
            <div className="skeleton-content-grid">
                <div className="skeleton-main-card">
                    <SkeletonBox width="150px" height="1.25rem" style={{ marginBottom: '1rem' }} />
                    <table className="skeleton-table">
                        <tbody>
                            {[1, 2, 3, 4, 5].map(i => (
                                <SkeletonTableRow key={i} columns={4} />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="skeleton-side-card">
                    <SkeletonBox width="120px" height="1.25rem" style={{ marginBottom: '1rem' }} />
                    {[1, 2, 3].map(i => (
                        <SkeletonBox key={i} height="60px" style={{ marginBottom: '0.75rem' }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Simple loading spinner as fallback
export function LoadingSpinner({ size = 40 }: { size?: number }) {
    return (
        <div className="loading-spinner-container">
            <div
                className="loading-spinner"
                style={{ width: size, height: size }}
            />
        </div>
    );
}

// Page loading component with spinner and text
export function PageLoading({ text = 'Memuat data...' }: { text?: string }) {
    return (
        <div className="page-loading">
            <div className="page-loading-content">
                <LoadingSpinner size={48} />
                <p className="page-loading-text">{text}</p>
            </div>
        </div>
    );
}
