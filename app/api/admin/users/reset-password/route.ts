import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, newPassword } = body;

        if (!userId || !newPassword) {
            return NextResponse.json(
                { success: false, message: 'User ID dan password baru wajib diisi' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const connection = await pool.getConnection();
        try {
            await connection.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );

            return NextResponse.json({
                success: true,
                message: 'Password berhasil direset'
            });
        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Reset Password Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mereset password', error: error.message },
            { status: 500 }
        );
    }
}
