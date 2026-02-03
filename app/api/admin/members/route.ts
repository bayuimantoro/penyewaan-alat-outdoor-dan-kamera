import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UserRow extends RowDataPacket {
    id: number;
    nama: string;
    email: string;
    no_hp: string;
    alamat: string;
    role: string;
    status_verifikasi: string;
    foto_ktp: string | null;
    created_at: Date;
}

// GET - Ambil semua member untuk validasi
export async function GET() {
    try {
        const [users] = await pool.query<UserRow[]>(
            `SELECT id, nama, email, no_hp, alamat, role, status_verifikasi, foto_ktp, created_at 
             FROM users 
             WHERE role = 'member' 
             ORDER BY created_at DESC`
        );

        // Transform to match frontend format
        const members = users.map((user: UserRow) => ({
            id: user.id,
            nama: user.nama,
            email: user.email,
            noHp: user.no_hp,
            alamat: user.alamat,
            role: user.role,
            statusVerifikasi: user.status_verifikasi,
            fotoKtp: user.foto_ktp,
            createdAt: user.created_at
        }));

        return NextResponse.json({
            success: true,
            members
        });

    } catch (error: any) {
        console.error('Get Members Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update status verifikasi member
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        // Accept both parameter formats for compatibility
        const userId = body.userId || body.id;
        const status = body.status || body.statusVerifikasi;

        // Validate required fields
        if (!userId || !status) {
            return NextResponse.json(
                { success: false, message: 'userId dan status wajib diisi' },
                { status: 400 }
            );
        }

        // Validate status value
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Status tidak valid' },
                { status: 400 }
            );
        }

        // Update user status
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE users SET status_verifikasi = ? WHERE id = ?',
            [status, userId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Status user berhasil diubah ke ${status}`
        });

    } catch (error: any) {
        console.error('Update Status Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Hapus member beserta file KTP
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'userId wajib diisi' },
                { status: 400 }
            );
        }

        // First, get the user to find KTP file path
        const [users] = await pool.query<UserRow[]>(
            'SELECT foto_ktp FROM users WHERE id = ? AND role = "member"',
            [userId]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'User tidak ditemukan atau bukan member' },
                { status: 404 }
            );
        }

        const fotoKtpPath = users[0].foto_ktp;

        // Delete KTP file if exists
        if (fotoKtpPath) {
            const fs = require('fs');
            const path = require('path');
            const fullPath = path.join(process.cwd(), 'public', fotoKtpPath);

            try {
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log('KTP file deleted:', fullPath);
                }
            } catch (fileError) {
                // Log but don't fail if file deletion fails
                console.error('Failed to delete KTP file:', fileError);
            }
        }

        // Delete user from database
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM users WHERE id = ? AND role = "member"',
            [userId]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Gagal menghapus user' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Member dan data KTP berhasil dihapus'
        });

    } catch (error: any) {
        console.error('Delete User Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server', error: error.message },
            { status: 500 }
        );
    }
}
