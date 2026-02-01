'use client';

import React, { useState } from 'react';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';

export default function VerificationPage() {
    const { currentUser, refreshSession } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');

    // Fallback status if user is not loaded yet
    const status = currentUser?.statusVerifikasi || 'unverified';

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
                setMessage('Dokumen berhasil diupload dan sedang dalam proses verifikasi admin.');
                setFile(null); // Reset file input
                await refreshSession(); // Refresh session to get new status
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-500">
                    Verifikasi Identitas
                </h1>
                <p className="text-text-secondary mt-2">
                    Upload foto KTP/SIM untuk mengaktifkan fitur penyewaan.
                </p>
            </div>

            {/* Status Card */}
            <div className={`p-6 rounded-2xl border ${status === 'approved' ? 'bg-success-500/10 border-success-500/20' :
                    status === 'pending' ? 'bg-warning-500/10 border-warning-500/20' :
                        'glass'
                }`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status === 'approved' ? 'bg-success-500 text-white' :
                            status === 'pending' ? 'bg-warning-500 text-white' :
                                'bg-surface-800 text-text-secondary'
                        }`}>
                        {status === 'approved' ? '✓' :
                            status === 'pending' ? '⏳' :
                                '📄'}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">
                            {status === 'approved' ? 'Akun Terverifikasi' :
                                status === 'pending' ? 'Menunggu Verifikasi' :
                                    'Belum Terverifikasi'}
                        </h3>
                        <p className="text-sm text-text-secondary">
                            {status === 'approved' ? 'Anda sudah bisa melakukan penyewaan barang.' :
                                status === 'pending' ? 'Admin sedang memeriksa data Anda (maks 1x24 jam).' :
                                    'Silakan upload KTP untuk mulai menyewa.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload Form - Only show if not approved or pending */}
            {(status === 'unverified' || status === 'rejected') && (
                <div className="glass p-6 rounded-2xl">
                    <h3 className="font-semibold mb-4">Upload Dokumen (KTP/SIM)</h3>
                    <div className="space-y-4">
                        <FileUpload
                            accept="image/*"
                            maxSize={5}
                            onFileSelect={setFile}
                        />
                        <p className="text-xs text-text-secondary">
                            *Foto harus jelas, terbaca, dan tidak terpotong (Format: JPG, PNG, Max 5MB).
                            Pastikan NIK dan Nama terlihat jelas.
                        </p>

                        {message && (
                            <p className={`text-sm ${message.includes('berhasil') ? 'text-success-500' : 'text-error-500'}`}>
                                {message}
                            </p>
                        )}

                        <div className="flex justify-end">
                            <Button
                                onClick={handleUpload}
                                isLoading={isLoading}
                                disabled={!file}
                            >
                                Kirim Verifikasi
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
