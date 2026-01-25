import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

// API endpoint untuk hash password demo users yang sudah ada di database
// Jalankan sekali dengan mengakses: GET /api/auth/hash-passwords

interface UserRow extends RowDataPacket {
    id: number;
    email: string;
    password: string;
}

// Demo passwords untuk user yang sudah ada
const demoPasswords: { [email: string]: string } = {
    'admin@rentalgear.com': 'admin123',
    'gudang@rentalgear.com': 'gudang123',
    'ahmad@gmail.com': 'member123'
};

export async function GET() {
    try {
        const results: string[] = [];

        for (const [email, password] of Object.entries(demoPasswords)) {
            // Check if user exists
            const [users] = await pool.query<UserRow[]>(
                'SELECT id, email, password FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                results.push(`❌ User ${email} tidak ditemukan`);
                continue;
            }

            const user = users[0];

            // Force re-hash demo passwords (old dummy hashes are not valid)
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update the password in database
            await pool.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, user.id]
            );

            results.push(`✅ Password ${email} berhasil di-hash`);
        }

        return NextResponse.json({
            success: true,
            message: 'Password hashing selesai!',
            results
        });

    } catch (error: any) {
        console.error('Hash Password Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan', error: error.message },
            { status: 500 }
        );
    }
}
