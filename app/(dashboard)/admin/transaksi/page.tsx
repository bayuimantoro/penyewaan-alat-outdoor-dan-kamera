'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatRupiah, formatDate } from '@/lib/utils';
import { useTransactions } from '@/lib/transaction-context';
import { useUsers } from '@/lib/user-context';
import { useBarang } from '@/lib/barang-context';
import { Transaksi, StatusTransaksi } from '@/types';

const statusOptions: { value: StatusTransaksi; label: string }[] = [
    { value: 'menunggu_pembayaran', label: 'Menunggu Pembayaran' },
    { value: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi' },
    { value: 'sedang_disewa', label: 'Sedang Disewa' },
    { value: 'menunggu_pengembalian', label: 'Menunggu Pengembalian' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
];

export default function TransaksiPage() {
    const { transactions, getTransactionDetails, updateTransactionStatus, deleteTransaction } = useTransactions();
    const { users } = useUsers();
    const { barang: barangList } = useBarang();
    const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTransactions = transactions.filter(trx => {
        const matchesStatus = filterStatus === 'all' || trx.status === filterStatus;
        const user = users.find(u => u.id === trx.userId);
        const matchesSearch = trx.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user?.nama.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleUpdateStatus = (newStatus: StatusTransaksi) => {
        if (selectedTrx) {
            updateTransactionStatus(selectedTrx.id, newStatus);
            setSelectedTrx({ ...selectedTrx, status: newStatus });
            alert(`Status transaksi ${selectedTrx.kode} berhasil diupdate!`);
        }
    };

    const handleDelete = (trx: Transaksi) => {
        if (confirm(`Yakin ingin menghapus transaksi ${trx.kode}? Data tidak dapat dikembalikan.`)) {
            deleteTransaction(trx.id);
            alert('Transaksi berhasil dihapus');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manajemen Transaksi</h1>
                <p className="page-subtitle">Kelola semua transaksi penyewaan</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total', value: transactions.length, color: 'var(--primary-400)' },
                    { label: 'Menunggu Bayar', value: transactions.filter(t => t.status === 'menunggu_pembayaran').length, color: 'var(--warning)' },
                    { label: 'Sedang Disewa', value: transactions.filter(t => t.status === 'sedang_disewa').length, color: 'var(--accent-400)' },
                    { label: 'Selesai', value: transactions.filter(t => t.status === 'selesai').length, color: 'var(--success)' },
                    { label: 'Dibatalkan', value: transactions.filter(t => t.status === 'dibatalkan').length, color: 'var(--error)' },
                ].map((stat, idx) => (
                    <Card key={idx} hover={false}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '1rem' }}>
                <Card hover={false}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                placeholder="Cari kode transaksi atau nama member..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input"
                            style={{ width: '200px' }}
                        >
                            <option value="all">Semua Status</option>
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </Card>
            </div>

            {/* Transaction Table */}
            <Card hover={false}>
                <CardTitle>Daftar Transaksi</CardTitle>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Kode</TableHeader>
                                <TableHeader>Member</TableHeader>
                                <TableHeader>Tanggal Sewa</TableHeader>
                                <TableHeader>Durasi</TableHeader>
                                <TableHeader align="right">Total</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTransactions.length === 0 ? (
                                <TableEmpty message="Tidak ada transaksi" />
                            ) : (
                                filteredTransactions.map(trx => {
                                    const user = users.find(u => u.id === trx.userId);
                                    return (
                                        <TableRow key={trx.id}>
                                            <TableCell>
                                                <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{trx.kode}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div>{user?.nama}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.noHp}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div>{formatDate(trx.tanggalMulai)}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>s/d {formatDate(trx.tanggalSelesai)}</div>
                                            </TableCell>
                                            <TableCell>{trx.totalHari} hari</TableCell>
                                            <TableCell align="right">
                                                <div style={{ fontWeight: 600 }}>{formatRupiah(trx.total)}</div>
                                                {trx.denda > 0 && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--error)' }}>+{formatRupiah(trx.denda)} denda</div>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <StatusBadge status={trx.status} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <Button size="sm" onClick={() => setSelectedTrx(trx)}>Detail</Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleDelete(trx)}>Hapus</Button>
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
            >
                {selectedTrx && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Member Info */}
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>INFORMASI MEMBER</h4>
                            {(() => {
                                const user = users.find(u => u.id === selectedTrx.userId);
                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                                        <div><span style={{ color: 'var(--text-muted)' }}>Nama:</span> {user?.nama}</div>
                                        <div><span style={{ color: 'var(--text-muted)' }}>No. HP:</span> {user?.noHp}</div>
                                        <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-muted)' }}>Email:</span> {user?.email}</div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Rental Period */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai</div>
                                <div style={{ fontWeight: 600 }}>{formatDate(selectedTrx.tanggalMulai)}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selesai</div>
                                <div style={{ fontWeight: 600 }}>{formatDate(selectedTrx.tanggalSelesai)}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Durasi</div>
                                <div style={{ fontWeight: 600 }}>{selectedTrx.totalHari} Hari</div>
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>BARANG DISEWA</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {getTransactionDetails(selectedTrx.id)
                                    .map(detail => {
                                        const barang = barangList.find(b => b.id === detail.barangId);
                                        return (
                                            <div key={detail.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{barang?.nama}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{detail.qty} unit × {formatRupiah(detail.hargaSewa)}/hari</div>
                                                </div>
                                                <div style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{formatRupiah(detail.subtotal)}</div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Total */}
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Subtotal</span><span>{formatRupiah(selectedTrx.subtotal)}</span>
                            </div>
                            {selectedTrx.diskon > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--success)' }}>
                                    <span>Diskon</span><span>-{formatRupiah(selectedTrx.diskon)}</span>
                                </div>
                            )}
                            {selectedTrx.denda > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--error)' }}>
                                    <span>Denda</span><span>+{formatRupiah(selectedTrx.denda)}</span>
                                </div>
                            )}
                            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem' }}>
                                <span>Total</span><span className="gradient-text">{formatRupiah(selectedTrx.total + selectedTrx.denda)}</span>
                            </div>
                        </div>

                        {/* Status Update */}
                        <div>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>UPDATE STATUS</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <StatusBadge status={selectedTrx.status} />
                                <span>→</span>
                                <select
                                    className="input"
                                    style={{ flex: 1 }}
                                    value={selectedTrx.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value as StatusTransaksi)}
                                >
                                    {statusOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
