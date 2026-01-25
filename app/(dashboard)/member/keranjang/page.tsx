'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatRupiah, calculateDays } from '@/lib/utils';
import { mockKategori } from '@/lib/mock-data';
import { useCart } from '@/lib/cart-context';

export default function KeranjangPage() {
    const router = useRouter();
    const { items: cartItems, removeItem, updateItem } = useCart();

    const updateQty = (index: number, qty: number) => {
        if (qty < 1) return;
        updateItem(index, { qty });
    };

    const updateDates = (index: number, field: 'tanggalMulai' | 'tanggalSelesai', value: string) => {
        updateItem(index, { [field]: value });
    };

    // Calculate totals
    const calculateItemSubtotal = (item: typeof cartItems[0]) => {
        const days = calculateDays(item.tanggalMulai, item.tanggalSelesai);
        const price = item.barang.hargaSewa || item.barang.hargaSewaPerHari || 0;
        return price * item.qty * days;
    };

    const totalDays = cartItems.length > 0 ? calculateDays(cartItems[0].tanggalMulai, cartItems[0].tanggalSelesai) : 0;
    const subtotal = cartItems.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
    const biayaLayanan = cartItems.length > 0 ? 10000 : 0;
    const total = subtotal + biayaLayanan;

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Keranjang kosong!');
            return;
        }
        router.push('/member/checkout');
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Keranjang</h1>
                <p className="page-subtitle">Review barang yang akan disewa</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Cart Items */}
                <div>
                    {cartItems.length === 0 ? (
                        <Card hover={false}>
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" style={{ margin: '0 auto 1rem' }}>
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Keranjang Kosong</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                    Belum ada barang di keranjang
                                </p>
                                <Link href="/member/katalog">
                                    <Button>Lihat Katalog</Button>
                                </Link>
                            </div>
                        </Card>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cartItems.map((item, index) => {
                                const kategori = mockKategori.find(k => k.id === item.barang.kategoriId);
                                const days = calculateDays(item.tanggalMulai, item.tanggalSelesai);
                                const itemSubtotal = calculateItemSubtotal(item);

                                return (
                                    <Card key={index} hover={false}>
                                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                                            {/* Image placeholder */}
                                            <div
                                                style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    borderRadius: '0.75rem',
                                                    background: 'var(--bg-tertiary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                            </div>

                                            {/* Details */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-400)', marginBottom: '0.25rem' }}>
                                                            {kategori?.nama}
                                                        </div>
                                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                                                            {item.barang.nama}
                                                        </h3>
                                                        <div style={{ fontSize: '0.875rem', color: 'var(--primary-400)' }}>
                                                            {formatRupiah(item.barang.hargaSewa || item.barang.hargaSewaPerHari || 0)} / hari
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'var(--error)',
                                                            cursor: 'pointer',
                                                            padding: '0.5rem',
                                                        }}
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Date & Qty */}
                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                                                            Tanggal Mulai
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={item.tanggalMulai}
                                                            onChange={(e) => updateDates(index, 'tanggalMulai', e.target.value)}
                                                            className="input"
                                                            style={{ padding: '0.5rem' }}
                                                        />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                                                            Tanggal Selesai
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={item.tanggalSelesai}
                                                            onChange={(e) => updateDates(index, 'tanggalSelesai', e.target.value)}
                                                            className="input"
                                                            style={{ padding: '0.5rem' }}
                                                        />
                                                    </div>
                                                    <div style={{ width: '80px' }}>
                                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                                                            Qty
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.qty}
                                                            onChange={(e) => updateQty(index, parseInt(e.target.value) || 1)}
                                                            className="input"
                                                            style={{ padding: '0.5rem', textAlign: 'center' }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Item subtotal */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                        {days} hari × {item.qty} unit
                                                    </span>
                                                    <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                                                        {formatRupiah(itemSubtotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div>
                    <Card hover={false}>
                        <CardTitle>Ringkasan Pesanan</CardTitle>
                        <CardContent>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Subtotal ({cartItems.length} item)</span>
                                    <span>{formatRupiah(subtotal)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Durasi Sewa</span>
                                    <span>{totalDays} hari</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Biaya Layanan</span>
                                    <span>{formatRupiah(biayaLayanan)}</span>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem' }}>
                                    <span>Total</span>
                                    <span className="gradient-text">{formatRupiah(total)}</span>
                                </div>
                            </div>

                            <Button
                                style={{ width: '100%', marginTop: '1.5rem' }}
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0}
                            >
                                Lanjut ke Pembayaran
                            </Button>

                            <Link href="/member/katalog">
                                <Button variant="secondary" style={{ width: '100%', marginTop: '0.75rem' }}>
                                    Tambah Barang Lain
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
