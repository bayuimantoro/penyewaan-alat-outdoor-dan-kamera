import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface KategoriRow extends RowDataPacket {
    id: number;
    nama: string;
    deskripsi: string;
    icon: string;
    created_at: Date;
}

// GET - Ambil semua kategori
export async function GET() {
    try {
        const [rows] = await pool.query<KategoriRow[]>(
            'SELECT * FROM kategori ORDER BY nama ASC'
        );

        const kategori = rows.map(row => ({
            id: row.id,
            nama: row.nama,
            deskripsi: row.deskripsi,
            icon: row.icon,
            createdAt: row.created_at
        }));

        return NextResponse.json({ success: true, kategori });
    } catch (error: any) {
        console.error('Get Kategori Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data kategori', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Tambah kategori baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nama, deskripsi, icon } = body;

        if (!nama) {
            return NextResponse.json(
                { success: false, message: 'Nama kategori wajib diisi' },
                { status: 400 }
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO kategori (nama, deskripsi, icon) VALUES (?, ?, ?)',
            [nama, deskripsi || '', icon || 'package']
        );

        return NextResponse.json({
            success: true,
            message: 'Kategori berhasil ditambahkan',
            id: result.insertId
        });
    } catch (error: any) {
        console.error('Add Kategori Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal menambah kategori', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update kategori
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, nama, deskripsi, icon } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID kategori wajib diisi' },
                { status: 400 }
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE kategori SET nama = ?, deskripsi = ?, icon = ? WHERE id = ?',
            [nama, deskripsi, icon, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Kategori tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Kategori berhasil diupdate'
        });
    } catch (error: any) {
        console.error('Update Kategori Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal update kategori', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Hapus kategori
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID kategori wajib diisi' },
                { status: 400 }
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM kategori WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Kategori tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Kategori berhasil dihapus'
        });
    } catch (error: any) {
        console.error('Delete Kategori Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus kategori', error: error.message },
            { status: 500 }
        );
    }
}
