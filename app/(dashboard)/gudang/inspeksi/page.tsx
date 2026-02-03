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
import { useUsers } from '@/lib/user-context';
import { Transaksi, StatusBarang } from '@/types';

type KondisiBarang = 'baik' | 'rusak_ringan' | 'rusak_berat';

// New type for split inspection
type SplitInspeksi = {
    [barangId: number]: {
        baik: number;
        rusak_ringan: number;
        rusak_berat: number;
    }
};

export default function InspeksiPage() {
    const { transactions, getTransactionDetails, updateTransactionStatus } = useTransactions();
    const { getBarangById, processReturn, updateBarangStatus, increaseStock, updateStockCategory } = useBarang();
    const { users } = useUsers();
    const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null);
    const [catatan, setCatatan] = useState('');
    const [manualDenda, setManualDenda] = useState<string>('');
    const [splitInspeksiData, setSplitInspeksiData] = useState<SplitInspeksi>({});

    // Get transactions pending return OR active rentals due today/past due
    // Use local date (not UTC) to avoid timezone issues
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const pendingReturn = transactions.filter(t =>
        t.status === 'menunggu_pengembalian' ||
        (t.status === 'sedang_disewa' && t.tanggalSelesai <= today)
    );

    const handleInspeksi = (trx: Transaksi) => {
        setSelectedTrx(trx);
        // Initialize split inspection data with all items as "baik" initially
        const details = getTransactionDetails(trx.id);
        const initialData: SplitInspeksi = {};

        details.forEach(d => {
            initialData[d.barangId] = {
                baik: d.qty, // Default all to good
                rusak_ringan: 0,
                rusak_berat: 0
            };
        });

        setSplitInspeksiData(initialData);
        setCatatan('');
        setManualDenda('');
    };

    const handleQtyChange = (barangId: number, type: keyof SplitInspeksi[number], value: number, maxQty: number) => {
        setSplitInspeksiData(prev => {
            const current = prev[barangId];
            const newValue = Math.max(0, value); // No negative values

            // Calculate total excluding current field being changed
            const otherFieldsTotal = Object.entries(current)
                .filter(([key]) => key !== type)
                .reduce((sum, [_, val]) => sum + val, 0);

            // Validation: Total cannot exceed max quantity
            if (newValue + otherFieldsTotal > maxQty) {
                return prev; // Ignore invalid change
            }

            return {
                ...prev,
                [barangId]: {
                    ...current,
                    [type]: newValue
                }
            };
        });
    };

    const calculateLateFee = () => {
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
                totalDenda += (barang.dendaPerHari ?? 0) * d.qty * diffDays;
            }
        });

        return totalDenda;
    };

    const submitInspeksi = async () => {
        if (!selectedTrx) return;

        const details = getTransactionDetails(selectedTrx.id);

        const lateFee = calculateLateFee();
        const damageFee = Number(manualDenda) || 0;
        const totalDenda = lateFee + damageFee;

        // 1. Update transaction status
        updateTransactionStatus(selectedTrx.id, 'selesai', totalDenda);

        // 2. Process Stock Returns based on Condition
        for (const detail of details) {
            const inspection = splitInspeksiData[detail.barangId];

            // Only increase stock for "baik" items (Return to Available)
            if (inspection.baik > 0) {
                await increaseStock(detail.barangId, inspection.baik);
            }

            // Move damaged items to specific stock buckets
            if (inspection.rusak_ringan > 0) {
                await updateStockCategory(detail.barangId, 'maintenance', inspection.rusak_ringan);
            }
            if (inspection.rusak_berat > 0) {
                await updateStockCategory(detail.barangId, 'rusak', inspection.rusak_berat);
            }
        }

        const hasDamage = Object.values(splitInspeksiData).some(item =>
            item.rusak_ringan > 0 || item.rusak_berat > 0
        );

        let message = `✅ Inspeksi selesai untuk transaksi ${selectedTrx.kode}.\n`;
        message += `📦 Stok BAIK kembali ke tersedia.\n`;

        if (hasDamage) {
            const maintenanceCount = Object.values(splitInspeksiData).reduce((a, b) => a + b.rusak_ringan, 0);
            const rusakCount = Object.values(splitInspeksiData).reduce((a, b) => a + b.rusak_berat, 0);

            if (maintenanceCount > 0) message += `🔧 ${maintenanceCount} item masuk Maintenance.\n`;
            if (rusakCount > 0) message += `❌ ${rusakCount} item masuk Stok Rusak.\n`;
        }

        if (totalDenda > 0) {
            message += `\n💰 Total Denda: ${formatRupiah(totalDenda)}\n`;
            if (lateFee > 0) message += `   - Keterlambatan: ${formatRupiah(lateFee)}\n`;
            if (damageFee > 0) message += `   - Kerusakan/Lainnya: ${formatRupiah(damageFee)}\n`;
        }

        alert(message);
        setSelectedTrx(null);
        setSplitInspeksiData({});
        setCatatan('');
        setManualDenda('');
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
                                    const member = users.find(u => u.id === trx.userId);
                                    const details = getTransactionDetails(trx.id);
                                    const barangNames = details.map(d => getBarangById(d.barangId)?.nama).filter(Boolean).join(', ');
                                    // Robust overdue check: Compare DATES only, ignoring time and timezone shifts
                                    const checkOverdue = (dateStr: string) => {
                                        // Ensure we parse "YYYY-MM-DD" as local date, avoiding UTC conversion shifts
                                        const parts = dateStr.split('-').map(Number);
                                        const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);

                                        const now = new Date();
                                        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                                        return todayDate.getTime() > dueDate.getTime();
                                    };

                                    const isOverdue = checkOverdue(trx.tanggalSelesai);

                                    // Calculate diff days for display
                                    const getDiffDays = (dateStr: string) => {
                                        const due = new Date(dateStr);
                                        const now = new Date();
                                        const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());
                                        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                        const diffTime = todayDate.getTime() - dueDate.getTime();
                                        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                    };

                                    const diffDays = getDiffDays(trx.tanggalSelesai);

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
                onClose={() => { setSelectedTrx(null); setSplitInspeksiData({}); setCatatan(''); setManualDenda(''); }}
                title={`Inspeksi ${selectedTrx?.kode}`}
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setSelectedTrx(null); setSplitInspeksiData({}); setCatatan(''); setManualDenda(''); }}>Batal</Button>
                        <Button onClick={submitInspeksi}>Selesai & Terima Barang</Button>
                    </>
                }
            >
                {selectedTrx && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Member Info */}
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <div><span style={{ color: 'var(--text-muted)' }}>Member:</span> {users.find(u => u.id === selectedTrx.userId)?.nama}</div>
                                <div><span style={{ color: 'var(--text-muted)' }}>Periode:</span> {formatDate(selectedTrx.tanggalMulai)} - {formatDate(selectedTrx.tanggalSelesai)}</div>
                            </div>
                        </div>

                        {/* Denda Alert */}
                        {calculateLateFee() > 0 && (
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', border: '1px solid var(--error)' }}>
                                <div style={{ fontWeight: 600, color: 'var(--error)', marginBottom: '0.25rem' }}>⚠️ Denda Keterlambatan</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--error)' }}>{formatRupiah(calculateLateFee())}</div>
                            </div>
                        )}

                        {/* Damage Fee Input */}
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Biaya Ganti Rugi / Denda Lainnya:</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Rp</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={manualDenda}
                                    onChange={(e) => setManualDenda(e.target.value)}
                                    placeholder="0"
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'var(--text-primary)',
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Masukkan nominal jika ada kerusakan atau biaya tambahan.
                            </p>
                        </div>

                        {/* Item Inspection */}
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Detail Kondisi Barang:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {getTransactionDetails(selectedTrx.id).map(detail => {
                                    const barang = getBarangById(detail.barangId);
                                    const current = splitInspeksiData[detail.barangId] || { baik: detail.qty, rusak_ringan: 0, rusak_berat: 0 };

                                    return (
                                        <div key={detail.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{barang?.nama}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        Kode: {barang?.kode} • Total Sewa: <strong>{detail.qty} unit</strong>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--bg-tertiary)', borderRadius: '0.25rem' }}>
                                                    Sisa alokasi: {detail.qty - (current.baik + current.rusak_ringan + current.rusak_berat)}
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                                {/* BAIK */}
                                                <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', display: 'block', marginBottom: '0.5rem' }}>
                                                        Baik / Normal
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={detail.qty}
                                                        value={current.baik}
                                                        onChange={(e) => handleQtyChange(detail.barangId, 'baik', parseInt(e.target.value) || 0, detail.qty)}
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 600 }}
                                                    />
                                                </div>

                                                {/* RUSAK RINGAN */}
                                                <div style={{ background: 'rgba(234, 179, 8, 0.05)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', display: 'block', marginBottom: '0.5rem' }}>
                                                        Rusak Ringan
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={detail.qty}
                                                        value={current.rusak_ringan}
                                                        onChange={(e) => handleQtyChange(detail.barangId, 'rusak_ringan', parseInt(e.target.value) || 0, detail.qty)}
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 600 }}
                                                    />
                                                </div>

                                                {/* RUSAK BERAT */}
                                                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--error)', display: 'block', marginBottom: '0.5rem' }}>
                                                        Rusak Berat
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={detail.qty}
                                                        value={current.rusak_berat}
                                                        onChange={(e) => handleQtyChange(detail.barangId, 'rusak_berat', parseInt(e.target.value) || 0, detail.qty)}
                                                        style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 600 }}
                                                    />
                                                </div>
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
