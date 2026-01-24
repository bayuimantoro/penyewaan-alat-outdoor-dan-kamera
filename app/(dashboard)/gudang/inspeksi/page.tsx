'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatRupiah } from '@/lib/utils';
import { useTransactions } from '@/lib/transaction-context';
import { useBarang } from '@/lib/barang-context';
import { useAuth } from '@/lib/auth-context';
import { Transaksi, StatusBarang } from '@/types';

type KondisiBarang = 'baik' | 'rusak_ringan' | 'rusak_berat';

export default function InspeksiPage() {
    const { transactions, getTransactionDetails, updateTransactionStatus } = useTransactions();
    const { getBarangById, processReturn, updateBarangStatus } = useBarang();
    const { registeredUsers } = useAuth();
    const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null);
    const [inspeksiData, setInspeksiData] = useState<Record<number, KondisiBarang>>({});
    const [catatan, setCatatan] = useState('');

    // Get transactions pending return OR active rentals due today/past due
    const today = new Date().toISOString().split('T')[0];
    const pendingReturn = transactions.filter(t =>
        t.status === 'menunggu_pengembalian' ||
        (t.status === 'sedang_disewa' && t.tanggalSelesai <= today)
    );

    const handleInspeksi = (trx: Transaksi) => {
        setSelectedTrx(trx);
        // Initialize inspection data
        const details = getTransactionDetails(trx.id);
        const initialData: Record<number, KondisiBarang> = {};
        details.forEach(d => {
            initialData[d.barangId] = 'baik';
        });
        setInspeksiData(initialData);
        setCatatan('');
    };

    const handleKondisiChange = (barangId: number, kondisi: KondisiBarang) => {
        setInspeksiData(prev => ({ ...prev, [barangId]: kondisi }));
    };

    const calculateDenda = () => {
        if (!selectedTrx) return 0;

        const today = new Date();
        const endDate = new Date(selectedTrx.tanggalSelesai);

        // Reset time to ensure date-only comparison
        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - endDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 0;

        // Calculate late fee based on items
        const details = getTransactionDetails(selectedTrx.id);
        let totalDenda = 0;
        details.forEach(d => {
            const barang = getBarangById(d.barangId);
            if (barang) {
                totalDenda += barang.dendaPerHari * d.qty * diffDays;
            }
        });

        return totalDenda;
    };

    const submitInspeksi = () => {
        if (!selectedTrx) return;

        const details = getTransactionDetails(selectedTrx.id);

        // Update transaction status to completed
        updateTransactionStatus(selectedTrx.id, 'selesai');

        // Auto-return stock for each item
        processReturn(details);

        // Check each item's condition and update status if damaged
        details.forEach(detail => {
            const kondisi = inspeksiData[detail.barangId];
            if (kondisi === 'rusak_berat') {
                // Mark as rusak
                updateBarangStatus(detail.barangId, 'rusak');
            } else if (kondisi === 'rusak_ringan') {
                // Mark for maintenance
                updateBarangStatus(detail.barangId, 'maintenance');
            }
            // If 'baik', status will already be 'tersedia' from processReturn
        });

        const denda = calculateDenda();
        const hasDamage = Object.values(inspeksiData).some(k => k !== 'baik');

        let message = `✅ Inspeksi selesai untuk transaksi ${selectedTrx.kode}.\n`;
        message += `📦 Stok barang otomatis dikembalikan.\n`;

        if (denda > 0) {
            message += `\n💰 Denda keterlambatan: ${formatRupiah(denda)}\n`;
        }
        if (hasDamage) {
            message += `\n⚠️ Barang rusak otomatis diubah statusnya ke maintenance/rusak.`;
        }

        alert(message);
        setSelectedTrx(null);
        setInspeksiData({});
        setCatatan('');
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Inspeksi Pengembalian</h1>
                <p className="page-subtitle">Periksa kondisi barang yang dikembalikan member</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>{pendingReturn.length}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Perlu Inspeksi</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--error)' }}>
                            {pendingReturn.filter(t => today > t.tanggalSelesai).length}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Terlambat</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>
                            {transactions.filter(t => t.status === 'selesai').length}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Selesai Hari Ini</div>
                    </div>
                </Card>
            </div>

            {/* Table */}
            <Card hover={false}>
                <CardTitle>Barang Menunggu Inspeksi</CardTitle>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Kode Transaksi</TableHeader>
                                <TableHeader>Member</TableHeader>
                                <TableHeader>Barang</TableHeader>
                                <TableHeader>Jatuh Tempo</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingReturn.length === 0 ? (
                                <TableEmpty message="Tidak ada barang menunggu inspeksi" />
                            ) : (
                                pendingReturn.map(trx => {
                                    const member = registeredUsers.find(u => u.id === trx.userId);
                                    const details = getTransactionDetails(trx.id);
                                    const barangNames = details.map(d => getBarangById(d.barangId)?.nama).filter(Boolean).join(', ');
                                    const isOverdue = today > trx.tanggalSelesai;
                                    const diffDays = Math.floor((new Date().getTime() - new Date(trx.tanggalSelesai).getTime()) / (1000 * 60 * 60 * 24));

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
                                                <div style={{ color: isOverdue ? 'var(--error)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                                                    {formatDate(trx.tanggalSelesai)}
                                                </div>
                                                {isOverdue && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--error)' }}>
                                                        Terlambat {diffDays} hari
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                {isOverdue ? (
                                                    <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                        Terlambat
                                                    </span>
                                                ) : (
                                                    <StatusBadge status={trx.status} />
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button size="sm" onClick={() => handleInspeksi(trx)}>Inspeksi</Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Inspeksi Modal */}
            <Modal
                isOpen={!!selectedTrx}
                onClose={() => { setSelectedTrx(null); setInspeksiData({}); setCatatan(''); }}
                title={`Inspeksi ${selectedTrx?.kode}`}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setSelectedTrx(null); setInspeksiData({}); setCatatan(''); }}>Batal</Button>
                        <Button onClick={submitInspeksi}>Selesai & Terima Barang</Button>
                    </>
                }
            >
                {selectedTrx && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Member Info */}
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <div><span style={{ color: 'var(--text-muted)' }}>Member:</span> {registeredUsers.find(u => u.id === selectedTrx.userId)?.nama}</div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Periode:</span> {formatDate(selectedTrx.tanggalMulai)} - {formatDate(selectedTrx.tanggalSelesai)}</div>
                            </div>
                        </div>

                        {/* Denda Alert */}
                        {calculateDenda() > 0 && (
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', border: '1px solid var(--error)' }}>
                                <div style={{ fontWeight: 600, color: 'var(--error)', marginBottom: '0.25rem' }}>⚠️ Denda Keterlambatan</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--error)' }}>{formatRupiah(calculateDenda())}</div>
                            </div>
                        )}

                        {/* Item Inspection */}
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Kondisi Barang:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {getTransactionDetails(selectedTrx.id).map(detail => {
                                    const barang = getBarangById(detail.barangId);
                                    return (
                                        <div key={detail.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{barang?.nama}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{barang?.kode} × {detail.qty}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {[
                                                    { value: 'baik', label: 'Baik ✓', color: 'var(--success)' },
                                                    { value: 'rusak_ringan', label: 'Rusak Ringan → Maintenance', color: 'var(--warning)' },
                                                    { value: 'rusak_berat', label: 'Rusak Berat → Rusak', color: 'var(--error)' },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => handleKondisiChange(detail.barangId, opt.value as KondisiBarang)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            border: `2px solid ${inspeksiData[detail.barangId] === opt.value ? opt.color : 'var(--border-color)'}`,
                                                            borderRadius: '0.5rem',
                                                            background: inspeksiData[detail.barangId] === opt.value ? `${opt.color}20` : 'transparent',
                                                            color: inspeksiData[detail.barangId] === opt.value ? opt.color : 'var(--text-primary)',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Auto Stock Info */}
                        <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '0.75rem', border: '1px solid var(--success)' }}>
                            <p style={{ fontSize: '0.875rem', margin: 0 }}>
                                📦 Stok barang akan otomatis dikembalikan.<br />
                                ⚠️ Barang rusak akan otomatis diubah statusnya.
                            </p>
                        </div>

                        {/* Notes */}
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Catatan (opsional):</div>
                            <textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                placeholder="Tambahkan catatan inspeksi..."
                                className="input"
                                style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
