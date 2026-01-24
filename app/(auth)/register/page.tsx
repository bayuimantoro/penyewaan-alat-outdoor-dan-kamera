'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
    const router = useRouter();
    const { registerUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        confirmPassword: '',
        noHp: '',
        alamat: '',
        fotoKtp: null as File | null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nama) newErrors.nama = 'Nama wajib diisi';
        if (!formData.email) newErrors.email = 'Email wajib diisi';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email tidak valid';
        if (!formData.password) newErrors.password = 'Password wajib diisi';
        else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak sama';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.noHp) newErrors.noHp = 'No. HP wajib diisi';
        if (!formData.alamat) newErrors.alamat = 'Alamat wajib diisi';
        if (!formData.fotoKtp) newErrors.fotoKtp = 'Foto KTP wajib diupload';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep2()) return;

        setIsLoading(true);

        // Register user via AuthContext
        setTimeout(() => {
            const result = registerUser({
                nama: formData.nama,
                email: formData.email,
                password: formData.password,
                noHp: formData.noHp,
                alamat: formData.alamat,
            });

            setIsLoading(false);

            if (result.success) {
                alert(result.message);
                router.push('/login?registered=true');
            } else {
                setErrors({ email: result.message });
                setStep(1);
            }
        }, 1000);
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
                    Daftar Akun
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {step === 1 ? 'Langkah 1: Informasi Dasar' : 'Langkah 2: Verifikasi Identitas'}
                </p>
            </div>

            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <div
                    style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: 'var(--primary-500)',
                    }}
                />
                <div
                    style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: step >= 2 ? 'var(--primary-500)' : 'var(--border-color)',
                        transition: 'background 0.3s ease',
                    }}
                />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {step === 1 ? (
                    <>
                        <Input
                            label="Nama Lengkap"
                            placeholder="Masukkan nama lengkap"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            error={errors.nama}
                        />

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

                        <Button type="button" onClick={handleNext} style={{ width: '100%', marginTop: '0.5rem' }}>
                            Lanjut
                        </Button>
                    </>
                ) : (
                    <>
                        <Input
                            label="No. HP"
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={formData.noHp}
                            onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                            error={errors.noHp}
                        />

                        <Input
                            label="Alamat Lengkap"
                            placeholder="Masukkan alamat lengkap"
                            value={formData.alamat}
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                            error={errors.alamat}
                        />

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Foto KTP/SIM
                            </label>
                            <FileUpload
                                accept="image/*"
                                maxSize={5}
                                onFileSelect={(file) => setFormData({ ...formData, fotoKtp: file })}
                            />
                            {errors.fotoKtp && <span className="error-text" style={{ display: 'block', marginTop: '0.5rem' }}>{errors.fotoKtp}</span>}
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Upload foto KTP/SIM yang jelas untuk verifikasi
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setStep(1)}
                                style={{ flex: 1 }}
                            >
                                Kembali
                            </Button>
                            <Button type="submit" isLoading={isLoading} style={{ flex: 1 }}>
                                Daftar
                            </Button>
                        </div>
                    </>
                )}
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
                    ℹ️ Akun Anda akan diverifikasi oleh admin dalam 1x24 jam setelah pendaftaran.
                </p>
            </div>
        </div>
    );
}
