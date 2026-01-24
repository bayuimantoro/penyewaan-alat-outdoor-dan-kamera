'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { formatRupiah } from '@/lib/utils';
import { mockKategori } from '@/lib/mock-data';
import { useBarang } from '@/lib/barang-context';

export default function KatalogPage() {
    const { barang: barangList } = useBarang();
    const [search, setSearch] = useState('');
    const [selectedKategori, setSelectedKategori] = useState<number | null>(null);

    // Filter barang from context (real-time sync)
    const filteredBarang = barangList.filter(barang => {
        const matchSearch = barang.nama.toLowerCase().includes(search.toLowerCase());
        const matchKategori = selectedKategori === null || barang.kategoriId === selectedKategori;
        return matchSearch && matchKategori;
    });

    const availableBarang = filteredBarang.filter(b => b.status === 'tersedia');

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Katalog Barang</h1>
                <p className="page-subtitle">Cari dan booking alat outdoor & kamera yang kamu butuhkan</p>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <Input
                        placeholder="Cari barang..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                        variant={selectedKategori === null ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setSelectedKategori(null)}
                    >
                        Semua
                    </Button>
                    {mockKategori.map(kat => (
                        <Button
                            key={kat.id}
                            variant={selectedKategori === kat.id ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setSelectedKategori(kat.id)}
                        >
                            {kat.nama}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Menampilkan {filteredBarang.length} barang ({availableBarang.length} tersedia)
            </div>

            {/* Product Grid */}
            <div className="product-grid">
                {filteredBarang.map(barang => {
                    const kategori = mockKategori.find(k => k.id === barang.kategoriId);
                    const isAvailable = barang.status === 'tersedia';

                    return (
                        <div key={barang.id} className="product-card">
                            {/* Image placeholder */}
                            <div
                                className="product-image"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))`,
                                }}
                            >
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            </div>

                            <div className="product-content">
                                <div className="product-category">{kategori?.nama}</div>
                                <div className="product-name">{barang.nama}</div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                    {barang.deskripsi.substring(0, 60)}...
                                </p>
                                <div className="product-price">
                                    {formatRupiah(barang.hargaSewaPerHari)} <span>/ hari</span>
                                </div>
                            </div>

                            <div className="product-footer">
                                <div className={`product-stock ${barang.stok > 3 ? 'available' : barang.stok > 0 ? 'low' : 'empty'}`}>
                                    {barang.stok > 0 ? `Stok: ${barang.stok}` : 'Habis'}
                                </div>
                                <StatusBadge status={barang.status} />
                            </div>

                            {/* Quick book button */}
                            {isAvailable && (
                                <div style={{ padding: '0 1.25rem 1.25rem' }}>
                                    <Link href={`/member/katalog/${barang.id}`}>
                                        <Button style={{ width: '100%' }} size="sm">
                                            Booking Sekarang
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredBarang.length === 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 1rem' }}>
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Barang tidak ditemukan</p>
                    <p style={{ fontSize: '0.875rem' }}>Coba ubah kata kunci atau filter kategori</p>
                </div>
            )}
        </div>
    );
}
