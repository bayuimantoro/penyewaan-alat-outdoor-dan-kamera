import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nama, email, password, noHp, alamat } = body;

        // Validate required fields
        if (!nama || !email || !password) {
            return NextResponse.json(
                { success: false, message: 'Nama, email, dan password wajib diisi' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const [existingUsers] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Email sudah terdaftar!' },
                { status: 400 }
            );
        }

        // Hash password with bcrypt (salt rounds = 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user with hashed password - auto approved
        const [result] = await pool.query(
            `INSERT INTO users (nama, email, password, no_hp, alamat, role, status_verifikasi) 
             VALUES (?, ?, ?, ?, ?, 'member', 'approved')`,
            [nama, email.toLowerCase(), hashedPassword, noHp || null, alamat || null]
        );

        return NextResponse.json({
            success: true,
            message: 'Registrasi berhasil! Silakan login dengan email dan password Anda.'
        });

    } catch (error: any) {
        console.error('Register Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server', error: error.message },
            { status: 500 }
        );
    }
}
