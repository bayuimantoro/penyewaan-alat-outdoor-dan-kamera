// Utility functions and helpers

import { StatusTransaksi, StatusBarang, StatusVerifikasi, KondisiBarang } from '@/types';

// Format currency to Indonesian Rupiah
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format date to Indonesian locale
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

// Format date with time
export function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Calculate days between two dates
export function calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
}

// Get status badge class
export function getStatusBadgeClass(status: StatusTransaksi): string {
    const statusMap: Record<StatusTransaksi, string> = {
        menunggu_pembayaran: 'badge-pending',
        menunggu_konfirmasi: 'badge-info',
        sedang_disewa: 'badge-rented',
        menunggu_pengembalian: 'badge-pending',
        selesai: 'badge-success',
        dibatalkan: 'badge-error',
    };
    return statusMap[status] || 'badge-info';
}

// Get status label
export function getStatusLabel(status: StatusTransaksi): string {
    const labelMap: Record<StatusTransaksi, string> = {
        menunggu_pembayaran: 'Menunggu Pembayaran',
        menunggu_konfirmasi: 'Menunggu Konfirmasi',
        sedang_disewa: 'Sedang Disewa',
        menunggu_pengembalian: 'Menunggu Pengembalian',
        selesai: 'Selesai',
        dibatalkan: 'Dibatalkan',
    };
    return labelMap[status] || status;
}

// Get barang status badge class
export function getBarangStatusClass(status: StatusBarang): string {
    const statusMap: Record<StatusBarang, string> = {
        tersedia: 'badge-success',
        disewa: 'badge-rented',
        maintenance: 'badge-pending',
        rusak: 'badge-error',
    };
    return statusMap[status] || 'badge-info';
}

// Get barang status label
export function getBarangStatusLabel(status: StatusBarang): string {
    const labelMap: Record<StatusBarang, string> = {
        tersedia: 'Tersedia',
        disewa: 'Disewa',
        maintenance: 'Maintenance',
        rusak: 'Rusak',
    };
    return labelMap[status] || status;
}

// Get verification status badge class
export function getVerifikasiClass(status: StatusVerifikasi): string {
    const statusMap: Record<StatusVerifikasi, string> = {
        pending: 'badge-pending',
        approved: 'badge-success',
        rejected: 'badge-error',
    };
    return statusMap[status] || 'badge-info';
}

// Get kondisi barang badge class
export function getKondisiClass(kondisi: KondisiBarang): string {
    const kondisiMap: Record<KondisiBarang, string> = {
        baik: 'badge-success',
        kotor: 'badge-pending',
        rusak_ringan: 'badge-pending',
        rusak_berat: 'badge-error',
        hilang: 'badge-error',
    };
    return kondisiMap[kondisi] || 'badge-info';
}

// Calculate denda based on kondisi
export function calculateDenda(kondisi: KondisiBarang, hargaSewa: number): number {
    const dendaMultiplier: Record<KondisiBarang, number> = {
        baik: 0,
        kotor: 0.1, // 10% of rental price
        rusak_ringan: 0.25, // 25% of rental price
        rusak_berat: 0.5, // 50% of rental price
        hilang: 2, // 200% of rental price (full replacement)
    };
    return Math.round(hargaSewa * dendaMultiplier[kondisi]);
}

// Generate random ID (for mock data)
export function generateId(): number {
    return Math.floor(Math.random() * 100000);
}

// Generate transaction code
export function generateTransactionCode(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TRX${dateStr}${random}`;
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Indonesian format)
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

// Class name helper (like clsx)
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}
