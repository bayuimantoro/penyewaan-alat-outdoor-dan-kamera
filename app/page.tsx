'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { mockBarang, mockUsers, mockTransaksi } from '@/lib/mock-data';

// Calculate real stats from mock data
const alatTersedia = mockBarang.filter(b => b.status === 'tersedia').length;
const memberAktif = mockUsers.filter(u => u.role === 'member' && u.statusVerifikasi === 'approved').length;
const transaksiSukses = mockTransaksi.filter(t => t.status === 'selesai').length;

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-15%',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Navigation */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 4rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            RentalGear
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login">
            <Button variant="secondary">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button>Daftar Gratis</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: '800px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '4rem',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}
          >
            Sewa Alat{' '}
            <span className="gradient-text">Outdoor & Kamera</span>
            {' '}Dengan Mudah
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              marginBottom: '2.5rem',
              lineHeight: 1.6,
            }}
          >
            Platform penyewaan alat outdoor dan kamera terlengkap.
            Booking online, ambil di lokasi, nikmati petualanganmu!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/register">
              <Button size="lg" style={{ padding: '1rem 2.5rem' }}>
                Mulai Sekarang
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Button>
            </Link>
            <Link href="/member/katalog">
              <Button variant="secondary" size="lg" style={{ padding: '1rem 2.5rem' }}>
                Lihat Katalog
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '4rem',
              marginTop: '4rem',
              padding: '2rem',
              background: 'rgba(30, 30, 50, 0.5)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              border: '1px solid var(--border-color)',
            }}
          >
            {[
              { value: alatTersedia, label: 'Alat Tersedia' },
              { value: memberAktif, label: 'Member Aktif' },
              { value: transaksiSukses, label: 'Transaksi Sukses' },
              { value: '4.9', label: 'Rating' },
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Features */}
      <section style={{ padding: '4rem', position: 'relative', zIndex: 10 }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}>
          Kenapa Pilih <span className="gradient-text">RentalGear</span>?
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {[
            {
              icon: '📦',
              title: 'Koleksi Lengkap',
              desc: 'Kamera DSLR, Mirrorless, GoPro, Tenda, Carrier, dan perlengkapan outdoor lainnya',
            },
            {
              icon: '✅',
              title: 'Kondisi Terjamin',
              desc: 'Semua barang dicek sebelum dan sesudah penyewaan untuk memastikan kualitas terbaik',
            },
            {
              icon: '💳',
              title: 'Pembayaran Mudah',
              desc: 'Bayar dengan transfer bank, e-wallet, atau langsung di lokasi pengambilan',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="card"
              style={{ textAlign: 'center', padding: '2rem' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '2rem 4rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          © 2024 RentalGear. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem' }}>
          <a href="#" style={{ color: 'var(--text-secondary)' }}>Tentang Kami</a>
          <a href="#" style={{ color: 'var(--text-secondary)' }}>Syarat & Ketentuan</a>
          <a href="#" style={{ color: 'var(--text-secondary)' }}>Kontak</a>
        </div>
      </footer>
    </div>
  );
}
