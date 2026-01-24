'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { useTransactions } from '@/lib/transaction-context';
import { useBarang } from '@/lib/barang-context';
import { useAuth } from '@/lib/auth-context';
import { Transaksi } from '@/types';

// Stats card
function StatCard({ icon, iconColor, label, value }: {
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

export default function GudangDashboard() {
    const { transactions, getTransactionDetails, updateTransactionStatus } = useTransactions();
    const { barang: barangList, getBarangById, processCheckout, processReturn } = useBarang();
    const { registeredUsers } = useAuth();
    const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null);
    const [actionType, setActionType] = useState<'serahkan' | 'terima' | null>(null);

    const pendingCheckout = transactions.filter(t => t.status === 'menunggu_konfirmasi');
    // Items due for return (waiting for confirmation OR active rentals due today/past due)
    const today = new Date().toISOString().split('T')[0];
    const pendingReturn = transactions.filter(t =>
        t.status === 'menunggu_pengembalian' ||
        (t.status === 'sedang_disewa' && t.tanggalSelesai <= today)
    );
    const activeRentals = transactions.filter(t => t.status === 'sedang_disewa');
    const maintenanceItems = barangList.filter(b => b.status === 'maintenance' || b.status === 'rusak');
    const availableItems = barangList.filter(b => b.status === 'tersedia');

    const handleSerahkan = (trx: Transaksi) => {
        setSelectedTrx(trx);
        setActionType('serahkan');
    };

    const handleTerima = (trx: Transaksi) => {
        setSelectedTrx(trx);
        setActionType('terima');
    };

    const confirmAction = () => {
        if (!selectedTrx || !actionType) return;

        const details = getTransactionDetails(selectedTrx.id);

        if (actionType === 'serahkan') {
            // Update transaction status
            updateTransactionStatus(selectedTrx.id, 'sedang_disewa');
            // Auto-decrease stock for each item
            processCheckout(details);
            alert(`Barang untuk transaksi ${selectedTrx.kode} telah diserahkan ke member!\nStok barang otomatis berkurang.`);
        } else {
            // Update transaction status
            updateTransactionStatus(selectedTrx.id, 'selesai');
            // Auto-increase stock for each item
            processReturn(details);
            alert(`Barang untuk transaksi ${selectedTrx.kode} telah diterima kembali!\nStok barang otomatis bertambah.`);
        }

        setSelectedTrx(null);
        setActionType(null);
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Dashboard Gudang</h1>
                <p className="page-subtitle">Kelola stok, serah terima, dan inspeksi barang</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <StatCard
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l4-4 4 4" /><path d="M7 4v16" /><path d="M21 16l-4 4-4-4" /><path d="M17 20V4" /></svg>}
                    iconColor="cyan"
                    label="Siap Diserahkan"
                    value={pendingCheckout.length}
                />
                <StatCard
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                    iconColor="purple"
                    label="Sedang Disewa"
                    value={activeRentals.length}
                />
                <StatCard
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" /></svg>}
                    iconColor="orange"
                    label="Menunggu Kembali"
                    value={pendingReturn.length}
                />
                <StatCard
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>}
                    iconColor="green"
                    label="Barang Tersedia"
                    value={availableItems.length}
                />
            </div>

            {/* Quick Actions + Pending Checkout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Quick Actions */}
                <Card hover={false}>
                    <CardTitle>Aksi Cepat</CardTitle>
                    <CardContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                            <Link href="/gudang/checkout">
                                <Button style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l4-4 4 4" /><path d="M7 4v16" /><path d="M21 16l-4 4-4-4" /><path d="M17 20V4" /></svg>
                                    Serah Terima Barang
                                </Button>
                            </Link>
                            <Link href="/gudang/inspeksi">
                                <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" /><path d="M9 14l2 2 4-4" /></svg>
                                    Inspeksi Pengembalian
                                </Button>
                            </Link>
                            <Link href="/gudang/stok">
                                <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                                    Cek Stok Barang
                                </Button>
                            </Link>
                            <Link href="/gudang/maintenance">
                                <Button variant="outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                    Lihat Maintenance
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Checkout/Checkin */}
                <Card hover={false}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <CardTitle>Barang Siap Diserahkan</CardTitle>
                        <Link href="/gudang/checkout" style={{ fontSize: '0.875rem' }}>Lihat Semua →</Link>
                    </div>
                    <CardContent>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeader>Kode Transaksi</TableHeader>
                                    <TableHeader>Member</TableHeader>
                                    <TableHeader>Barang</TableHeader>
                                    <TableHeader>Tanggal Ambil</TableHeader>
                                    <TableHeader align="center">Aksi</TableHeader>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingCheckout.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                                                Tidak ada barang pending
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pendingCheckout.slice(0, 5).map(trx => {
                                        const member = registeredUsers.find(u => u.id === trx.userId);
                                        const details = getTransactionDetails(trx.id);
                                        const barangNames = details.map(d => getBarangById(d.barangId)?.nama).filter(Boolean).join(', ');

                                        return (
                                            <TableRow key={trx.id}>
                                                <TableCell><span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{trx.kode}</span></TableCell>
                                                <TableCell>{member?.nama}</TableCell>
                                                <TableCell>{barangNames.length > 30 ? barangNames.substring(0, 30) + '...' : barangNames || '-'}</TableCell>
                                                <TableCell>{formatDate(trx.tanggalMulai)}</TableCell>
                                                <TableCell align="center">
                                                    <Button size="sm" onClick={() => handleSerahkan(trx)}>Serahkan</Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Returns */}
            {pendingReturn.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <Card hover={false}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <CardTitle>Barang Menunggu Dikembalikan</CardTitle>
                            <Link href="/gudang/inspeksi" style={{ fontSize: '0.875rem' }}>Lihat Semua →</Link>
                        </div>
                        <CardContent>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableHeader>Kode Transaksi</TableHeader>
                                        <TableHeader>Member</TableHeader>
                                        <TableHeader>Barang</TableHeader>
                                        <TableHeader>Jatuh Tempo</TableHeader>
                                        <TableHeader align="center">Aksi</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingReturn.slice(0, 5).map(trx => {
                                        const member = registeredUsers.find(u => u.id === trx.userId);
                                        const details = getTransactionDetails(trx.id);
                                        const barangNames = details.map(d => getBarangById(d.barangId)?.nama).filter(Boolean).join(', ');
                                        const isOverdue = today > trx.tanggalSelesai;

                                        return (
                                            <TableRow key={trx.id}>
                                                <TableCell><span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{trx.kode}</span></TableCell>
                                                <TableCell>{member?.nama}</TableCell>
                                                <TableCell>{barangNames.length > 30 ? barangNames.substring(0, 30) + '...' : barangNames || '-'}</TableCell>
                                                <TableCell>
                                                    <span style={{ color: isOverdue ? 'var(--error)' : 'inherit' }}>
                                                        {formatDate(trx.tanggalSelesai)}
                                                        {isOverdue && ' (Terlambat!)'}
                                                    </span>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button size="sm" onClick={() => handleTerima(trx)}>Terima</Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Maintenance Items */}
            <Card hover={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CardTitle>Barang Perlu Perhatian ({maintenanceItems.length})</CardTitle>
                    <Link href="/gudang/maintenance" style={{ fontSize: '0.875rem' }}>Lihat Semua →</Link>
                </div>
                <CardContent>
                    {maintenanceItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 0.5rem' }}>
                                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                            <p>Semua barang dalam kondisi baik!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                            {maintenanceItems.slice(0, 6).map(barang => (
                                <div key={barang.id} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{barang.nama}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{barang.kode}</div>
                                        </div>
                                        <StatusBadge status={barang.status} />
                                    </div>
                                    <Link href="/gudang/maintenance">
                                        <Button size="sm" variant="secondary" style={{ width: '100%', marginTop: '0.75rem' }}>
                                            Update Status
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Modal */}
            <Modal
                isOpen={!!selectedTrx && !!actionType}
                onClose={() => { setSelectedTrx(null); setActionType(null); }}
                title={actionType === 'serahkan' ? 'Konfirmasi Serah Terima' : 'Konfirmasi Penerimaan'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setSelectedTrx(null); setActionType(null); }}>Batal</Button>
                        <Button onClick={confirmAction}>
                            {actionType === 'serahkan' ? 'Serahkan Barang' : 'Terima Barang'}
                        </Button>
                    </>
                }
            >
                {selectedTrx && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Kode Transaksi:</span>{' '}
                                <span style={{ fontWeight: 600 }}>{selectedTrx.kode}</span>
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Member:</span>{' '}
                                {registeredUsers.find(u => u.id === selectedTrx.userId)?.nama}
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Periode:</span>{' '}
                                {formatDate(selectedTrx.tanggalMulai)} - {formatDate(selectedTrx.tanggalSelesai)}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Barang:</div>
                            {getTransactionDetails(selectedTrx.id).map(detail => {
                                const barang = getBarangById(detail.barangId);
                                return (
                                    <div key={detail.id} style={{ padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                                        {barang?.nama} × {detail.qty}
                                    </div>
                                );
                            })}
                        </div>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            {actionType === 'serahkan'
                                ? 'Pastikan semua barang sudah disiapkan dan dalam kondisi baik sebelum diserahkan ke member.'
                                : 'Pastikan untuk melakukan inspeksi kondisi barang sebelum menerima pengembalian.'}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
