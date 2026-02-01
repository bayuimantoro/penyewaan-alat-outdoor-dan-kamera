'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useUsers } from '@/lib/user-context';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function UsersManagementPage() {
    const { users, isLoading } = useUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const filteredUsers = users.filter(user =>
        user.role === 'member' && (
            user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleOpenReset = (user: any) => {
        setSelectedUser(user);
        setNewPassword(''); // Reset field
        setResetModalOpen(true);
    };

    const handleResetPassword = async () => {
        if (!newPassword) {
            alert('Password baru tidak boleh kosong');
            return;
        }

        if (newPassword.length < 6) {
            alert('Password minimal 6 karakter');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/admin/users/reset-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    newPassword: newPassword
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(`Password untuk ${selectedUser.nama} berhasil direset!`);
                setResetModalOpen(false);
            } else {
                alert(result.message || 'Gagal reset password');
            }
        } catch (error) {
            console.error('Reset error:', error);
            alert('Terjadi kesalahan saat reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manajemen User</h1>
                <p className="page-subtitle">Kelola data member dan akses akun</p>
            </div>

            <Card hover={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <CardTitle>Daftar Pengguna</CardTitle>
                    <div style={{ width: '300px' }}>
                        <Input
                            placeholder="Cari user (nama/email)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>ID</TableHeader>
                                <TableHeader>Nama</TableHeader>
                                <TableHeader>Kontak</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            Tidak ada user ditemukan
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell>#{index + 1}</TableCell>
                                        <TableCell>
                                            <div style={{ fontWeight: 600 }}>{user.nama}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(user.createdAt)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ fontSize: '0.875rem' }}>{user.email}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.noHp}</div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <StatusBadge status={user.statusVerifikasi} />
                                        </TableCell>
                                        <TableCell align="center">
                                            {user.role !== 'admin' && (
                                                <Button size="sm" variant="secondary" onClick={() => handleOpenReset(user)}>
                                                    Reset Password
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Reset Password Modal */}
            <Modal
                isOpen={resetModalOpen}
                onClose={() => setResetModalOpen(false)}
                title="Reset Password Member"
            >
                <div>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Anda akan mengubah password untuk user <strong>{selectedUser?.nama}</strong>.
                        Tindakan ini tidak dapat dibatalkan.
                    </p>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password Baru</label>
                        <Input
                            type="text"
                            placeholder="Masukkan password baru..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Minimal 6 karakter.
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleResetPassword}
                            isLoading={isSubmitting}
                        >
                            Reset Password
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
