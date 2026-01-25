'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatRupiah } from '@/lib/utils';
import { mockKategori } from '@/lib/mock-data';
import { useBarang } from '@/lib/barang-context';
import { Barang, StatusBarang } from '@/types';

const statusOptions: { value: StatusBarang; label: string }[] = [
    { value: 'tersedia', label: 'Tersedia' },
    { value: 'disewa', label: 'Disewa' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'rusak', label: 'Rusak' },
];

export default function DataBarangPage() {
    const { barang: barangList, addBarang, updateBarang, deleteBarang } = useBarang();
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [filterKategori, setFilterKategori] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        kode: '',
        nama: '',
        kategoriId: 1,
        merk: '',
        deskripsi: '',
        hargaSewa: 0,
        dendaPerHari: 0,
        stok: 0,
        status: 'tersedia' as StatusBarang,
    });

    const filteredBarang = barangList.filter(b => {
        const matchesKategori = filterKategori === 'all' || b.kategoriId === parseInt(filterKategori);
        const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
        const matchesSearch = b.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.kode.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesKategori && matchesStatus && matchesSearch;
    });

    const handleEdit = (barang: Barang) => {
        setFormData({
            kode: barang.kode,
            nama: barang.nama,
            kategoriId: barang.kategoriId || 1,
            merk: barang.merk || '',
            deskripsi: barang.deskripsi,
            hargaSewa: barang.hargaSewa || barang.hargaSewaPerHari || 0,
            dendaPerHari: barang.dendaPerHari || 0,
            stok: barang.stok,
            status: barang.status,
        });
        setSelectedBarang(barang);
        setIsEditing(true);
    };

    const handleAdd = () => {
        setFormData({
            kode: `NEW-${Date.now().toString().slice(-4)}`,
            nama: '',
            kategoriId: 1,
            merk: '',
            deskripsi: '',
            hargaSewa: 0,
            dendaPerHari: 0,
            stok: 1,
            status: 'tersedia',
        });
        setIsAdding(true);
    };

    const handleSave = () => {
        if (isEditing && selectedBarang) {
            updateBarang(selectedBarang.id, formData);
            setIsEditing(false);
            setSelectedBarang(null);
            alert('Barang berhasil diupdate!');
        } else if (isAdding) {
            const newBarang: Barang = {
                id: Math.max(...barangList.map(b => b.id), 0) + 1,
                ...formData,
                foto: [],
            };
            addBarang(newBarang);
            setIsAdding(false);
            alert('Barang berhasil ditambahkan!');
        }
    };

    const handleDelete = (barang: Barang) => {
        if (confirm(`Yakin ingin menghapus ${barang.nama}?`)) {
            deleteBarang(barang.id);
            alert('Barang berhasil dihapus!');
        }
    };

    // Stats by status
    const statsByStatus = {
        total: barangList.length,
        tersedia: barangList.filter(b => b.status === 'tersedia').length,
        disewa: barangList.filter(b => b.status === 'disewa').length,
        maintenance: barangList.filter(b => b.status === 'maintenance').length,
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Data Barang</h1>
                    <p className="page-subtitle">Kelola inventaris barang rental</p>
                </div>
                <Button onClick={handleAdd}>+ Tambah Barang</Button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Barang', value: statsByStatus.total, color: 'var(--primary-400)' },
                    { label: 'Tersedia', value: statsByStatus.tersedia, color: 'var(--success)' },
                    { label: 'Disewa', value: statsByStatus.disewa, color: 'var(--warning)' },
                    { label: 'Maintenance', value: statsByStatus.maintenance, color: 'var(--error)' },
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
                                placeholder="Cari nama atau kode barang..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            value={filterKategori}
                            onChange={(e) => setFilterKategori(e.target.value)}
                            className="input"
                            style={{ width: '180px' }}
                        >
                            <option value="all">Semua Kategori</option>
                            {mockKategori.map(k => (
                                <option key={k.id} value={k.id}>{k.nama}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input"
                            style={{ width: '150px' }}
                        >
                            <option value="all">Semua Status</option>
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </Card>
            </div>

            {/* Barang Table */}
            <Card hover={false}>
                <CardTitle>Daftar Barang ({filteredBarang.length})</CardTitle>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Kode</TableHeader>
                                <TableHeader>Nama</TableHeader>
                                <TableHeader>Kategori</TableHeader>
                                <TableHeader align="right">Harga/Hari</TableHeader>
                                <TableHeader align="center">Stok</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBarang.length === 0 ? (
                                <TableEmpty message="Tidak ada barang" />
                            ) : (
                                filteredBarang.map(barang => {
                                    const kategori = mockKategori.find(k => k.id === barang.kategoriId);
                                    return (
                                        <TableRow key={barang.id}>
                                            <TableCell>
                                                <span style={{ fontWeight: 600, color: 'var(--accent-400)' }}>{barang.kode}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div style={{ fontWeight: 600 }}>{barang.nama}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {barang.deskripsi}
                                                </div>
                                            </TableCell>
                                            <TableCell>{kategori?.nama}</TableCell>
                                            <TableCell align="right">
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{formatRupiah(barang.hargaSewa || barang.hargaSewaPerHari || 0)}</span>/hari
                                                </div>
                                            </TableCell>
                                            <TableCell align="center">{barang.stok} unit</TableCell>
                                            <TableCell align="center">
                                                <StatusBadge status={barang.status} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <Button size="sm" variant="secondary" onClick={() => handleEdit(barang)}>Edit</Button>
                                                    <Button size="sm" variant="secondary" onClick={() => handleDelete(barang)} style={{ color: 'var(--error)' }}>Hapus</Button>
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

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isEditing || isAdding}
                onClose={() => { setIsEditing(false); setIsAdding(false); setSelectedBarang(null); }}
                title={isEditing ? 'Edit Barang' : 'Tambah Barang Baru'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setIsEditing(false); setIsAdding(false); }}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Kode Barang"
                            value={formData.kode}
                            onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                        />
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Kategori</label>
                            <select
                                className="input"
                                value={formData.kategoriId}
                                onChange={(e) => setFormData({ ...formData, kategoriId: parseInt(e.target.value) })}
                                style={{ width: '100%' }}
                            >
                                {mockKategori.map(k => (
                                    <option key={k.id} value={k.id}>{k.nama}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Nama Barang"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        />
                        <Input
                            label="Merk"
                            value={formData.merk}
                            onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Deskripsi</label>
                        <textarea
                            className="input"
                            value={formData.deskripsi}
                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                            rows={3}
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Harga Sewa/Hari"
                            type="number"
                            value={formData.hargaSewa}
                            onChange={(e) => setFormData({ ...formData, hargaSewa: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                            label="Denda/Hari"
                            type="number"
                            value={formData.dendaPerHari}
                            onChange={(e) => setFormData({ ...formData, dendaPerHari: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                            label="Stok"
                            type="number"
                            value={formData.stok}
                            onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })}
                        />
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Status</label>
                            <select
                                className="input"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusBarang })}
                                style={{ width: '100%' }}
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
