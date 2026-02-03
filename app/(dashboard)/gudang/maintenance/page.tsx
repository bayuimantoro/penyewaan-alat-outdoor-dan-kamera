'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { mockKategori } from '@/lib/mock-data';
import { useBarang } from '@/lib/barang-context';
import { Barang, StatusBarang } from '@/types';

export default function MaintenancePage() {
    const { barang: barangList, updateBarangStatus } = useBarang();
    const [filterStatus, setFilterStatus] = useState<string>('maintenance');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
    const [newStatus, setNewStatus] = useState<StatusBarang>('tersedia');
    const [qtyToUpdate, setQtyToUpdate] = useState<number>(1);
    const [catatan, setCatatan] = useState('');

    const filteredBarang = barangList.filter(barang => {
        let matchesStatus = filterStatus === 'all';
        if (filterStatus === 'maintenance') matchesStatus = (barang.stokMaintenance || 0) > 0;
        else if (filterStatus === 'rusak') matchesStatus = (barang.stokRusak || 0) > 0;
        else if (filterStatus === 'tersedia') matchesStatus = barang.stok > 0;
        else if (filterStatus === 'disewa') matchesStatus = barang.status === 'disewa';

        const matchesSearch = barang.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            barang.kode.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Stats
    const maintenanceCount = barangList.reduce((sum, b) => sum + (b.stokMaintenance || 0), 0);
    const rusakCount = barangList.reduce((sum, b) => sum + (b.stokRusak || 0), 0);
    const tersediaCount = barangList.reduce((sum, b) => sum + b.stok, 0);

    const handleUpdateStatus = (barang: Barang) => {
        setSelectedBarang(barang);
        setNewStatus(barang.status);
        setQtyToUpdate(barang.stokMaintenance || 1); // Default to max available logic or just 1? Logic: default to ALL maintenance items for convenience? Let's default to 1 for safety.
        setCatatan('');
    };

    const confirmUpdate = async () => {
        if (!selectedBarang) return;

        let success = false;

        // Cek jika sedang memperbaiki (Maintenance -> Tersedia)
        // Kita anggap "Tersedia" di dropdown berarti memindahkan 1 unit dari Maintenance ke Tersedia
        if (newStatus === 'tersedia') {
            if ((selectedBarang.stokMaintenance || 0) <= 0) {
                alert("Tidak ada stok maintenance untuk diperbaiki!");
                return;
            }
            // Use 'repair' action we just added to API
            // We reuse updateStockCategory but we need to cheat a bit or add 'repair' to the type
            // Let's assume generic updateStock for now or just fetch directly here for simplicity
            try {
                const response = await fetch('/api/barang/stock', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedBarang.id, action: 'repair', qty: 1 })
                });
                const data = await response.json();
                if (data.success) {
                    alert("✅ 1 Unit berhasil diperbaiki & kembali ke stok tersedia!");
                    window.location.reload(); // Reload to refresh data cleanly
                } else {
                    alert("Gagal: " + data.message);
                }
            } catch (e) { alert("Error connecting to server"); }
            return;
        }

        // Fallback or other status changes
        success = await updateBarangStatus(selectedBarang.id, newStatus);

        if (success) {
            alert(`Status barang berhasil diupdate!`);
            window.location.reload();
        }
        setSelectedBarang(null);
        setCatatan('');
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Maintenance Barang</h1>
                <p className="page-subtitle">Kelola barang yang memerlukan perbaikan atau penggantian</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>{maintenanceCount}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sedang Maintenance</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--error)' }}>{rusakCount}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Barang Rusak</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>{tersediaCount}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tersedia</div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '1rem' }}>
                <Card hover={false}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                placeholder="Cari nama atau kode barang..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input"
                            style={{ width: '180px' }}
                        >
                            <option value="all">Semua Status</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="rusak">Rusak</option>
                            <option value="tersedia">Tersedia</option>
                            <option value="disewa">Disewa</option>
                        </select>
                    </div>
                </Card>
            </div>

            {/* Table */}
            <Card hover={false}>
                <CardTitle>Daftar Barang ({filteredBarang.length})</CardTitle>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Kode</TableHeader>
                                <TableHeader>Nama Barang</TableHeader>
                                <TableHeader>Kategori</TableHeader>
                                <TableHeader align="center">Stok</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBarang.length === 0 ? (
                                <TableEmpty message="Tidak ada barang ditemukan" />
                            ) : (
                                filteredBarang.map(barang => {
                                    const kategori = mockKategori.find(k => k.id === barang.kategoriId);
                                    return (
                                        <TableRow key={barang.id}>
                                            <TableCell>
                                                <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{barang.kode}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div style={{ fontWeight: 600 }}>{barang.nama}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{barang.merk}</div>
                                            </TableCell>
                                            <TableCell>{kategori?.nama || '-'}</TableCell>
                                            <TableCell align="center">
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.875rem' }}>Total: {barang.stok + (barang.stokMaintenance || 0) + (barang.stokRusak || 0)}</span>
                                                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                                        {(barang.stokMaintenance || 0) > 0 && (
                                                            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'var(--warning)', color: 'white', borderRadius: '4px' }}>
                                                                M: {barang.stokMaintenance}
                                                            </span>
                                                        )}
                                                        {(barang.stokRusak || 0) > 0 && (
                                                            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'var(--error)', color: 'white', borderRadius: '4px' }}>
                                                                R: {barang.stokRusak}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell align="center">
                                                {barang.stok > 0 ? (
                                                    <StatusBadge status="tersedia" />
                                                ) : (barang.stokMaintenance || 0) > 0 ? (
                                                    <StatusBadge status="maintenance" />
                                                ) : (
                                                    <StatusBadge status={barang.status} />
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(barang)}>
                                                    Update Status
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

            {/* Update Modal */}
            <Modal
                isOpen={!!selectedBarang}
                onClose={() => { setSelectedBarang(null); setCatatan(''); }}
                title="Update Status Barang"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setSelectedBarang(null); setCatatan(''); }}>Batal</Button>
                        <Button onClick={confirmUpdate}>Simpan Perubahan</Button>
                    </>
                }
            >
                {selectedBarang && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Item Info */}
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '60px', height: '60px', background: 'var(--bg-secondary)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-400)" strokeWidth="1.5">
                                        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{selectedBarang.nama}</div>
                                    <div style={{ color: 'var(--text-muted)' }}>{selectedBarang.kode} • {selectedBarang.merk}</div>
                                </div>
                            </div>
                        </div>

                        {/* Current Status */}
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status Saat Ini</div>
                            <StatusBadge status={selectedBarang.status} />
                        </div>

                        {/* New Status */}
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Ubah Status Ke:</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                {[
                                    { value: 'tersedia', label: 'Tersedia', color: 'var(--success)', desc: 'Siap disewakan' },
                                    { value: 'maintenance', label: 'Maintenance', color: 'var(--warning)', desc: 'Sedang diperbaiki' },
                                    { value: 'rusak', label: 'Rusak', color: 'var(--error)', desc: 'Tidak dapat digunakan' },
                                    { value: 'disewa', label: 'Disewa', color: 'var(--accent-400)', desc: 'Sedang disewa member' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setNewStatus(opt.value as StatusBarang)}
                                        style={{
                                            padding: '1rem',
                                            border: `2px solid ${newStatus === opt.value ? opt.color : 'var(--border-color)'}`,
                                            borderRadius: '0.75rem',
                                            background: newStatus === opt.value ? `${opt.color}15` : 'var(--bg-secondary)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, color: newStatus === opt.value ? opt.color : 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                            {opt.label}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Input */}
                        {(newStatus === 'tersedia' || newStatus === 'rusak') && (selectedBarang.stokMaintenance || 0) > 0 && (
                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Jumlah Barang {newStatus === 'tersedia' ? 'Diperbaiki' : 'Rusak Permanen'}:
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={selectedBarang.stokMaintenance}
                                        value={qtyToUpdate}
                                        onChange={(e) => setQtyToUpdate(Math.max(1, Math.min(parseInt(e.target.value) || 1, selectedBarang.stokMaintenance || 1)))}
                                        style={{ width: '100px' }}
                                    />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        dari {selectedBarang.stokMaintenance} unit maintenance
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Catatan (opsional):</div>
                            <textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                placeholder="Tambahkan catatan perubahan status..."
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
