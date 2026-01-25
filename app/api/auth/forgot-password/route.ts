import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';

// POST - Verify email exists
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email wajib diisi' },
                { status: 400 }
            );
        }

        // Check if email exists
        const [users] = await pool.query<RowDataPacket[]>(
            'SELECT id, nama, email FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Email tidak terdaftar' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Email ditemukan. Silakan buat password baru.',
            user: {
                id: users[0].id,
                nama: users[0].nama,
                email: users[0].email
            }
        });

    } catch (error: any) {
        console.error('Verify Email Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Reset password
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, newPassword } = body;

        if (!email || !newPassword) {
            return NextResponse.json(
                { success: false, message: 'Email dan password baru wajib diisi' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password minimal 6 karakter' },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in database
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, email.toLowerCase()]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Email tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Password berhasil direset! Silakan login dengan password baru.'
        });

    } catch (error: any) {
        console.error('Reset Password Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server', error: error.message },
            { status: 500 }
        );
    }
}
