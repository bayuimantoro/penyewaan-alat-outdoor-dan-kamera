import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
    id: number;
    nama: string;
    email: string;
    no_hp: string;
    alamat: string;
    role: 'admin' | 'gudang' | 'member';
    foto_ktp: string | null;
    status_verifikasi: 'pending' | 'approved' | 'rejected';
    created_at: Date;
}

// GET - Ambil semua users atau by role
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const status = searchParams.get('status');

        let query = 'SELECT id, nama, email, no_hp, alamat, role, foto_ktp, status_verifikasi, created_at FROM users';
        const params: any[] = [];
        const conditions: string[] = [];

        if (role) {
            conditions.push('role = ?');
            params.push(role);
        }
        if (status) {
            conditions.push('status_verifikasi = ?');
            params.push(status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await pool.query<UserRow[]>(query, params);

        const users = rows.map((user: UserRow) => ({
            id: user.id,
            nama: user.nama,
            email: user.email,
            noHp: user.no_hp,
            alamat: user.alamat,
            role: user.role,
            fotoKtp: user.foto_ktp,
            statusVerifikasi: user.status_verifikasi,
            createdAt: user.created_at
        }));

        return NextResponse.json({ success: true, users });
    } catch (error: any) {
        console.error('Get Users Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data users', error: error.message },
            { status: 500 }
        );
    }
}
