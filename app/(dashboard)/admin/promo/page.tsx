'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate, formatRupiah } from '@/lib/utils';
import { usePromos } from '@/lib/promo-context';
import { Promo } from '@/types';

export default function PromoPage() {
    const { promos, addPromo, updatePromo, togglePromoStatus, deletePromo } = usePromos();
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);

    const [formData, setFormData] = useState({
        kode: '',
        nama: '',
        deskripsi: '',
        tipeDiskon: 'persentase' as 'persentase' | 'nominal',
        nilaiDiskon: 0,
        minTransaksi: 0,
        maxDiskon: 0,
        tanggalMulai: '',
        tanggalSelesai: '',
        status: 'aktif' as 'aktif' | 'nonaktif',
    });

    const handleAdd = () => {
        setFormData({
            kode: '',
            nama: '',
            deskripsi: '',
            tipeDiskon: 'persentase',
            nilaiDiskon: 0,
            minTransaksi: 0,
            maxDiskon: 0,
            tanggalMulai: new Date().toISOString().split('T')[0],
            tanggalSelesai: '',
            status: 'aktif',
        });
        setIsAdding(true);
    };

    const handleEdit = (promo: Promo) => {
        setFormData({
            kode: promo.kode,
            nama: promo.nama,
            deskripsi: promo.deskripsi,
            tipeDiskon: promo.tipeDiskon,
            nilaiDiskon: promo.nilaiDiskon,
            minTransaksi: promo.minTransaksi,
            maxDiskon: promo.maxDiskon || 0,
            tanggalMulai: promo.tanggalMulai,
            tanggalSelesai: promo.tanggalSelesai,
            status: promo.status,
        });
        setSelectedPromo(promo);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (isEditing && selectedPromo) {
            updatePromo(selectedPromo.id, formData);
            setIsEditing(false);
            setSelectedPromo(null);
            alert('Promo berhasil diupdate!');
        } else if (isAdding) {
            const newPromo: Promo = {
                id: Math.max(...promos.map(p => p.id), 0) + 1,
                ...formData,
                createdAt: new Date().toISOString(),
            };
            addPromo(newPromo);
            setIsAdding(false);
            alert('Promo berhasil ditambahkan!');
        }
    };

    const handleToggleActive = (promo: Promo) => {
        togglePromoStatus(promo.id);
    };

    const handleDelete = (promo: Promo) => {
        if (confirm(`Yakin ingin menghapus promo "${promo.nama}"?`)) {
            deletePromo(promo.id);
            alert('Promo berhasil dihapus!');
        }
    };

    const activePromos = promos.filter(p => p.status === 'aktif').length;
    const inactivePromos = promos.filter(p => p.status === 'nonaktif').length;

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Manajemen Promo</h1>
                    <p className="page-subtitle">Kelola kode promo dan diskon</p>
                </div>
                <Button onClick={handleAdd}>+ Tambah Promo</Button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-400)' }}>{promos.length}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Promo</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{activePromos}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aktif</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-muted)' }}>{inactivePromos}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nonaktif</div>
                    </div>
                </Card>
            </div>

            {/* Promo Table */}
            <Card hover={false}>
                <CardTitle>Daftar Promo</CardTitle>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Nama Promo</TableHeader>
                                <TableHeader>Kode</TableHeader>
                                <TableHeader align="center">Diskon</TableHeader>
                                <TableHeader>Periode</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {promos.length === 0 ? (
                                <TableEmpty message="Belum ada promo" />
                            ) : (
                                promos.map(promo => (
                                    <TableRow key={promo.id}>
                                        <TableCell>
                                            <div style={{ fontWeight: 600 }}>{promo.nama}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{promo.deskripsi}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: 'var(--bg-tertiary)',
                                                    borderRadius: '0.5rem',
                                                    fontFamily: 'monospace',
                                                    fontWeight: 600,
                                                    color: 'var(--accent-400)',
                                                }}
                                            >
                                                {promo.kode}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center">
                                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                                                {promo.tipeDiskon === 'persentase' ? `${promo.nilaiDiskon}%` : formatRupiah(promo.nilaiDiskon)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div>{formatDate(promo.tanggalMulai)}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                s/d {formatDate(promo.tanggalSelesai)}
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <button
                                                onClick={() => handleToggleActive(promo)}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '9999px',
                                                    border: 'none',
                                                    background: promo.status === 'aktif' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                                                    color: promo.status === 'aktif' ? 'var(--success)' : 'var(--text-muted)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {promo.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </TableCell>
                                        <TableCell align="center">
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <Button size="sm" variant="secondary" onClick={() => handleEdit(promo)}>Edit</Button>
                                                <Button size="sm" variant="secondary" onClick={() => handleDelete(promo)} style={{ color: 'var(--error)' }}>Hapus</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isAdding || isEditing}
                onClose={() => { setIsAdding(false); setIsEditing(false); setSelectedPromo(null); }}
                title={isEditing ? 'Edit Promo' : 'Tambah Promo Baru'}
                size="md"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => { setIsAdding(false); setIsEditing(false); }}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                        label="Nama Promo"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Contoh: Diskon Tahun Baru"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="Kode Promo"
                            value={formData.kode}
                            onChange={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                            placeholder="Contoh: NEWYEAR2026"
                        />
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Tipe Diskon</label>
                            <select
                                className="input"
                                value={formData.tipeDiskon}
                                onChange={(e) => setFormData({ ...formData, tipeDiskon: e.target.value as 'persentase' | 'nominal' })}
                                style={{ width: '100%' }}
                            >
                                <option value="persentase">Persentase (%)</option>
                                <option value="nominal">Nominal (Rp)</option>
                            </select>
                        </div>
                    </div>
                    <Input
                        label="Deskripsi"
                        value={formData.deskripsi}
                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                        placeholder="Contoh: Diskon 10% untuk member baru"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <Input
                            label={formData.tipeDiskon === 'persentase' ? 'Nilai Diskon (%)' : 'Nilai Diskon (Rp)'}
                            type="number"
                            value={formData.nilaiDiskon}
                            onChange={(e) => setFormData({ ...formData, nilaiDiskon: parseInt(e.target.value) || 0 })}
                        />
                        <Input
                            label="Min. Transaksi (Rp)"
                            type="number"
                            value={formData.minTransaksi}
                            onChange={(e) => setFormData({ ...formData, minTransaksi: parseInt(e.target.value) || 0 })}
                        />
                        {formData.tipeDiskon === 'persentase' && (
                            <Input
                                label="Max Diskon (Rp)"
                                type="number"
                                value={formData.maxDiskon}
                                onChange={(e) => setFormData({ ...formData, maxDiskon: parseInt(e.target.value) || 0 })}
                            />
                        )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Tanggal Mulai</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.tanggalMulai}
                                onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Tanggal Selesai</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.tanggalSelesai}
                                onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.status === 'aktif'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'aktif' : 'nonaktif' })}
                            />
                            <span>Aktifkan promo</span>
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
