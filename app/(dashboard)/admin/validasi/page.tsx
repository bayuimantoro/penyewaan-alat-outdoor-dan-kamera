'use client';

import React, { useState } from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, TableEmpty } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

// Type for displayed member
interface DisplayMember {
    id: number;
    nama: string;
    email: string;
    noHp: string;
    alamat: string;
    statusVerifikasi: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function ValidasiMemberPage() {
    const { registeredUsers, updateUserStatus, deleteUser } = useAuth();
    const [selectedMember, setSelectedMember] = useState<DisplayMember | null>(null);

    // Filter only members from AuthContext
    const members: DisplayMember[] = registeredUsers
        .filter(u => u.role === 'member')
        .map(u => ({
            id: u.id,
            nama: u.nama,
            email: u.email,
            noHp: u.noHp,
            alamat: u.alamat,
            statusVerifikasi: u.statusVerifikasi,
            createdAt: u.createdAt,
        }));

    const handleApprove = (member: DisplayMember) => {
        updateUserStatus(member.id, 'approved');
        // Update selected member too if modal is open
        if (selectedMember && selectedMember.id === member.id) {
            setSelectedMember({ ...member, statusVerifikasi: 'approved' });
        }
        alert(`Member ${member.nama} berhasil di-approve! Sekarang bisa login.`);
    };

    const handleReject = (member: DisplayMember) => {
        if (confirm(`Yakin ingin menolak member ${member.nama}?`)) {
            updateUserStatus(member.id, 'rejected');
            // Update selected member too if modal is open
            if (selectedMember && selectedMember.id === member.id) {
                setSelectedMember({ ...member, statusVerifikasi: 'rejected' });
            }
            alert(`Member ${member.nama} ditolak!`);
        }
    };

    const handleDelete = (member: DisplayMember) => {
        if (confirm(`Yakin ingin menghapus member ${member.nama}? Data user akan hilang permanen.`)) {
            deleteUser(member.id);
            alert(`Member ${member.nama} berhasil dihapus!`);
        }
    };

    // Stats
    const pendingCount = members.filter(m => m.statusVerifikasi === 'pending').length;
    const approvedCount = members.filter(m => m.statusVerifikasi === 'approved').length;
    const rejectedCount = members.filter(m => m.statusVerifikasi === 'rejected').length;

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Validasi Member</h1>
                <p className="page-subtitle">Verifikasi data pendaftaran member baru</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Pending', value: pendingCount, color: 'var(--warning)' },
                    { label: 'Approved', value: approvedCount, color: 'var(--success)' },
                    { label: 'Rejected', value: rejectedCount, color: 'var(--error)' },
                ].map((stat, idx) => (
                    <Card key={idx} hover={false}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Member Table */}
            <Card hover={false}>
                <CardTitle>Daftar Member</CardTitle>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeader>Nama</TableHeader>
                                <TableHeader>Email</TableHeader>
                                <TableHeader>No. HP</TableHeader>
                                <TableHeader>Tanggal Daftar</TableHeader>
                                <TableHeader align="center">Status</TableHeader>
                                <TableHeader align="center">Aksi</TableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {members.length === 0 ? (
                                <TableEmpty message="Belum ada member" />
                            ) : (
                                members.map(member => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--primary-400)' }}>
                                                    {member.nama.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{member.nama}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>{member.noHp}</TableCell>
                                        <TableCell>{formatDate(member.createdAt)}</TableCell>
                                        <TableCell align="center"><StatusBadge status={member.statusVerifikasi} /></TableCell>
                                        <TableCell align="center">
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <Button size="sm" variant="secondary" onClick={() => setSelectedMember(member)}>Detail</Button>
                                                {member.statusVerifikasi === 'pending' && (
                                                    <>
                                                        <Button size="sm" onClick={() => handleApprove(member)} style={{ background: 'var(--success)' }}>Approve</Button>
                                                        <Button size="sm" variant="secondary" onClick={() => handleReject(member)} style={{ color: 'var(--error)' }}>Reject</Button>
                                                    </>
                                                )}
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(member)}>Hapus</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <Modal isOpen={!!selectedMember} onClose={() => setSelectedMember(null)} title="Detail Member" size="md"
                footer={
                    selectedMember?.statusVerifikasi === 'pending' ? (
                        <>
                            <Button variant="secondary" onClick={() => handleReject(selectedMember!)} style={{ color: 'var(--error)' }}>Reject</Button>
                            <Button onClick={() => handleApprove(selectedMember!)} style={{ background: 'var(--success)' }}>Approve</Button>
                        </>
                    ) : (
                        <Button variant="secondary" onClick={() => setSelectedMember(null)}>Tutup</Button>
                    )
                }
            >
                {selectedMember && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Nama Lengkap</div>
                                <div style={{ fontWeight: 600 }}>{selectedMember.nama}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</div>
                                <div>{selectedMember.email}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>No. HP</div>
                                <div>{selectedMember.noHp}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
                                <StatusBadge status={selectedMember.statusVerifikasi} />
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Alamat</div>
                            <div>{selectedMember.alamat}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Foto KTP</div>
                            <div style={{ padding: '2rem', background: 'var(--bg-tertiary)', borderRadius: '0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 0.5rem' }}>
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p>KTP preview placeholder</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
