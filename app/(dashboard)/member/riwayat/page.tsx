'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatRupiah, formatDate } from '@/lib/utils';
import { mockBarang, mockKategori } from '@/lib/mock-data';
import { useTransactions } from '@/lib/transaction-context';
import { useAuth } from '@/lib/auth-context';
import { Transaksi } from '@/types';

export default function RiwayatPage() {
    const router = useRouter();
    // Use transaction context for persistent state
    const { transactions, updateTransactionStatus, getTransactionDetails } = useTransactions();
    const { currentUser } = useAuth();

    // Filter transactions by current user
    const userTransactions = transactions.filter(t => t.userId === currentUser?.id);

    const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null);
    const [payingTrx, setPayingTrx] = useState<Transaksi | null>(null);
    const [returningTrx, setReturningTrx] = useState<Transaksi | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleViewDetail = (trx: Transaksi) => {
        setSelectedTrx(trx);
    };

    const handlePayNow = (trx: Transaksi) => {
        setPayingTrx(trx);
    };

    const confirmPayment = () => {
        if (!payingTrx) return;

        setIsProcessing(true);
        setTimeout(() => {
            // Update transaction status using context (persists to localStorage)
            updateTransactionStatus(payingTrx.id, 'menunggu_konfirmasi');
            setIsProcessing(false);
            setPayingTrx(null);
            alert('Pembayaran berhasil dikonfirmasi! Silakan datang ke lokasi untuk mengambil barang.');
        }, 1500);
    };

    const handleReturn = (trx: Transaksi) => {
        setReturningTrx(trx);
    };

    const confirmReturn = () => {
        if (!returningTrx) return;

        setIsProcessing(true);
        setTimeout(() => {
            updateTransactionStatus(returningTrx.id, 'menunggu_pengembalian');
            setIsProcessing(false);
            setReturningTrx(null);
            alert('Permintaan pengembalian berhasil!\nSilakan kembalikan barang ke lokasi rental.');
        }, 1000);
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Riwayat Penyewaan</h1>
                <p className="page-subtitle">Lihat semua riwayat dan status penyewaan Anda</p>
            </div>

            {/* Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                    marginBottom: '2rem',
                }}
            >
                {[
                    { label: 'Total', value: userTransactions.length, color: 'var(--primary-400)' },
                    { label: 'Sedang Disewa', value: userTransactions.filter(t => t.status === 'sedang_disewa').length, color: 'var(--warning)' },
                    { label: 'Selesai', value: userTransactions.filter(t => t.status === 'selesai').length, color: 'var(--success)' },
                    { label: 'Menunggu Bayar', value: userTransactions.filter(t => t.status === 'menunggu_pembayaran').length, color: 'var(--error)' },
                ].map((stat, idx) => (
                    <Card key={idx} hover={false}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {stat.label}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Transaction List */}
            <Card hover={false}>
                <CardTitle>Semua Transaksi</CardTitle>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Kode Transaksi</TableHeader>
                                <TableHeader>Tanggal Sewa</TableHeader>
                                <TableHeader>Barang</TableHeader>
                                <TableHeader align="right">Total</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userTransactions.length === 0 ? (
                                <TableEmpty message="Belum ada transaksi" />
                            ) : (
                                userTransactions.map(trx => {
                                    const details = getTransactionDetails(trx.id);
                                    const barangNames = details
                                        .map(d => mockBarang.find(b => b.id === d.barangId)?.nama)
                                        .filter(Boolean)
                                        .join(', ');

                                    return (
                                        <TableRow key={trx.id}>
                                            <TableCell>
                                                <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                                                    {trx.kode}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>{formatDate(trx.tanggalMulai)}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    s/d {formatDate(trx.tanggalSelesai)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div style={{ maxWidth: '200px' }}>
                                                    {barangNames.length > 50 ? barangNames.substring(0, 50) + '...' : barangNames}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {details.length} item, {trx.totalHari} hari
                                                </div>
                                            </TableCell>
                                            <TableCell align="right">
                                                <div style={{ fontWeight: 600 }}>{formatRupiah(trx.total)}</div>
                                                {trx.denda > 0 && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--error)' }}>
                                                        +{formatRupiah(trx.denda)} denda
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <StatusBadge status={trx.status} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <Button size="sm" variant="secondary" onClick={() => handleViewDetail(trx)}>
                                                        Detail
                                                    </Button>
                                                    {trx.status === 'menunggu_pembayaran' && (
                                                        <Button size="sm" onClick={() => handlePayNow(trx)}>
                                                            Bayar
                                                        </Button>
                                                    )}
                                                    {trx.status === 'sedang_disewa' && (
                                                        <Button size="sm" variant="secondary" onClick={() => handleReturn(trx)}>
                                                            Kembalikan
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedTrx}
                onClose={() => setSelectedTrx(null)}
                title={`Detail Transaksi ${selectedTrx?.kode}`}
                size="lg"
                footer={
                    <Button variant="secondary" onClick={() => setSelectedTrx(null)}>
                        Tutup
                    </Button>
                }
            >
                {selectedTrx && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Status & Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <StatusBadge status={selectedTrx.status} />
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Booking: {formatDate(selectedTrx.tanggalBooking)}
                            </div>
                        </div>

                        {/* Rental Period */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanggal Mulai</div>
                                <div style={{ fontWeight: 600 }}>{formatDate(selectedTrx.tanggalMulai)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanggal Selesai</div>
                                <div style={{ fontWeight: 600 }}>{formatDate(selectedTrx.tanggalSelesai)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Durasi</div>
                                <div style={{ fontWeight: 600 }}>{selectedTrx.totalHari} Hari</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lokasi</div>
                                <div style={{ fontWeight: 600 }}>Jl. Rental No. 123</div>
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                                BARANG DISEWA
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {getTransactionDetails(selectedTrx.id)
                                    .map(detail => {
                                        const barang = mockBarang.find(b => b.id === detail.barangId);
                                        const kategori = mockKategori.find(k => k.id === barang?.kategoriId);
                                        return (
                                            <div
                                                key={detail.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.75rem',
                                                    background: 'var(--bg-secondary)',
                                                    borderRadius: '0.5rem',
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-400)' }}>{kategori?.nama}</div>
                                                    <div style={{ fontWeight: 600 }}>{barang?.nama}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {detail.qty} unit × {formatRupiah(detail.hargaSewa)}/hari
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                                                    {formatRupiah(detail.subtotal)}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Total */}
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                <span>{formatRupiah(selectedTrx.subtotal)}</span>
                            </div>
                            {selectedTrx.diskon > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--success)' }}>Diskon</span>
                                    <span style={{ color: 'var(--success)' }}>-{formatRupiah(selectedTrx.diskon)}</span>
                                </div>
                            )}
                            {selectedTrx.denda > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--error)' }}>Denda</span>
                                    <span style={{ color: 'var(--error)' }}>+{formatRupiah(selectedTrx.denda)}</span>
                                </div>
                            )}
                            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem' }}>
                                <span>Total</span>
                                <span className="gradient-text">{formatRupiah(selectedTrx.total + selectedTrx.denda)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Modal */}
            <Modal
                isOpen={!!payingTrx}
                onClose={() => setPayingTrx(null)}
                title="Konfirmasi Pembayaran"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setPayingTrx(null)}>
                            Batal
                        </Button>
                        <Button onClick={confirmPayment} isLoading={isProcessing}>
                            Konfirmasi Bayar
                        </Button>
                    </>
                }
            >
                {payingTrx && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                Total Pembayaran
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700 }} className="gradient-text">
                                {formatRupiah(payingTrx.total)}
                            </div>
                        </div>

                        <div
                            style={{
                                padding: '1rem',
                                background: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: '0.75rem',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                            }}
                        >
                            <div style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, marginBottom: '0.5rem' }}>
                                💳 Bayar di Lokasi
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Pembayaran dilakukan langsung saat mengambil barang. Anda dapat membayar dengan cash, transfer, atau e-wallet.
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                <strong>Informasi Pengambilan:</strong>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                📍 Jl. Rental No. 123, Jakarta<br />
                                📅 {formatDate(payingTrx.tanggalMulai)}<br />
                                ⏰ 09:00 - 18:00 WIB
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Return Confirmation Modal */}
            <Modal
                isOpen={!!returningTrx}
                onClose={() => setReturningTrx(null)}
                title="Konfirmasi Pengembalian Barang"
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setReturningTrx(null)}>
                            Batal
                        </Button>
                        <Button onClick={confirmReturn} isLoading={isProcessing}>
                            Konfirmasi Kembalikan
                        </Button>
                    </>
                }
            >
                {returningTrx && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '60px', height: '60px', margin: '0 auto 1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-400)" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Kembalikan Barang Sewaan?</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Kode: {returningTrx.kode}
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Tanggal Sewa:</span><br />
                                    {formatDate(returningTrx.tanggalMulai)}
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Jatuh Tempo:</span><br />
                                    {formatDate(returningTrx.tanggalSelesai)}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '0.75rem', border: '1px solid var(--accent-400)' }}>
                            <div style={{ fontSize: '0.875rem' }}>
                                <strong>📍 Lokasi Pengembalian:</strong><br />
                                Jl. Rental No. 123, Jakarta<br />
                                ⏰ 09:00 - 18:00 WIB
                            </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Setelah konfirmasi, silakan bawa barang ke lokasi untuk inspeksi oleh petugas gudang.
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
