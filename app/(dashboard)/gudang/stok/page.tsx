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
import { Barang } from '@/types';

export default function StokBarangPage() {
    const { barang: barangList } = useBarang();
    const [filterKategori, setFilterKategori] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);

    const filteredBarang = barangList.filter(barang => {
        const matchesKategori = filterKategori === 'all' || barang.kategoriId === parseInt(filterKategori);
        const matchesStatus = filterStatus === 'all' || barang.status === filterStatus;
        const matchesSearch = barang.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
            barang.kode.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesKategori && matchesStatus && matchesSearch;
    });

    // Stats from context (real-time)
    const totalBarang = barangList.length;
    const tersedia = barangList.filter(b => b.status === 'tersedia').length;
    const disewa = barangList.filter(b => b.status === 'disewa').length;
    const maintenance = barangList.filter(b => b.status === 'maintenance' || b.status === 'rusak').length;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Stok Barang</h1>
                <p className="page-subtitle">Kelola dan pantau stok barang gudang</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Barang', value: totalBarang, color: 'var(--primary-400)' },
                    { label: 'Tersedia', value: tersedia, color: 'var(--success)' },
                    { label: 'Sedang Disewa', value: disewa, color: 'var(--warning)' },
                    { label: 'Maintenance', value: maintenance, color: 'var(--error)' },
                ].map((stat, idx) => (
                    <Card key={idx} hover={false}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
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
                            {mockKategori.map(kat => (
                                <option key={kat.id} value={kat.id}>{kat.nama}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input"
                            style={{ width: '150px' }}
                        >
                            <option value="all">Semua Status</option>
                            <option value="tersedia">Tersedia</option>
                            <option value="disewa">Disewa</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="rusak">Rusak</option>
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
                                <TableHeader align="right">Harga/Hari</TableHeader>
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
                                            <TableCell align="center">{barang.stok}</TableCell>
                                            <TableCell align="right">{formatRupiah(barang.hargaSewaPerHari)}</TableCell>
                                            <TableCell align="center"><StatusBadge status={barang.status} /></TableCell>
                                            <TableCell align="center">
                                                <Button size="sm" variant="secondary" onClick={() => setSelectedBarang(barang)}>Detail</Button>
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
                isOpen={!!selectedBarang}
                onClose={() => setSelectedBarang(null)}
                title="Detail Barang"
            >
                {selectedBarang && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-400)" strokeWidth="1.5">
                                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                </svg>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{selectedBarang.nama}</div>
                            <div style={{ color: 'var(--text-muted)' }}>{selectedBarang.kode}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Merk</div>
                                <div style={{ fontWeight: 600 }}>{selectedBarang.merk}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Kategori</div>
                                <div style={{ fontWeight: 600 }}>{mockKategori.find(k => k.id === selectedBarang.kategoriId)?.nama}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Stok</div>
                                <div style={{ fontWeight: 600 }}>{selectedBarang.stok} unit</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
                                <StatusBadge status={selectedBarang.status} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Harga Sewa</div>
                                <div style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{formatRupiah(selectedBarang.hargaSewaPerHari)}/hari</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Denda Terlambat</div>
                                <div style={{ fontWeight: 600, color: 'var(--error)' }}>{formatRupiah(selectedBarang.dendaPerHari)}/hari</div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Deskripsi</div>
                            <div>{selectedBarang.deskripsi}</div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
