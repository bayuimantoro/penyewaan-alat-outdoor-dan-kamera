import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

interface UserRow extends RowDataPacket {
    id: number;
    nama: string;
    email: string;
    password: string;
    no_hp: string;
    alamat: string;
    role: 'admin' | 'gudang' | 'member';
    status_verifikasi: 'pending' | 'approved' | 'rejected';
    created_at: Date;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email dan password wajib diisi' },
                { status: 400 }
            );
        }

        // Find user by email only (will verify password with bcrypt)
        const [users] = await pool.query<UserRow[]>(
            'SELECT * FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Email atau password salah!' },
                { status: 401 }
            );
        }

        const user = users[0];

        // Verify password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Email atau password salah!' },
                { status: 401 }
            );
        }

        // Check verification status
        if (user.status_verifikasi === 'pending') {
            return NextResponse.json(
                { success: false, message: 'Akun Anda belum diverifikasi oleh admin.' },
                { status: 403 }
            );
        }

        if (user.status_verifikasi === 'rejected') {
            return NextResponse.json(
                { success: false, message: 'Akun Anda ditolak. Silakan hubungi admin.' },
                { status: 403 }
            );
        }

        // Create user data for session (exclude password)
        const userData = {
            id: user.id,
            nama: user.nama,
            email: user.email,
            noHp: user.no_hp,
            alamat: user.alamat,
            role: user.role,
            statusVerifikasi: user.status_verifikasi,
            createdAt: user.created_at
        };

        // Create response with session cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login berhasil!',
            role: user.role,
            user: userData
        });

        // Set session cookie (HTTP-only for security)
        response.cookies.set('session', JSON.stringify(userData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/'
        });

        return response;

    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server', error: error.message },
            { status: 500 }
        );
    }
}
