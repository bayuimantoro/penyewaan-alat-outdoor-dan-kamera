'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

// Icons as SVG components for simplicity (avoiding lucide-react dependency issues)
const Icons = {
    Home: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    Package: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    ShoppingCart: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    ),
    History: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    Users: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    CreditCard: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    BarChart: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
    ),
    Tag: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    ),
    CheckSquare: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    ),
    ArrowDownUp: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8l4-4 4 4" />
            <path d="M7 4v16" />
            <path d="M21 16l-4 4-4-4" />
            <path d="M17 20V4" />
        </svg>
    ),
    ClipboardCheck: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
            <path d="M9 14l2 2 4-4" />
        </svg>
    ),
    Wrench: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    ),
    LogOut: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
};

// Navigation config by role
const navigationConfig: Record<UserRole, NavSection[]> = {
    member: [
        {
            title: 'Menu Utama',
            items: [
                { label: 'Dashboard', href: '/member', icon: <Icons.Home /> },
                { label: 'Katalog Barang', href: '/member/katalog', icon: <Icons.Package /> },
                { label: 'Keranjang', href: '/member/keranjang', icon: <Icons.ShoppingCart /> },
                { label: 'Riwayat Sewa', href: '/member/riwayat', icon: <Icons.History /> },
            ],
        },
    ],
    admin: [
        {
            title: 'Dashboard',
            items: [
                { label: 'Overview', href: '/admin', icon: <Icons.Home /> },
                { label: 'Laporan', href: '/admin/laporan', icon: <Icons.BarChart /> },
            ],
        },
        {
            title: 'Manajemen',
            items: [
                { label: 'Validasi Member', href: '/admin/validasi', icon: <Icons.Users /> },
                { label: 'Transaksi', href: '/admin/transaksi', icon: <Icons.CreditCard /> },
                { label: 'Data Barang', href: '/admin/barang', icon: <Icons.Package /> },
                { label: 'Promo', href: '/admin/promo', icon: <Icons.Tag /> },
            ],
        },
    ],
    gudang: [
        {
            title: 'Menu Utama',
            items: [
                { label: 'Dashboard', href: '/gudang', icon: <Icons.Home /> },
                { label: 'Stok Barang', href: '/gudang/stok', icon: <Icons.Package /> },
            ],
        },
        {
            title: 'Operasional',
            items: [
                { label: 'Serah Terima', href: '/gudang/checkout', icon: <Icons.ArrowDownUp /> },
                { label: 'Inspeksi', href: '/gudang/inspeksi', icon: <Icons.ClipboardCheck /> },
                { label: 'Maintenance', href: '/gudang/maintenance', icon: <Icons.Wrench /> },
            ],
        },
    ],
};

interface SidebarProps {
    role: UserRole;
    userName?: string;
}

export function Sidebar({ role, userName = 'User' }: SidebarProps) {
    const pathname = usePathname();
    const sections = navigationConfig[role];

    const roleLabels: Record<UserRole, string> = {
        member: 'Member',
        admin: 'Admin Front Office',
        gudang: 'Petugas Gudang',
    };

    return (
        <aside className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div
                        style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="gradient-text">RentalGear</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {sections.map((section, idx) => (
                    <div key={idx} className="nav-section">
                        {section.title && (
                            <div className="nav-section-title">{section.title}</div>
                        )}
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn('nav-item', pathname === item.href && 'active')}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer / User info */}
            <div
                style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border-color)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div
                        style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '50%',
                            background: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--primary-400)',
                        }}
                    >
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{userName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {roleLabels[role]}
                        </div>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.href = '/login';
                    }}
                    className="nav-item"
                    style={{
                        color: 'var(--error)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left'
                    }}
                >
                    <Icons.LogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
