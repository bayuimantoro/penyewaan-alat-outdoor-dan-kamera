import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface TransaksiRow extends RowDataPacket {
    id: number;
    kode: string;
    user_id: number;
    user_nama: string;
    promo_id: number | null;
    tanggal_booking: Date;
    tanggal_mulai: string;
    tanggal_selesai: string;
    total_hari: number;
    subtotal: number;
    diskon: number;
    denda: number;
    total: number;
    status: string;
    created_at: Date;
}

interface DetailTransaksiRow extends RowDataPacket {
    id: number;
    transaksi_id: number;
    barang_id: number;
    barang_nama: string;
    harga_sewa: number;
    qty: number;
    subtotal: number;
}

// GET - Ambil semua transaksi dengan detail
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        let query = `
            SELECT t.*, u.nama as user_nama 
            FROM transaksi t 
            LEFT JOIN users u ON t.user_id = u.id
        `;
        const params: any[] = [];

        const conditions = [];
        if (userId) {
            conditions.push('t.user_id = ?');
            params.push(userId);
        }
        if (status) {
            conditions.push('t.status = ?');
            params.push(status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY t.created_at DESC';

        const [transactions] = await pool.query<TransaksiRow[]>(query, params);

        const [details] = await pool.query<DetailTransaksiRow[]>(`
            SELECT dt.*, b.nama as barang_nama 
            FROM detail_transaksi dt
            LEFT JOIN barang b ON dt.barang_id = b.id
        `);

        // Transform to match frontend format
        const transaksi = transactions.map(t => ({
            id: t.id,
            kode: t.kode,
            userId: t.user_id,
            namaPenyewa: t.user_nama,
            tanggalMulai: t.tanggal_mulai,
            tanggalSelesai: t.tanggal_selesai,
            totalHari: t.total_hari,
            subtotal: t.subtotal,
            totalHarga: t.total,
            diskon: t.diskon,
            denda: t.denda,
            status: t.status,
            createdAt: t.created_at
        }));

        const detailTransaksi = details.map(d => ({
            id: d.id,
            transaksiId: d.transaksi_id,
            barangId: d.barang_id,
            namaBarang: d.barang_nama,
            qty: d.qty,
            hargaSewa: d.harga_sewa,
            subtotal: d.subtotal
        }));

        return NextResponse.json({
            success: true,
            transaksi,
            detailTransaksi
        });
    } catch (error: any) {
        console.error('Get Transaksi Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data transaksi', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Buat transaksi baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, tanggalMulai, tanggalSelesai, totalHari, subtotal, diskon, total, promoId, status, details } = body;

        if (!userId || !tanggalMulai || !tanggalSelesai || !details || details.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Data transaksi tidak lengkap' },
                { status: 400 }
            );
        }

        // Generate transaction code
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const kode = `TRX${dateStr}${randomNum}`;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [transaksiResult] = await connection.query<ResultSetHeader>(
                `INSERT INTO transaksi (kode, user_id, promo_id, tanggal_mulai, tanggal_selesai, total_hari, subtotal, diskon, denda, total, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
                [kode, userId, promoId || null, tanggalMulai, tanggalSelesai, totalHari || 1, subtotal || total, diskon || 0, total, status || 'menunggu_pembayaran']
            );

            const transaksiId = transaksiResult.insertId;

            for (const item of details) {
                await connection.query(
                    `INSERT INTO detail_transaksi (transaksi_id, barang_id, harga_sewa, qty, subtotal) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [transaksiId, item.barangId, item.hargaSewa, item.qty, item.subtotal]
                );
            }

            await connection.commit();
            connection.release();

            return NextResponse.json({
                success: true,
                message: 'Transaksi berhasil dibuat',
                transaksiId,
                kode
            });
        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }
    } catch (error: any) {
        console.error('Add Transaksi Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal membuat transaksi', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update status transaksi
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, denda } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, message: 'ID dan status wajib diisi' },
                { status: 400 }
            );
        }

        let query = 'UPDATE transaksi SET status = ?';
        const params: any[] = [status];

        if (denda !== undefined) {
            query += ', denda = ?, total = subtotal - diskon + ?';
            params.push(denda, denda);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await pool.query<ResultSetHeader>(query, params);

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Transaksi tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Status transaksi berhasil diupdate'
        });
    } catch (error: any) {
        console.error('Update Transaksi Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal update transaksi', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Hapus transaksi
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID transaksi wajib diisi' },
                { status: 400 }
            );
        }

        await pool.query('DELETE FROM detail_transaksi WHERE transaksi_id = ?', [id]);

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM transaksi WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Transaksi tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Transaksi berhasil dihapus'
        });
    } catch (error: any) {
        console.error('Delete Transaksi Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus transaksi', error: error.message },
            { status: 500 }
        );
    }
}
