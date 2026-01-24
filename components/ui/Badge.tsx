'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'pending' | 'success' | 'error' | 'info' | 'rented' | 'approved' | 'rejected';
    className?: string;
}

export function Badge({ children, variant = 'info', className }: BadgeProps) {
    return (
        <span className={cn('badge', `badge-${variant}`, className)}>
            {children}
        </span>
    );
}

// Status-specific badges
export function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
        // Transaction status
        menunggu_pembayaran: { variant: 'pending', label: 'Menunggu Pembayaran' },
        menunggu_konfirmasi: { variant: 'info', label: 'Menunggu Konfirmasi' },
        sedang_disewa: { variant: 'rented', label: 'Sedang Disewa' },
        menunggu_pengembalian: { variant: 'pending', label: 'Menunggu Pengembalian' },
        selesai: { variant: 'success', label: 'Selesai' },
        dibatalkan: { variant: 'error', label: 'Dibatalkan' },
        // Barang status
        tersedia: { variant: 'success', label: 'Tersedia' },
        disewa: { variant: 'rented', label: 'Disewa' },
        maintenance: { variant: 'pending', label: 'Maintenance' },
        rusak: { variant: 'error', label: 'Rusak' },
        // Verification status
        pending: { variant: 'pending', label: 'Pending' },
        approved: { variant: 'success', label: 'Approved' },
        rejected: { variant: 'error', label: 'Rejected' },
        // Payment status
        verified: { variant: 'success', label: 'Terverifikasi' },
        // Kondisi barang
        baik: { variant: 'success', label: 'Baik' },
        kotor: { variant: 'pending', label: 'Kotor' },
        rusak_ringan: { variant: 'pending', label: 'Rusak Ringan' },
        rusak_berat: { variant: 'error', label: 'Rusak Berat' },
        hilang: { variant: 'error', label: 'Hilang' },
    };

    const config = statusConfig[status] || { variant: 'info' as const, label: status };

    return <Badge variant={config.variant}>{config.label}</Badge>;
}
