import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

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

export async function GET(request: NextRequest) {
    try {
        const sessionCookie = request.cookies.get('session');

        if (!sessionCookie?.value) {
            return NextResponse.json({
                success: false,
                user: null,
                message: 'Not authenticated'
            });
        }

        // Parse cookie to get user ID
        const sessionUser = JSON.parse(sessionCookie.value);
        const userId = sessionUser.id;

        if (!userId) {
            return NextResponse.json({
                success: false,
                user: null,
                message: 'Invalid session'
            });
        }

        // Fetch FRESH user data from database (not stale cookie data)
        const [users] = await pool.query<UserRow[]>(
            'SELECT id, nama, email, no_hp, alamat, role, status_verifikasi, foto_ktp, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return NextResponse.json({
                success: false,
                user: null,
                message: 'User not found'
            });
        }

        const dbUser = users[0];

        // Transform to frontend format
        const user = {
            id: dbUser.id,
            nama: dbUser.nama,
            email: dbUser.email,
            noHp: dbUser.no_hp,
            alamat: dbUser.alamat,
            role: dbUser.role,
            statusVerifikasi: dbUser.status_verifikasi,
            fotoKtp: dbUser.foto_ktp,
            createdAt: dbUser.created_at
        };

        // Update session cookie with fresh data
        const response = NextResponse.json({
            success: true,
            user: user
        });

        response.cookies.set('session', JSON.stringify(user), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return response;

    } catch (error: any) {
        console.error('Session Error:', error);
        return NextResponse.json({
            success: false,
            user: null,
            message: 'Invalid session'
        });
    }
}
