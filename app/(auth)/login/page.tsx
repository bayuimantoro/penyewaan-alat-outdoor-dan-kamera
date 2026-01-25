'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
    const router = useRouter();
    const { loginUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Simple validation
        const newErrors: Record<string, string> = {};
        if (!formData.email) newErrors.email = 'Email wajib diisi';
        if (!formData.password) newErrors.password = 'Password wajib diisi';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Call API for database-based login
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const result = await response.json();
            setIsLoading(false);

            if (result.success) {
                // Redirect based on role
                if (result.role === 'admin') {
                    router.push('/admin');
                } else if (result.role === 'gudang') {
                    router.push('/gudang');
                } else {
                    router.push('/member');
                }
            } else {
                setErrors({ password: result.message });
            }
        } catch (error) {
            setIsLoading(false);
            setErrors({ password: 'Terjadi kesalahan. Coba lagi.' });
        }
    };

    return (
        <div className="glass" style={{ borderRadius: '1.5rem', padding: '2.5rem' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div
                    style={{
                        width: '4rem',
                        height: '4rem',
                        margin: '0 auto 1rem',
                        borderRadius: '1rem',
                        background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <h1 className="gradient-text" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                    RentalGear
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Masuk ke akun Anda
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Input
                    label="Email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link
                        href="/forgot-password"
                        style={{ fontSize: '0.875rem', color: 'var(--primary-400)' }}
                    >
                        Lupa password?
                    </Link>
                </div>

                <Button type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
                    Masuk
                </Button>
            </form>

            {/* Divider */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    margin: '1.5rem 0',
                }}
            >
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>atau</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

            {/* Register link */}
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Belum punya akun?{' '}
                <Link href="/register" style={{ color: 'var(--primary-400)', fontWeight: 500 }}>
                    Daftar sekarang
                </Link>
            </p>

            {/* Demo credentials */}
            <div
                style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(217, 70, 239, 0.1)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(217, 70, 239, 0.2)',
                }}
            >
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Demo Login (email / password):
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <p>• <strong>admin@rentalgear.com</strong> / 123456 → Admin</p>
                    <p>• <strong>gudang@rentalgear.com</strong> / 123456 → Gudang</p>
                    <p>• <strong>ahmad@gmail.com</strong> / 123456 → Member</p>
                </div>
            </div>
            {/* Reset Button */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                    type="button"
                    onClick={() => {
                        if (window.confirm('Reset semua data demo ke awal? Transaksi dan user baru akan dihapus.')) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Reset Data Demo
                </button>
            </div>
        </div>
    );
}
