'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatRupiah, calculateDays } from '@/lib/utils';
import { mockBarang, mockKategori } from '@/lib/mock-data';
import { useCart } from '@/lib/cart-context';

export default function BarangDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { addItem } = useCart();
    const [qty, setQty] = useState(1);
    const [tanggalMulai, setTanggalMulai] = useState('');
    const [tanggalSelesai, setTanggalSelesai] = useState('');
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const barang = mockBarang.find(b => b.id === parseInt(id));
    const kategori = mockKategori.find(k => k.id === barang?.kategoriId);

    if (!barang) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Barang tidak ditemukan</h2>
                <Link href="/member/katalog">
                    <Button style={{ marginTop: '1rem' }}>Kembali ke Katalog</Button>
                </Link>
            </div>
        );
    }

    const days = tanggalMulai && tanggalSelesai ? calculateDays(tanggalMulai, tanggalSelesai) : 0;
    const totalHarga = barang.hargaSewaPerHari * qty * days;
    const isAvailable = barang.status === 'tersedia';

    const handleAddToCart = () => {
        if (!tanggalMulai || !tanggalSelesai) {
            alert('Pilih tanggal sewa terlebih dahulu!');
            return;
        }
        if (days <= 0) {
            alert('Tanggal selesai harus setelah tanggal mulai!');
            return;
        }

        setIsAddingToCart(true);

        // Add to cart context
        addItem({
            barang,
            qty,
            tanggalMulai,
            tanggalSelesai,
        });

        setTimeout(() => {
            setIsAddingToCart(false);
            alert('Barang berhasil ditambahkan ke keranjang!');
            router.push('/member/keranjang');
        }, 500);
    };

    // Related items
    const relatedItems = mockBarang
        .filter(b => b.kategoriId === barang.kategoriId && b.id !== barang.id)
        .slice(0, 3);

    return (
        <div>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <Link href="/member/katalog" style={{ color: 'var(--text-muted)' }}>Katalog</Link>
                <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>/</span>
                <Link href={`/member/katalog?kategori=${kategori?.id}`} style={{ color: 'var(--text-muted)' }}>
                    {kategori?.nama}
                </Link>
                <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>/</span>
                <span>{barang.nama}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Product Image */}
                <div>
                    <div
                        style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                        }}
                    >
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>

                    {/* Thumbnails placeholder */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div
                                key={i}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '0.5rem',
                                    background: 'var(--bg-tertiary)',
                                    border: i === 1 ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--accent-400)', marginBottom: '0.5rem' }}>
                        {kategori?.nama}
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {barang.nama}
                    </h1>
                    <div style={{ marginBottom: '1rem' }}>
                        <StatusBadge status={barang.status} />
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Kode: {barang.kode}
                    </div>

                    <div
                        style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            marginBottom: '1.5rem',
                        }}
                    >
                        <span className="gradient-text">{formatRupiah(barang.hargaSewaPerHari)}</span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> / hari</span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                        {barang.deskripsi}
                    </p>

                    {/* Availability */}
                    <div
                        style={{
                            padding: '1rem',
                            background: isAvailable ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '0.75rem',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: isAvailable ? 'var(--success)' : 'var(--error)',
                                }}
                            />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                {isAvailable ? `Tersedia • Stok: ${barang.stok} unit` : 'Tidak Tersedia'}
                            </span>
                        </div>
                    </div>

                    {isAvailable && (
                        <Card hover={false}>
                            <CardTitle>Booking Sekarang</CardTitle>
                            <CardContent>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                                                Tanggal Mulai
                                            </label>
                                            <input
                                                type="date"
                                                className="input"
                                                value={tanggalMulai}
                                                onChange={(e) => setTanggalMulai(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                                                Tanggal Selesai
                                            </label>
                                            <input
                                                type="date"
                                                className="input"
                                                value={tanggalSelesai}
                                                onChange={(e) => setTanggalSelesai(e.target.value)}
                                                min={tanggalMulai || new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                                            Jumlah Unit
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <button
                                                onClick={() => setQty(Math.max(1, qty - 1))}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-tertiary)',
                                                    color: 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    fontSize: '1.25rem',
                                                }}
                                            >
                                                -
                                            </button>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                                                {qty}
                                            </span>
                                            <button
                                                onClick={() => setQty(Math.min(barang.stok, qty + 1))}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-tertiary)',
                                                    color: 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    fontSize: '1.25rem',
                                                }}
                                            >
                                                +
                                            </button>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                Max: {barang.stok} unit
                                            </span>
                                        </div>
                                    </div>

                                    {days > 0 && (
                                        <div
                                            style={{
                                                padding: '1rem',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '0.75rem',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>
                                                    {formatRupiah(barang.hargaSewaPerHari)} × {qty} unit × {days} hari
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 600 }}>Total</span>
                                                <span style={{ fontSize: '1.25rem', fontWeight: 700 }} className="gradient-text">
                                                    {formatRupiah(totalHarga)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleAddToCart}
                                        isLoading={isAddingToCart}
                                        style={{ width: '100%' }}
                                    >
                                        Tambah ke Keranjang
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Related Items */}
            {relatedItems.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                        Barang Serupa
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {relatedItems.map(item => (
                            <Link key={item.id} href={`/member/katalog/${item.id}`}>
                                <Card>
                                    <div
                                        style={{
                                            height: '150px',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '0.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '1rem',
                                        }}
                                    >
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        </svg>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                        {item.nama}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--primary-400)' }}>
                                        {formatRupiah(item.hargaSewaPerHari)}/hari
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
