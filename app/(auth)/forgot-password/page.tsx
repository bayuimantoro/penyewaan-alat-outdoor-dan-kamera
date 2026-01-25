'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: enter email, 2: enter new password
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email wajib diisi');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setUserName(data.user.nama);
                setStep(2);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!password) {
            setError('Password baru wajib diisi');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        if (password !== confirmPassword) {
            setError('Konfirmasi password tidak cocok');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword: password })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass" style={{ borderRadius: '1.5rem', padding: '2.5rem', maxWidth: '400px', width: '100%' }}>
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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Lupa Password</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {step === 1 ? 'Masukkan email untuk reset password' : `Hai ${userName}, buat password baru`}
                </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <div style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: 'var(--primary-500)'
                }} />
                <div style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: step >= 2 ? 'var(--primary-500)' : 'var(--bg-tertiary)'
                }} />
            </div>

            {/* Success message */}
            {success && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid var(--success)',
                    color: 'var(--success)',
                    textAlign: 'center'
                }}>
                    {success}
                </div>
            )}

            {/* Step 1: Enter Email */}
            {step === 1 && (
                <form onSubmit={handleVerifyEmail}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Masukkan email terdaftar"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={error}
                    />

                    <Button
                        type="submit"
                        style={{ width: '100%', marginTop: '1.5rem' }}
                        isLoading={isLoading}
                    >
                        Verifikasi Email
                    </Button>
                </form>
            )}

            {/* Step 2: Enter New Password */}
            {step === 2 && !success && (
                <form onSubmit={handleResetPassword}>
                    <div style={{ marginBottom: '1rem' }}>
                        <Input
                            label="Password Baru"
                            type="password"
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Input
                        label="Konfirmasi Password"
                        type="password"
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={error}
                    />

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setStep(1)}
                            style={{ flex: 1 }}
                        >
                            Kembali
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            style={{ flex: 2 }}
                        >
                            Reset Password
                        </Button>
                    </div>
                </form>
            )}

            {/* Back to login */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link
                    href="/login"
                    style={{
                        color: 'var(--primary-400)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Kembali ke halaman login
                </Link>
            </div>
        </div>
    );
}
