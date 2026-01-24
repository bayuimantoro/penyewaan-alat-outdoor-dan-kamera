'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/utils';
import { mockBarang, mockUsers, mockKategori } from '@/lib/mock-data';
import { useTransactions } from '@/lib/transaction-context';

export default function LaporanPage() {
    const { transactions } = useTransactions();
    const [periode, setPeriode] = useState('bulan');

    // Calculate stats
    const totalPendapatan = transactions
        .filter(t => t.status === 'selesai')
        .reduce((sum, t) => sum + t.total, 0);

    const totalDenda = transactions
        .filter(t => t.status === 'selesai')
        .reduce((sum, t) => sum + t.denda, 0);

    const transaksiSelesai = transactions.filter(t => t.status === 'selesai').length;
    const transaksiBerjalan = transactions.filter(t => t.status === 'sedang_disewa').length;

    // Barang stats
    const barangTersedia = mockBarang.filter(b => b.status === 'tersedia').length;
    const barangDisewa = mockBarang.filter(b => b.status === 'disewa').length;

    // Member stats
    const memberAktif = mockUsers.filter(u => u.role === 'member' && u.statusVerifikasi === 'approved').length;
    const memberPending = mockUsers.filter(u => u.role === 'member' && u.statusVerifikasi === 'pending').length;

    // Top barang by orders (dummy data for demo)
    const topBarang = [
        { nama: 'Sony A7 III', kategori: 'Kamera', sewa: 24, pendapatan: 8400000 },
        { nama: 'Tenda Dome 4 Orang', kategori: 'Tenda', sewa: 18, pendapatan: 1350000 },
        { nama: 'GoPro Hero 12', kategori: 'Kamera', sewa: 15, pendapatan: 2250000 },
        { nama: 'Carrier 60L Deuter', kategori: 'Carrier', sewa: 12, pendapatan: 600000 },
        { nama: 'Sleeping Bag -5°C', kategori: 'Sleeping Bag', sewa: 10, pendapatan: 350000 },
    ];

    // Monthly revenue (dummy for chart)
    const monthlyData = [
        { month: 'Jan', revenue: 4500000 },
        { month: 'Feb', revenue: 5200000 },
        { month: 'Mar', revenue: 4800000 },
        { month: 'Apr', revenue: 6100000 },
        { month: 'May', revenue: 7500000 },
        { month: 'Jun', revenue: 8200000 },
    ];

    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Laporan</h1>
                    <p className="page-subtitle">Ringkasan performa bisnis rental</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['minggu', 'bulan', 'tahun'].map(p => (
                        <Button
                            key={p}
                            size="sm"
                            variant={periode === p ? 'primary' : 'secondary'}
                            onClick={() => setPeriode(p)}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)} Ini
                        </Button>
                    ))}
                </div>
            </div>

            {/* Revenue Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Pendapatan</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700 }} className="gradient-text">{formatRupiah(totalPendapatan)}</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Denda</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)' }}>{formatRupiah(totalDenda)}</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Transaksi Selesai</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{transaksiSelesai}</div>
                    </div>
                </Card>
                <Card hover={false}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Sedang Berjalan</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-400)' }}>{transaksiBerjalan}</div>
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Revenue Chart */}
                <Card hover={false}>
                    <CardTitle>Pendapatan Bulanan</CardTitle>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', marginTop: '1rem' }}>
                            {monthlyData.map((data, idx) => (
                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: `${(data.revenue / maxRevenue) * 150}px`,
                                            background: 'linear-gradient(180deg, var(--primary-500), var(--accent-500))',
                                            borderRadius: '0.5rem 0.5rem 0 0',
                                            minHeight: '20px',
                                        }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{data.month}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Card hover={false}>
                        <CardTitle>Status Barang</CardTitle>
                        <CardContent>
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Tersedia</span>
                                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>{barangTersedia}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Disewa</span>
                                    <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{barangDisewa}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Total</span>
                                    <span style={{ fontWeight: 600 }}>{mockBarang.length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card hover={false}>
                        <CardTitle>Member</CardTitle>
                        <CardContent>
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Aktif</span>
                                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>{memberAktif}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                                    <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{memberPending}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Top Products */}
            <Card hover={false}>
                <CardTitle>Barang Paling Laris</CardTitle>
                <CardContent>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {topBarang.map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: '0.75rem',
                                }}
                            >
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: idx === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                            idx === 1 ? 'linear-gradient(135deg, #C0C0C0, #A0A0A0)' :
                                                idx === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' :
                                                    'var(--bg-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {idx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{item.nama}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-400)' }}>{item.kategori}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--primary-400)' }}>{formatRupiah(item.pendapatan)}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.sewa}x disewa</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Kategori Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                {mockKategori.map(kategori => {
                    const count = mockBarang.filter(b => b.kategoriId === kategori.id).length;
                    return (
                        <Card key={kategori.id} hover={false}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                    {kategori.icon === 'camera' ? '📷' :
                                        kategori.icon === 'tent' ? '⛺' :
                                            kategori.icon === 'bed' ? '🛏️' :
                                                kategori.icon === 'backpack' ? '🎒' :
                                                    kategori.icon === 'aperture' ? '🔍' : '🔥'}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{count}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kategori.nama}</div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
