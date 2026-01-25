'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { useTransactions } from '@/lib/transaction-context';
import { useBarang } from '@/lib/barang-context';
import { useUsers } from '@/lib/user-context';
import { Transaksi } from '@/types';

export default function CheckoutPage() {
    const { transactions, getTransactionDetails, updateTransactionStatus } = useTransactions();
    const { getBarangById, processCheckout, processReturn } = useBarang();
    const { users } = useUsers();
    const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null);
    const [actionType, setActionType] = useState<'serahkan' | 'terima' | null>(null);
    const [activeTab, setActiveTab] = useState<'serahkan' | 'terima'>('serahkan');

    // Filter transactions
    const pendingCheckout = transactions.filter(t => t.status === 'menunggu_konfirmasi');
    const pendingReturn = transactions.filter(t => t.status === 'menunggu_pengembalian');

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
            // Auto-decrease stock
            processCheckout(details);
            alert(`Barang untuk transaksi ${selectedTrx.kode} telah diserahkan ke member!\nStok barang otomatis berkurang.`);
        } else {
            // Update transaction status
            updateTransactionStatus(selectedTrx.id, 'selesai');
            // Auto-increase stock
            processReturn(details);
            alert(`Barang untuk transaksi ${selectedTrx.kode} telah diterima kembali!\nStok barang otomatis bertambah.`);
        }

        setSelectedTrx(null);
        setActionType(null);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Serah Terima Barang</h1>
                <p className="page-subtitle">Kelola penyerahan dan penerimaan barang sewa</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-400)' }}>{pendingCheckout.length}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Menunggu Diserahkan</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>{pendingReturn.length}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Menunggu Dikembalikan</div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <Button
                    variant={activeTab === 'serahkan' ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab('serahkan')}
                >
                    Penyerahan ({pendingCheckout.length})
                </Button>
                <Button
                    variant={activeTab === 'terima' ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab('terima')}
                >
                    Penerimaan ({pendingReturn.length})
                </Button>
            </div>

            {/* Content */}
            <Card hover={false}>
                <CardTitle>
                    {activeTab === 'serahkan' ? 'Barang Menunggu Diserahkan' : 'Barang Menunggu Dikembalikan'}
                </CardTitle>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Kode Transaksi</TableHeader>
                                <TableHeader>Member</TableHeader>
                                <TableHeader>Barang</TableHeader>
                                <TableHeader>{activeTab === 'serahkan' ? 'Tanggal Ambil' : 'Jatuh Tempo'}</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(activeTab === 'serahkan' ? pendingCheckout : pendingReturn).length === 0 ? (
                                <TableEmpty message={`Tidak ada barang ${activeTab === 'serahkan' ? 'menunggu diserahkan' : 'menunggu dikembalikan'}`} />
                            ) : (
                                (activeTab === 'serahkan' ? pendingCheckout : pendingReturn).map(trx => {
                                    const member = users.find(u => u.id === trx.userId);
                                    const details = getTransactionDetails(trx.id);
                                    const barangNames = details.map(d => getBarangById(d.barangId)?.nama).filter(Boolean).join(', ');
                                    const isOverdue = activeTab === 'terima' && new Date() > new Date(trx.tanggalSelesai);

                                    return (
                                        <TableRow key={trx.id}>
                                            <TableCell>
                                                <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{trx.kode}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div style={{ fontWeight: 600 }}>{member?.nama}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member?.noHp}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div style={{ maxWidth: '200px' }}>
                                                    {barangNames.length > 40 ? barangNames.substring(0, 40) + '...' : barangNames || '-'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{details.length} item</div>
                                            </TableCell>
                                            <TableCell>
                                                <span style={{ color: isOverdue ? 'var(--error)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                                                    {formatDate(activeTab === 'serahkan' ? trx.tanggalMulai : trx.tanggalSelesai)}
                                                    {isOverdue && ' (Terlambat!)'}
                                                </span>
                                            </TableCell>
                                            <TableCell align="center">
                                                <StatusBadge status={trx.status} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="sm"
                                                    onClick={() => activeTab === 'serahkan' ? handleSerahkan(trx) : handleTerima(trx)}
                                                >
                                                    {activeTab === 'serahkan' ? 'Serahkan' : 'Terima'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Confirmation Modal */}
            <Modal
                isOpen={!!selectedTrx && !!actionType}
                onClose={() => { setSelectedTrx(null); setActionType(null); }}
                title={actionType === 'serahkan' ? 'Konfirmasi Penyerahan Barang' : 'Konfirmasi Penerimaan Barang'}
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kode Transaksi</div>
                                    <div style={{ fontWeight: 600 }}>{selectedTrx.kode}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member</div>
                                    <div style={{ fontWeight: 600 }}>{users.find(u => u.id === selectedTrx.userId)?.nama}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanggal Mulai</div>
                                    <div>{formatDate(selectedTrx.tanggalMulai)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanggal Selesai</div>
                                    <div>{formatDate(selectedTrx.tanggalSelesai)}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Daftar Barang:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {getTransactionDetails(selectedTrx.id).map(detail => {
                                    const barang = getBarangById(detail.barangId);
                                    return (
                                        <div key={detail.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{barang?.nama}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{barang?.kode} • Stok saat ini: {barang?.stok}</div>
                                            </div>
                                            <div style={{ fontWeight: 600 }}>× {detail.qty}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ padding: '1rem', background: actionType === 'serahkan' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(34, 197, 94, 0.1)', borderRadius: '0.75rem', border: `1px solid ${actionType === 'serahkan' ? 'var(--accent-400)' : 'var(--success)'}` }}>
                            <p style={{ fontSize: '0.875rem', margin: 0 }}>
                                {actionType === 'serahkan'
                                    ? '📦 Stok barang akan otomatis berkurang setelah diserahkan.'
                                    : '📦 Stok barang akan otomatis bertambah setelah diterima kembali.'}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
