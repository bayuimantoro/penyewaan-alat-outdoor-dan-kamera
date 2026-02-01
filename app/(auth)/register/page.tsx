'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        confirmPassword: '',
        noHp: '',
        alamat: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Realtime validation helpers
    const validateEmailFormat = (email: string): string | null => {
        if (!email) return null; // Don't show error if empty (will be caught on submit)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return 'Format email tidak valid (contoh: nama@email.com)';
        }
        return null;
    };

    const validatePhoneFormat = (phone: string): string | null => {
        if (!phone) return null; // Don't show error if empty
        // Remove any non-digit characters for validation
        const digitsOnly = phone.replace(/\D/g, '');

        if (!digitsOnly.startsWith('08')) {
            return 'Nomor HP harus diawali dengan 08';
        }
        if (digitsOnly.length < 10) {
            return 'Nomor HP minimal 10 digit';
        }
        if (digitsOnly.length > 13) {
            return 'Nomor HP maksimal 13 digit';
        }
        return null;
    };

    // Handle email input with realtime validation
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, email: value });

        const error = validateEmailFormat(value);
        if (error) {
            setErrors(prev => ({ ...prev, email: error }));
        } else {
            setErrors(prev => {
                const { email, ...rest } = prev;
                return rest;
            });
        }
    };

    // Handle phone input - only allow numbers
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow digits
        const value = e.target.value.replace(/\D/g, '');
        setFormData({ ...formData, noHp: value });

        const error = validatePhoneFormat(value);
        if (error) {
            setErrors(prev => ({ ...prev, noHp: error }));
        } else {
            setErrors(prev => {
                const { noHp, ...rest } = prev;
                return rest;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Validate Name
        if (!formData.nama) newErrors.nama = 'Nama wajib diisi';

        // Validate Email
        if (!formData.email) newErrors.email = 'Email wajib diisi';
        else {
            const emailError = validateEmailFormat(formData.email);
            if (emailError) newErrors.email = emailError;
        }

        // Validate Password
        if (!formData.password) newErrors.password = 'Password wajib diisi';
        else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak sama';
        }

        // Validate Phone
        if (!formData.noHp) newErrors.noHp = 'No. HP wajib diisi';
        else {
            const phoneError = validatePhoneFormat(formData.noHp);
            if (phoneError) newErrors.noHp = phoneError;
        }

        // Validate Address
        if (!formData.alamat) newErrors.alamat = 'Alamat wajib diisi';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Register user via API endpoint
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama: formData.nama,
                    email: formData.email,
                    password: formData.password,
                    noHp: formData.noHp,
                    alamat: formData.alamat,
                })
            });

            const result = await response.json();

            if (result.success) {
                // Redirect to login with success message
                router.push('/login?registered=true');
            } else {
                setErrors({ email: result.message });
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ email: 'Terjadi kesalahan saat mendaftar' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass" style={{ borderRadius: '1.5rem', padding: '2.5rem' }}>
            {/* Logo - Clickable to Home */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Link
                    href="/"
                    style={{
                        textDecoration: 'none',
                        display: 'inline-block',
                        transition: 'transform 0.2s ease, opacity 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.opacity = '1';
                    }}
                    title="Kembali ke Beranda"
                >
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
                            cursor: 'pointer',
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                        Daftar Akun
                    </h1>
                </Link>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Lengkapi data diri untuk membuat akun baru
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Input
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    error={errors.nama}
                />

                <div>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={handleEmailChange}
                        error={errors.email}
                    />
                    {formData.email && !errors.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--success-500)', marginTop: '0.25rem' }}>
                            ✓ Format email valid
                        </span>
                    )}
                </div>

                <Input
                    label="Password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                />

                <Input
                    label="Konfirmasi Password"
                    type="password"
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                />

                <div>
                    <Input
                        label="No. HP"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={formData.noHp}
                        onChange={handlePhoneChange}
                        error={errors.noHp}
                    />
                    {formData.noHp && !errors.noHp && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--success-500)', marginTop: '0.25rem' }}>
                            ✓ Format nomor HP valid ({formData.noHp.length} digit)
                        </span>
                    )}
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Format: 08xxxxxxxxxx (10-13 digit)
                    </span>
                </div>

                <Input
                    label="Alamat Lengkap"
                    placeholder="Masukkan alamat lengkap"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    error={errors.alamat}
                />

                <Button type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
                    Daftar Sekarang
                </Button>
            </form>

            {/* Login link */}
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
                Sudah punya akun?{' '}
                <Link href="/login" style={{ color: 'var(--primary-400)', fontWeight: 500 }}>
                    Masuk di sini
                </Link>
            </p>

            {/* Note */}
            <div
                style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(6, 182, 212, 0.1)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                }}
            >
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-400)' }}>
                    ℹ️ Verifikasi identitas (KTP) dapat dilakukan nanti di halaman member.
                </p>
            </div>
        </div>
    );
}
