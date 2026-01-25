'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRupiah, formatDate } from '@/lib/utils';
import { mockKategori } from '@/lib/mock-data';
import { useTransactions } from '@/lib/transaction-context';
import { useSession } from '@/lib/session-context';
import { useBarang } from '@/lib/barang-context';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

// Stats card component
function StatCard({
    icon,
    iconColor,
    label,
    value,
}: {
    icon: React.ReactNode;
    iconColor: string;
    label: string;
    value: string | number;
}) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${iconColor}`}>{icon}</div>
            <div className="stat-content">
                <h3>{label}</h3>
                <div className="stat-value">{value}</div>
            </div>
        </div>
    );
}

export default function MemberDashboard() {
    // Get current user from SessionContext (from database session)
    const { currentUser, isLoading: sessionLoading } = useSession();
    // Use transaction context for synced data
    const { transactions, isLoading: transactionsLoading } = useTransactions();
    // Get barang list from database
    const { barang: barangList, isLoading: barangLoading } = useBarang();

    // Show skeleton while loading
    if (sessionLoading || transactionsLoading || barangLoading) {
        return <DashboardSkeleton />;
    }

    // Filter transactions to only show current user's transactions
    // Use currentUser.id if available, otherwise show empty
    const userTransactions = currentUser
        ? transactions.filter(t => t.userId === currentUser.id)
        : [];

    // Get active rentals  from user's transactions
    const activeRentals = userTransactions.filter(t => t.status === 'sedang_disewa');
    const pendingPayments = userTransactions.filter(t => t.status === 'menunggu_pembayaran');

    // Get user's full name for greeting
    const userName = currentUser?.nama || 'Member';

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Selamat Datang, {userName}! 👋</h1>
                <p className="page-subtitle">Berikut ringkasan aktivitas penyewaan Anda</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <StatCard
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                    }
                    iconColor="purple"
                    label="Sedang Disewa"
                    value={activeRentals.length}
                />
                <StatCard
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    }
                    iconColor="orange"
                    label="Menunggu Bayar"
                    value={pendingPayments.length}
                />
                <StatCard
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 11 12 14 22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                    }
                    iconColor="green"
                    label="Total Transaksi"
                    value={userTransactions.length}
                />
                <StatCard
                    icon={
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    }
                    iconColor="cyan"
                    label="Total Spending"
                    value={formatRupiah(
                        userTransactions
                            .filter(t => t.status !== 'dibatalkan' && t.status !== 'menunggu_pembayaran')
                            .reduce((acc, t) => {
                                let validTotal = Number(t.total);
                                if (isNaN(validTotal) || validTotal === 0) {
                                    // Fallback calculation if total is invalid
                                    // Note: We don't have full details here easily without getTransactionDetails
                                    // So we rely on subtotal + denda at least, or 0
                                    validTotal = (Number(t.subtotal) || 0) + (Number(t.denda) || 0);
                                }
                                return acc + validTotal;
                            }, 0)
                    )}
                />
            </div>

            {/* Quick Actions + Active Rentals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Quick Actions */}
                <Card hover={false}>
                    <CardTitle>Aksi Cepat</CardTitle>
                    <CardContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                            <Link href="/member/katalog">
                                <Button style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                    Lihat Katalog Barang
                                </Button>
                            </Link>
                            <Link href="/member/riwayat">
                                <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Lihat Riwayat Sewa
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Rentals */}
                <Card hover={false}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <CardTitle>Sewa Aktif</CardTitle>
                        <Link href="/member/riwayat" style={{ fontSize: '0.875rem' }}>
                            Lihat Semua →
                        </Link>
                    </div>
                    <CardContent>
                        {activeRentals.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                                <p>Tidak ada penyewaan aktif</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                {activeRentals.map(trx => (
                                    <div
                                        key={trx.id}
                                        style={{
                                            padding: '1rem',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid var(--border-color)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{trx.kode}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {formatDate(trx.tanggalMulai)} - {formatDate(trx.tanggalSelesai)}
                                                </div>
                                            </div>
                                            <StatusBadge status={trx.status} />
                                        </div>
                                        <div style={{ marginTop: '0.75rem', fontSize: '1rem', fontWeight: 600, color: 'var(--primary-400)' }}>
                                            {formatRupiah(trx.total)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Popular Categories */}
            <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Kategori Populer</h2>
                    <Link href="/member/katalog" style={{ fontSize: '0.875rem' }}>
                        Lihat Semua →
                    </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                    {mockKategori.slice(0, 6).map(kat => (
                        <Link key={kat.id} href={`/member/katalog?kategori=${kat.id}`}>
                            <Card>
                                <div style={{ textAlign: 'center' }}>
                                    <div
                                        style={{
                                            width: '3rem',
                                            height: '3rem',
                                            margin: '0 auto 0.75rem',
                                            borderRadius: '0.75rem',
                                            background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.2), rgba(6, 182, 212, 0.1))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--primary-400)',
                                        }}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        </svg>
                                    </div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{kat.nama}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {barangList.filter(b => b.kategoriId === kat.id).length} item
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
