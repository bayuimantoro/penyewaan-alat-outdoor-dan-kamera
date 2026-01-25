'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatRupiah, formatDate, generateTransactionCode, calculateDays } from '@/lib/utils';
import { mockKategori } from '@/lib/mock-data';
import { useCart } from '@/lib/cart-context';
import { useTransactions } from '@/lib/transaction-context';
import { useSession } from '@/lib/session-context';
import { useBarang } from '@/lib/barang-context';
import { Transaksi } from '@/types';

export default function CheckoutPage() {
    const router = useRouter();
    const { items: cartItems, clearCart } = useCart();
    const { addTransaction, transactions } = useTransactions();
    const { currentUser } = useSession();
    const { processCheckout } = useBarang();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [transactionCode, setTransactionCode] = useState('');

    // Calculate totals from cart
    const calculateItemSubtotal = (item: typeof cartItems[0]) => {
        const days = calculateDays(item.tanggalMulai, item.tanggalSelesai);
        // Try multiple field names for compatibility
        const price = Number(item.barang.hargaSewa) ||
            Number(item.barang.hargaSewaPerHari) ||
            Number((item.barang as any).harga_sewa_per_hari) ||
            0;

        if (price === 0) {
            console.warn('Price is 0 for item:', item.barang.nama, item.barang);
        }

        return price * item.qty * days;
    };

    const subtotal = cartItems.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
    const biayaLayanan = cartItems.length > 0 ? 10000 : 0;
    const total = subtotal + biayaLayanan;

    // Get first item dates for display
    const firstItem = cartItems[0];
    const totalDays = firstItem ? calculateDays(firstItem.tanggalMulai, firstItem.tanggalSelesai) : 0;

    const handlePayment = async () => {
        if (cartItems.length === 0) {
            alert('Keranjang kosong!');
            router.push('/member/keranjang');
            return;
        }

        if (!currentUser) {
            alert('Sesi login Anda telah berakhir. Silakan login kembali.');
            router.push('/login');
            return;
        }

        setIsProcessing(true);

        try {
            const code = generateTransactionCode();

            // Create new transaction (without id - API will generate it)
            const newTransaction = {
                kode: code,
                userId: currentUser.id,
                tanggalBooking: new Date().toISOString().split('T')[0],
                tanggalMulai: firstItem?.tanggalMulai || new Date().toISOString().split('T')[0],
                tanggalSelesai: firstItem?.tanggalSelesai || new Date().toISOString().split('T')[0],
                totalHari: totalDays,
                status: 'menunggu_pembayaran' as const,
                subtotal: subtotal,
                diskon: 0,
                denda: 0,
                total: total,
                createdAt: new Date().toISOString(),
            };

            // Create detail transaksi from cart items
            const newDetails = cartItems.map((item) => ({
                barangId: item.barang.id,
                qty: item.qty,
                hargaSewa: item.barang.hargaSewaPerHari || item.barang.hargaSewa || 0,
                subtotal: calculateItemSubtotal(item),
            }));

            // Add transaction with details to database (await the async call!)
            const transaksiId = await addTransaction(newTransaction, newDetails);

            if (transaksiId) {
                setTransactionCode(code);
                clearCart();
                setIsSuccess(true);
            } else {
                alert('Gagal menyimpan transaksi. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Terjadi kesalahan saat memproses pembayaran.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                    <Card hover={false}>
                        <div style={{ padding: '2rem' }}>
                            {/* Success Icon */}
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto 1.5rem',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                Pesanan Berhasil! 🎉
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                Pesanan kamu sudah tercatat di sistem
                            </p>

                            <div
                                style={{
                                    padding: '1rem',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                    Kode Transaksi
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                                    {transactionCode}
                                </div>
                            </div>

                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                <p>✅ Silakan datang ke lokasi untuk mengambil barang</p>
                                <p>💳 Pembayaran dilakukan di lokasi</p>
                                <p>📍 Alamat: Jl. Rental No. 123, Jakarta</p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Button
                                    variant="secondary"
                                    style={{ flex: 1 }}
                                    onClick={() => router.push('/member/riwayat')}
                                >
                                    Lihat Riwayat
                                </Button>
                                <Button
                                    style={{ flex: 1 }}
                                    onClick={() => router.push('/member')}
                                >
                                    Kembali ke Dashboard
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <Card hover={false}>
                        <div style={{ padding: '2rem' }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" style={{ margin: '0 auto 1rem' }}>
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Keranjang Kosong</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                Tambahkan barang ke keranjang terlebih dahulu
                            </p>
                            <Link href="/member/katalog">
                                <Button>Lihat Katalog</Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Konfirmasi Pembayaran</h1>
                <p className="page-subtitle">Review pesanan sebelum melakukan pembayaran</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Order Details */}
                <div>
                    <Card hover={false}>
                        <CardTitle>Detail Pesanan</CardTitle>
                        <CardContent>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                {cartItems.map((item, index) => {
                                    const kategori = mockKategori.find(k => k.id === item.barang.kategoriId);
                                    const days = calculateDays(item.tanggalMulai, item.tanggalSelesai);
                                    const itemTotal = calculateItemSubtotal(item);

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                gap: '1rem',
                                                padding: '1rem',
                                                background: 'var(--bg-tertiary)',
                                                borderRadius: '0.75rem',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: '0.5rem',
                                                    background: 'var(--bg-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                </svg>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--accent-400)' }}>{kategori?.nama}</div>
                                                <div style={{ fontWeight: 600 }}>{item.barang.nama}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                    {item.qty} unit × {days} hari
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                                                    {formatRupiah(itemTotal)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rental Info */}
                    <div style={{ marginTop: '1rem' }}>
                        <Card hover={false}>
                            <CardTitle>Informasi Penyewaan</CardTitle>
                            <CardContent>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            Tanggal Mulai
                                        </div>
                                        <div style={{ fontWeight: 600 }}>{firstItem ? formatDate(firstItem.tanggalMulai) : '-'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            Tanggal Selesai
                                        </div>
                                        <div style={{ fontWeight: 600 }}>{firstItem ? formatDate(firstItem.tanggalSelesai) : '-'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            Durasi Sewa
                                        </div>
                                        <div style={{ fontWeight: 600 }}>{totalDays} Hari</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            Lokasi Pengambilan
                                        </div>
                                        <div style={{ fontWeight: 600 }}>Jl. Rental No. 123</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Payment Summary */}
                <div>
                    <Card hover={false}>
                        <CardTitle>Ringkasan Pembayaran</CardTitle>
                        <CardContent>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Subtotal ({cartItems.length} item)</span>
                                    <span>{formatRupiah(subtotal)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Biaya Layanan</span>
                                    <span>{formatRupiah(biayaLayanan)}</span>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.25rem' }}>
                                    <span>Total Bayar</span>
                                    <span className="gradient-text">{formatRupiah(total)}</span>
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                }}
                            >
                                <div style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    💳 Bayar di Lokasi
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Pembayaran dilakukan langsung saat mengambil barang di lokasi rental.
                                </div>
                            </div>

                            <Button
                                style={{ width: '100%', marginTop: '1.5rem' }}
                                onClick={handlePayment}
                                isLoading={isProcessing}
                            >
                                {isProcessing ? 'Memproses...' : 'Konfirmasi Pesanan'}
                            </Button>

                            <Button
                                variant="secondary"
                                style={{ width: '100%', marginTop: '0.75rem' }}
                                onClick={() => router.back()}
                            >
                                Kembali
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
