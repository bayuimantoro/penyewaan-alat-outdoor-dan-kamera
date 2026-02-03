'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';

export default function VerificationPage() {
    const { currentUser, refreshSession } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');

    // Refresh session on page load to get latest status from server
    useEffect(() => {
        refreshSession();
    }, []);

    // Fallback status if user is not loaded yet
    const status = currentUser?.statusVerifikasi || 'pending';

    const handleUpload = async () => {
        if (!file) {
            setMessage('Silakan pilih foto KTP terlebih dahulu.');
            return;
        }

        setIsLoading(true);
        try {
            // Use FormData to send file
            const formData = new FormData();
            formData.append('ktp', file);

            const response = await fetch('/api/member/verify', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                setMessage('Dokumen berhasil diupload! Menunggu verifikasi admin.');
                setFile(null);
                await refreshSession();
            } else {
                setMessage(result.message || 'Gagal mengupload dokumen.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage('Terjadi kesalahan saat upload.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusConfig = () => {
        switch (status) {
            case 'approved':
                return {
                    icon: '✓',
                    title: 'Akun Terverifikasi',
                    description: 'Anda sudah bisa melakukan penyewaan barang.',
                    bgColor: 'rgba(34, 197, 94, 0.1)',
                    borderColor: 'rgba(34, 197, 94, 0.3)',
                    iconBg: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    textColor: 'var(--success)',
                };
            case 'pending':
                return {
                    icon: '⏳',
                    title: 'Menunggu Verifikasi',
                    description: 'Upload KTP/SIM Anda untuk diverifikasi admin.',
                    bgColor: 'rgba(245, 158, 11, 0.1)',
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                    iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    textColor: 'var(--warning)',
                };
            case 'rejected':
                return {
                    icon: '✗',
                    title: 'Verifikasi Ditolak',
                    description: 'Silakan upload ulang dokumen yang valid.',
                    bgColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    iconBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    textColor: 'var(--error)',
                };
            default:
                return {
                    icon: '📄',
                    title: 'Belum Terverifikasi',
                    description: 'Upload KTP/SIM untuk mulai menyewa.',
                    bgColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    iconBg: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                    textColor: 'var(--text-secondary)',
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Verifikasi Identitas</h1>
                <p className="page-subtitle">Upload foto KTP/SIM untuk mengaktifkan fitur penyewaan</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Status Card */}
                <Card hover={false}>
                    <CardTitle>Status Verifikasi</CardTitle>
                    <CardContent>
                        <div
                            style={{
                                marginTop: '1rem',
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                background: statusConfig.bgColor,
                                border: `1px solid ${statusConfig.borderColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                            }}
                        >
                            <div
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    background: statusConfig.iconBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    flexShrink: 0,
                                }}
                            >
                                {statusConfig.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem', color: statusConfig.textColor }}>
                                    {statusConfig.title}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {statusConfig.description}
                                </p>
                            </div>
                        </div>

                        {/* Info steps */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                                Langkah Verifikasi:
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                                    <span style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: status !== 'pending' ? 'var(--success)' : 'var(--primary-500)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}>1</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>Daftar akun</span>
                                    {status !== 'pending' && <span style={{ color: 'var(--success)' }}>✓</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                                    <span style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: status === 'approved' ? 'var(--success)' : 'var(--bg-tertiary)',
                                        color: status === 'approved' ? 'white' : 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        border: status === 'approved' ? 'none' : '1px solid var(--border-color)',
                                    }}>2</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>Upload KTP/SIM</span>
                                    {status === 'approved' && <span style={{ color: 'var(--success)' }}>✓</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                                    <span style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: status === 'approved' ? 'var(--success)' : 'var(--bg-tertiary)',
                                        color: status === 'approved' ? 'white' : 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        border: status === 'approved' ? 'none' : '1px solid var(--border-color)',
                                    }}>3</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>Verifikasi admin</span>
                                    {status === 'approved' && <span style={{ color: 'var(--success)' }}>✓</span>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload Form */}
                {status !== 'approved' && (
                    <Card hover={false}>
                        <CardTitle>Upload Dokumen</CardTitle>
                        <CardContent>
                            <div style={{ marginTop: '1rem' }}>
                                <FileUpload
                                    accept="image/*"
                                    maxSize={5}
                                    onFileSelect={setFile}
                                />

                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: 'rgba(217, 70, 239, 0.1)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(217, 70, 239, 0.2)',
                                }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-400)', marginBottom: '0.5rem', fontWeight: 600 }}>
                                        📋 Persyaratan Dokumen:
                                    </p>
                                    <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1rem', margin: 0 }}>
                                        <li>Foto KTP atau SIM yang masih berlaku</li>
                                        <li>Foto harus jelas dan tidak buram</li>
                                        <li>NIK dan Nama harus terlihat jelas</li>
                                        <li>Format: JPG, PNG (Max 5MB)</li>
                                    </ul>
                                </div>

                                {message && (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        background: message.includes('berhasil') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        border: `1px solid ${message.includes('berhasil') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                    }}>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: message.includes('berhasil') ? 'var(--success)' : 'var(--error)',
                                            margin: 0,
                                        }}>
                                            {message.includes('berhasil') ? '✓ ' : '⚠ '}{message}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    style={{ width: '100%', marginTop: '1.5rem' }}
                                    onClick={handleUpload}
                                    isLoading={isLoading}
                                    disabled={!file}
                                >
                                    Kirim Verifikasi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Success message when approved */}
                {status === 'approved' && (
                    <Card hover={false}>
                        <CardTitle>Selamat! 🎉</CardTitle>
                        <CardContent>
                            <div style={{
                                marginTop: '1rem',
                                padding: '2rem',
                                textAlign: 'center',
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto 1.5rem',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                }}>
                                    ✓
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Akun Anda Terverifikasi
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Sekarang Anda bisa menyewa barang outdoor dan kamera.
                                </p>
                                <Button onClick={() => window.location.href = '/member/katalog'}>
                                    Lihat Katalog Barang
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
