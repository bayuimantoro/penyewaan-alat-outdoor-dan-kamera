'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDate } from '@/lib/utils';
import { mockDetailTransaksi } from '@/lib/mock-data';
import { useTransactions } from '@/lib/transaction-context';
import { useUsers } from '@/lib/user-context';
import { useBarang } from '@/lib/barang-context';
import { Transaksi, StatusTransaksi } from '@/types';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

// Stats card
function StatCard({ icon, iconColor, label, value, change }: {
    icon: React.ReactNode;
    iconColor: string;
    label: string;
    value: string | number;
    change?: { value: string; positive: boolean };
}) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${iconColor}`}>{icon}</div>
            <div className="stat-content">
                <h3>{label}</h3>
                <div className="stat-value">{value}</div>
                {change && (
                    <div className={`stat-change ${change.positive ? 'positive' : 'negative'}`}>
                        {change.positive ? '↑' : '↓'} {change.value}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const { transactions, updateTransactionStatus, getTransactionDetails, isLoading: transactionsLoading } = useTransactions();
    const { users, updateUserStatus, isLoading: usersLoading } = useUsers();
    const { barang: barangList, isLoading: barangLoading } = useBarang();
    const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null);

    // Show skeleton while loading
    const isLoading = transactionsLoading || usersLoading || barangLoading;
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const pendingMembers = users.filter(u => u.role === 'member' && u.statusVerifikasi === 'pending');
    const activeTransaksi = transactions.filter(t => t.status !== 'selesai' && t.status !== 'dibatalkan');
    // Calculate revenue ONLY from completed/ongoing transactions (not pending payment)
    const totalRevenue = transactions
        .filter(t => ['selesai', 'sedang_disewa', 'menunggu_pengembalian'].includes(t.status))
        .reduce((sum: number, t) => {
            // Prioritize database total if available and valid
            if (t.total > 0) return sum + Number(t.total);

            // Fallback calculation
            const subtotal = Number(t.subtotal) || 0;
            const diskon = Number(t.diskon) || 0;
            const denda = Number(t.denda) || 0;
            const biayaLayanan = subtotal > 0 ? 10000 : 0;
            const validTotal = subtotal + biayaLayanan - diskon + denda;

            return sum + validTotal;
        }, 0);

    // Calculate monthly revenue change
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthRevenue = transactions
        .filter(t => t.status !== 'dibatalkan' && new Date(t.tanggalBooking) >= thisMonthStart)
        .reduce((sum, t) => sum + (Number(t.total) || Number(t.subtotal) || 0), 0);

    const lastMonthRevenue = transactions
        .filter(t => {
            const date = new Date(t.tanggalBooking);
            return t.status !== 'dibatalkan' && date >= lastMonthStart && date <= lastMonthEnd;
        })
        .reduce((sum, t) => sum + (Number(t.total) || Number(t.subtotal) || 0), 0);

    // Calculate percentage change (only if there's data to compare)
    let revenueChange: { value: string; positive: boolean } | undefined;
    if (totalRevenue > 0 && lastMonthRevenue > 0) {
        const change = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        revenueChange = {
            value: `${change >= 0 ? '+' : ''}${change.toFixed(0)}% dari bulan lalu`,
            positive: change >= 0
        };
    } else if (totalRevenue > 0 && thisMonthRevenue > 0) {
        revenueChange = { value: 'Data baru bulan ini', positive: true };
    }

    const handleApproveMember = (memberId: number) => {
        updateUserStatus(memberId, 'approved');
        alert('Member berhasil diverifikasi!');
    };

    const handleRejectMember = (memberId: number) => {
        if (confirm('Yakin ingin menolak member ini?')) {
            updateUserStatus(memberId, 'rejected');
            alert('Member ditolak.');
        }
    };

    const handleUpdateTransactionStatus = (trxId: number, newStatus: StatusTransaksi) => {
        updateTransactionStatus(trxId, newStatus);
        if (selectedTrx && selectedTrx.id === trxId) {
            setSelectedTrx({ ...selectedTrx, status: newStatus });
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Dashboard Admin</h1>
                <p className="page-subtitle">Overview sistem penyewaan alat outdoor & kamera</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <StatCard
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
                    iconColor="purple"
                    label="Member Pending"
                    value={pendingMembers.length}
                />
                <StatCard
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>}
                    iconColor="cyan"
                    label="Transaksi Aktif"
                    value={activeTransaksi.length}
                />
                <StatCard
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                    iconColor="green"
                    label="Total Pendapatan"
                    value={formatRupiah(totalRevenue)}
                    change={revenueChange}
                />
                <StatCard
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>}
                    iconColor="orange"
                    label="Total Barang"
                    value={barangList.length}
                />
            </div>

            {/* Quick Actions + Pending Members */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Quick Actions */}
                <Card hover={false}>
                    <CardTitle>Aksi Cepat</CardTitle>
                    <CardContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                            <Link href="/admin/validasi">
                                <Button style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                    Validasi Member ({pendingMembers.length})
                                </Button>
                            </Link>
                            <Link href="/admin/transaksi">
                                <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                                    Kelola Transaksi
                                </Button>
                            </Link>
                            <Link href="/admin/barang">
                                <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                                    Kelola Barang
                                </Button>
                            </Link>
                            <Link href="/admin/promo">
                                <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                                    Kelola Promo
                                </Button>
                            </Link>
                            <Link href="/admin/laporan">
                                <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
                                    Lihat Laporan
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Members */}
                <Card hover={false}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <CardTitle>Member Menunggu Verifikasi</CardTitle>
                        <Link href="/admin/validasi" style={{ fontSize: '0.875rem' }}>Lihat Semua →</Link>
                    </div>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Nama</TableHeader>
                                    <TableHeader>Email</TableHeader>
                                    <TableHeader>Tanggal Daftar</TableHeader>
                                    <TableHeader align="center">Status</TableHeader>
                                    <TableHeader align="center">Aksi</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingMembers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                                                Tidak ada member pending
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingMembers.map(member => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div style={{ fontWeight: 600 }}>{member.nama}</div>
                                            </TableCell>
                                            <TableCell>{member.email}</TableCell>
                                            <TableCell>{formatDate(member.createdAt)}</TableCell>
                                            <TableCell align="center">
                                                <StatusBadge status={member.statusVerifikasi} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <Button size="sm" onClick={() => handleApproveMember(member.id)} style={{ background: 'var(--success)' }}>
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="secondary" onClick={() => handleRejectMember(member.id)} style={{ color: 'var(--error)' }}>
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card hover={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CardTitle>Transaksi Terbaru</CardTitle>
                    <Link href="/admin/transaksi" style={{ fontSize: '0.875rem' }}>Lihat Semua →</Link>
                </div>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Kode</TableHeader>
                                <TableHeader>Member</TableHeader>
                                <TableHeader>Tanggal</TableHeader>
                                <TableHeader align="right">Total</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.slice(0, 5).map(trx => {
                                const member = users.find(u => u.id === trx.userId);
                                const details = getTransactionDetails(trx.id);

                                // Calculate display total
                                const subtotal = Number(trx.subtotal) || 0;
                                let displayTotal = Number(trx.total) || 0;

                                if (displayTotal === 0 && subtotal > 0) {
                                    const biayaLayanan = 10000;
                                    const diskon = Number(trx.diskon) || 0;
                                    displayTotal = subtotal + biayaLayanan - diskon;
                                } else {
                                    // Fallback if subtotal is missing (should verify with details)
                                    const calculatedSubtotal = details.reduce((sum: number, d: { hargaSewa?: number; qty: number }) => {
                                        const price = d.hargaSewa || 0;
                                        return sum + (price * d.qty * trx.totalHari);
                                    }, 0);

                                    if (calculatedSubtotal > 0) {
                                        const biayaLayanan = 10000;
                                        const diskon = Number(trx.diskon) || 0;
                                        displayTotal = calculatedSubtotal + biayaLayanan - diskon;
                                    }
                                }

                                // Format date with fallback
                                const displayDate = trx.tanggalBooking && !isNaN(new Date(trx.tanggalBooking).getTime())
                                    ? formatDate(trx.tanggalBooking)
                                    : trx.tanggalMulai && !isNaN(new Date(trx.tanggalMulai).getTime())
                                        ? formatDate(trx.tanggalMulai)
                                        : '-';

                                return (
                                    <TableRow key={trx.id}>
                                        <TableCell>
                                            <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{trx.kode}</span>
                                        </TableCell>
                                        <TableCell>{member?.nama || '-'}</TableCell>
                                        <TableCell>{displayDate}</TableCell>
                                        <TableCell align="right">{formatRupiah(displayTotal)}</TableCell>
                                        <TableCell align="center"><StatusBadge status={trx.status} /></TableCell>
                                        <TableCell align="center">
                                            <Button size="sm" variant="secondary" onClick={() => setSelectedTrx(trx)}>Detail</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Transaction Detail Modal */}
            <Modal
                isOpen={!!selectedTrx}
                onClose={() => setSelectedTrx(null)}
                title={`Detail Transaksi ${selectedTrx?.kode}`}
                size="lg"
            >
                {selectedTrx && (() => {
                    const modalDetails = getTransactionDetails(selectedTrx.id);

                    // Calculate display total
                    const subtotal = Number(selectedTrx.subtotal) || 0;
                    let modalDisplayTotal = 0;

                    if (subtotal > 0) {
                        const biayaLayanan = 10000;
                        const diskon = Number(selectedTrx.diskon) || 0;
                        // For modal total, we add denda immediately here or handle it in render?
                        // In other pages we handle it in render. Let's keep it consistent.
                        // Here we calculate the BASE total (without denda) to show as "Total"
                        // Then denda is added visually or separate line.
                        // Wait, previous code added denda in render: displayTotal + (denda || 0)
                        // So here we just calculate the base total
                        modalDisplayTotal = subtotal + biayaLayanan - diskon;
                    } else {
                        // Fallback
                        const calculatedSubtotal = modalDetails.reduce((sum: number, d: { hargaSewa?: number; qty: number }) => {
                            const price = d.hargaSewa || 0;
                            return sum + (price * d.qty * selectedTrx.totalHari);
                        }, 0);

                        if (calculatedSubtotal > 0) {
                            const biayaLayanan = 10000;
                            const diskon = Number(selectedTrx.diskon) || 0;
                            modalDisplayTotal = calculatedSubtotal + biayaLayanan - diskon;
                        }
                    }

                    // Format date with fallback
                    const modalDisplayDate = selectedTrx.tanggalBooking && !isNaN(new Date(selectedTrx.tanggalBooking).getTime())
                        ? formatDate(selectedTrx.tanggalBooking)
                        : selectedTrx.tanggalMulai && !isNaN(new Date(selectedTrx.tanggalMulai).getTime())
                            ? formatDate(selectedTrx.tanggalMulai)
                            : '-';

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <StatusBadge status={selectedTrx.status} />
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Booking: {modalDisplayDate}
                                </div>
                            </div>

                            {/* Member Info */}
                            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>INFORMASI MEMBER</h4>
                                {(() => {
                                    const user = users.find(u => u.id === selectedTrx.userId);
                                    return (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <div><span style={{ color: 'var(--text-muted)' }}>Nama:</span> {user?.nama || '-'}</div>
                                            <div><span style={{ color: 'var(--text-muted)' }}>No. HP:</span> {user?.noHp || '-'}</div>
                                            <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {user?.email || '-'}</div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Items */}
                            <div>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>BARANG</h4>
                                {modalDetails.length > 0 ? modalDetails.map(detail => {
                                    const barang = barangList.find(b => b.id === detail.barangId);
                                    return (
                                        <div key={detail.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{barang?.nama || 'Barang tidak ditemukan'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{detail.qty} unit × {formatRupiah(detail.hargaSewa || 0)}/hari</div>
                                            </div>
                                            <div style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{formatRupiah(detail.subtotal || 0)}</div>
                                        </div>
                                    );
                                }) : (
                                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Tidak ada data barang
                                    </div>
                                )}
                            </div>

                            {/* Total & Breakdown */}
                            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                                {/* Subtotal */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Subtotal</span>
                                    <span>{formatRupiah(subtotal)}</span>
                                </div>

                                {/* Biaya Layanan */}
                                {subtotal > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                        <span>Biaya Layanan</span>
                                        <span>{formatRupiah(10000)}</span>
                                    </div>
                                )}

                                {/* Diskon */}
                                {Number(selectedTrx.diskon) > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--success)' }}>
                                        <span>Diskon</span>
                                        <span>-{formatRupiah(selectedTrx.diskon)}</span>
                                    </div>
                                )}

                                {/* Denda */}
                                {Number(selectedTrx.denda) > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--error)' }}>
                                        <span>Denda</span>
                                        <span>+{formatRupiah(selectedTrx.denda)}</span>
                                    </div>
                                )}

                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem' }}>
                                    <span>Total</span>
                                    <span className="gradient-text">{formatRupiah(modalDisplayTotal + Number(selectedTrx.denda || 0))}</span>
                                </div>
                            </div>

                            {/* Quick Status Update */}
                            <div>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>UPDATE STATUS</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {selectedTrx.status === 'menunggu_pembayaran' && (
                                        <Button size="sm" onClick={() => handleUpdateTransactionStatus(selectedTrx.id, 'menunggu_konfirmasi')}>
                                            ✓ Konfirmasi Pembayaran
                                        </Button>
                                    )}
                                    {selectedTrx.status === 'menunggu_konfirmasi' && (
                                        <Button size="sm" onClick={() => handleUpdateTransactionStatus(selectedTrx.id, 'sedang_disewa')}>
                                            📦 Serahkan Barang
                                        </Button>
                                    )}
                                    {selectedTrx.status === 'sedang_disewa' && (
                                        <Button size="sm" onClick={() => handleUpdateTransactionStatus(selectedTrx.id, 'selesai')}>
                                            ✅ Barang Dikembalikan
                                        </Button>
                                    )}
                                    {selectedTrx.status !== 'dibatalkan' && selectedTrx.status !== 'selesai' && (
                                        <Button size="sm" variant="secondary" onClick={() => handleUpdateTransactionStatus(selectedTrx.id, 'dibatalkan')} style={{ color: 'var(--error)' }}>
                                            ✕ Batalkan
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
}
