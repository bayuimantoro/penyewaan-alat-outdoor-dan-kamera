import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface PromoRow extends RowDataPacket {
    id: number;
    nama: string;
    kode: string;
    diskon_persen: number;
    tanggal_mulai: string;
    tanggal_berakhir: string;
    is_active: boolean;
    created_at: Date;
}

// GET - Ambil semua promo
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const kode = searchParams.get('kode');

        if (kode) {
            // Get promo by kode (for validation during cart)
            const [rows] = await pool.query<PromoRow[]>(
                `SELECT * FROM promo WHERE kode = ? AND is_active = TRUE 
                 AND CURDATE() BETWEEN tanggal_mulai AND tanggal_berakhir`,
                [kode.toUpperCase()]
            );

            if (rows.length === 0) {
                return NextResponse.json(
                    { success: false, message: 'Kode promo tidak valid atau sudah kadaluarsa' },
                    { status: 404 }
                );
            }

            const p = rows[0];
            return NextResponse.json({
                success: true,
                promo: {
                    id: p.id,
                    kode: p.kode,
                    nama: p.nama,
                    tipeDiskon: 'persentase',
                    nilaiDiskon: p.diskon_persen,
                    tanggalMulai: p.tanggal_mulai,
                    tanggalSelesai: p.tanggal_berakhir,
                    status: p.is_active ? 'aktif' : 'nonaktif'
                }
            });
        }

        // Get all promos
        const [rows] = await pool.query<PromoRow[]>(
            'SELECT * FROM promo ORDER BY created_at DESC'
        );

        const promos = rows.map(p => ({
            id: p.id,
            kode: p.kode,
            nama: p.nama,
            deskripsi: `Diskon ${p.diskon_persen}%`,
            tipeDiskon: 'persentase',
            nilaiDiskon: p.diskon_persen,
            minTransaksi: 0,
            maxDiskon: null,
            tanggalMulai: p.tanggal_mulai,
            tanggalSelesai: p.tanggal_berakhir,
            status: p.is_active ? 'aktif' : 'nonaktif',
            createdAt: p.created_at
        }));

        return NextResponse.json({ success: true, promos });
    } catch (error: any) {
        console.error('Get Promo Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data promo', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Tambah promo baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { kode, nama, nilaiDiskon, tanggalMulai, tanggalSelesai, status } = body;

        if (!kode || !nama || !nilaiDiskon || !tanggalMulai || !tanggalSelesai) {
            return NextResponse.json(
                { success: false, message: 'Data promo tidak lengkap' },
                { status: 400 }
            );
        }

        // Check if kode already exists
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT id FROM promo WHERE kode = ?',
            [kode.toUpperCase()]
        );

        if (existing.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Kode promo sudah digunakan' },
                { status: 400 }
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO promo (kode, nama, diskon_persen, tanggal_mulai, tanggal_berakhir, is_active) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [kode.toUpperCase(), nama, nilaiDiskon, tanggalMulai, tanggalSelesai, status === 'aktif']
        );

        return NextResponse.json({
            success: true,
            message: 'Promo berhasil ditambahkan',
            id: result.insertId
        });
    } catch (error: any) {
        console.error('Add Promo Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal menambah promo', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update promo
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, kode, nama, nilaiDiskon, tanggalMulai, tanggalSelesai, status } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID promo wajib diisi' },
                { status: 400 }
            );
        }

        // If only toggling status
        if (status !== undefined && Object.keys(body).length === 2) {
            const [result] = await pool.query<ResultSetHeader>(
                'UPDATE promo SET is_active = ? WHERE id = ?',
                [status === 'aktif', id]
            );

            if (result.affectedRows === 0) {
                return NextResponse.json(
                    { success: false, message: 'Promo tidak ditemukan' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Status promo berhasil diupdate'
            });
        }

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE promo SET kode = ?, nama = ?, diskon_persen = ?, 
             tanggal_mulai = ?, tanggal_berakhir = ?, is_active = ? WHERE id = ?`,
            [kode?.toUpperCase(), nama, nilaiDiskon, tanggalMulai, tanggalSelesai, status === 'aktif', id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Promo tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Promo berhasil diupdate'
        });
    } catch (error: any) {
        console.error('Update Promo Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal update promo', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Hapus promo
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID promo wajib diisi' },
                { status: 400 }
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM promo WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Promo tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Promo berhasil dihapus'
        });
    } catch (error: any) {
        console.error('Delete Promo Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus promo', error: error.message },
            { status: 500 }
        );
    }
}
