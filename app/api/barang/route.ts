import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface BarangRow extends RowDataPacket {
    id: number;
    kode: string;
    nama: string;
    kategori_id: number;
    kategori_nama: string;
    deskripsi: string;
    harga_sewa_per_hari: number;
    stok: number;
    foto: string | null;
    status: 'tersedia' | 'disewa' | 'maintenance' | 'rusak';
    created_at: Date;
}

// GET - Ambil semua barang dengan kategori
export async function GET() {
    try {
        const [rows] = await pool.query<BarangRow[]>(`
            SELECT b.*, k.nama as kategori_nama 
            FROM barang b 
            LEFT JOIN kategori k ON b.kategori_id = k.id 
            ORDER BY b.id ASC
        `);

        // Transform to match frontend format
        const barang = rows.map(row => ({
            id: row.id,
            kode: row.kode,
            nama: row.nama,
            kategori: row.kategori_nama || 'Uncategorized',
            kategoriId: row.kategori_id,
            deskripsi: row.deskripsi,
            hargaSewa: row.harga_sewa_per_hari,
            stok: row.stok,
            gambar: row.foto || '/images/placeholder.jpg',
            status: row.status,
            createdAt: row.created_at
        }));

        return NextResponse.json({ success: true, barang });
    } catch (error: any) {
        console.error('Get Barang Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data barang', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Tambah barang baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { kode, nama, kategoriId, hargaSewa, stok, deskripsi, gambar, status } = body;

        if (!kode || !nama || !kategoriId || !hargaSewa) {
            return NextResponse.json(
                { success: false, message: 'Kode, nama, kategori, dan harga sewa wajib diisi' },
                { status: 400 }
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO barang (kode, nama, kategori_id, harga_sewa_per_hari, stok, deskripsi, foto, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [kode, nama, kategoriId, hargaSewa, stok || 0, deskripsi || '', gambar || null, status || 'tersedia']
        );

        return NextResponse.json({
            success: true,
            message: 'Barang berhasil ditambahkan',
            id: result.insertId
        });
    } catch (error: any) {
        console.error('Add Barang Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal menambah barang', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update barang (supports partial updates)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, kode, nama, kategoriId, hargaSewa, stok, deskripsi, gambar, status } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID barang wajib diisi' },
                { status: 400 }
            );
        }

        // Build dynamic update query based on provided fields
        const updates: string[] = [];
        const params: any[] = [];

        if (kode !== undefined) { updates.push('kode = ?'); params.push(kode); }
        if (nama !== undefined) { updates.push('nama = ?'); params.push(nama); }
        if (kategoriId !== undefined) { updates.push('kategori_id = ?'); params.push(kategoriId); }
        if (hargaSewa !== undefined) { updates.push('harga_sewa_per_hari = ?'); params.push(hargaSewa); }
        if (stok !== undefined) { updates.push('stok = ?'); params.push(stok); }
        if (deskripsi !== undefined) { updates.push('deskripsi = ?'); params.push(deskripsi); }
        if (gambar !== undefined) { updates.push('foto = ?'); params.push(gambar); }
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }

        if (updates.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Tidak ada data yang diupdate' },
                { status: 400 }
            );
        }

        params.push(id);
        const query = `UPDATE barang SET ${updates.join(', ')} WHERE id = ?`;

        const [result] = await pool.query<ResultSetHeader>(query, params);

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Barang tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Barang berhasil diupdate'
        });
    } catch (error: any) {
        console.error('Update Barang Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengupdate barang', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Hapus barang
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID barang wajib diisi' },
                { status: 400 }
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM barang WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Barang tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Barang berhasil dihapus'
        });
    } catch (error: any) {
        console.error('Delete Barang Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus barang', error: error.message },
            { status: 500 }
        );
    }
}
