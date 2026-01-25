import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface PembayaranRow extends RowDataPacket {
    id: number;
    transaksi_id: number;
    jenis: 'dp' | 'pelunasan' | 'denda';
    jumlah: number;
    bukti_bayar: string | null;
    status: 'pending' | 'verified' | 'rejected';
    keterangan: string | null;
    created_at: Date;
    verified_at: Date | null;
    verified_by: number | null;
    // Joined fields
    transaksi_kode?: string;
    verifier_nama?: string;
}

// GET - Ambil pembayaran (all atau by transaksi_id)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const transaksiId = searchParams.get('transaksiId');
        const status = searchParams.get('status');

        let query = `
            SELECT p.*, t.kode as transaksi_kode, u.nama as verifier_nama
            FROM pembayaran p
            LEFT JOIN transaksi t ON p.transaksi_id = t.id
            LEFT JOIN users u ON p.verified_by = u.id
        `;
        const params: any[] = [];
        const conditions: string[] = [];

        if (transaksiId) {
            conditions.push('p.transaksi_id = ?');
            params.push(transaksiId);
        }
        if (status) {
            conditions.push('p.status = ?');
            params.push(status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.created_at DESC';

        const [rows] = await pool.query<PembayaranRow[]>(query, params);

        const pembayaran = rows.map((p: PembayaranRow) => ({
            id: p.id,
            transaksiId: p.transaksi_id,
            transaksiKode: p.transaksi_kode,
            jenis: p.jenis,
            jumlah: p.jumlah,
            buktiBayar: p.bukti_bayar,
            status: p.status,
            keterangan: p.keterangan,
            createdAt: p.created_at,
            verifiedAt: p.verified_at,
            verifiedBy: p.verified_by,
            verifierNama: p.verifier_nama
        }));

        return NextResponse.json({ success: true, pembayaran });
    } catch (error: any) {
        console.error('Get Pembayaran Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data pembayaran', error: error.message },
            { status: 500 }
        );
    }
}

// POST - Buat pembayaran baru
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transaksiId, jenis, jumlah, buktiBayar, keterangan } = body;

        if (!transaksiId || !jenis || !jumlah) {
            return NextResponse.json(
                { success: false, message: 'transaksiId, jenis, dan jumlah wajib diisi' },
                { status: 400 }
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO pembayaran (transaksi_id, jenis, jumlah, bukti_bayar, status, keterangan) 
             VALUES (?, ?, ?, ?, 'pending', ?)`,
            [transaksiId, jenis, jumlah, buktiBayar || null, keterangan || null]
        );

        return NextResponse.json({
            success: true,
            message: 'Pembayaran berhasil dicatat',
            id: result.insertId
        });
    } catch (error: any) {
        console.error('Add Pembayaran Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mencatat pembayaran', error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update status pembayaran (verify/reject)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, keterangan, verifiedBy } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, message: 'ID dan status wajib diisi' },
                { status: 400 }
            );
        }

        const updates: string[] = ['status = ?'];
        const params: any[] = [status];

        if (keterangan !== undefined) {
            updates.push('keterangan = ?');
            params.push(keterangan);
        }

        if (status === 'verified' || status === 'rejected') {
            updates.push('verified_at = NOW()');
            if (verifiedBy) {
                updates.push('verified_by = ?');
                params.push(verifiedBy);
            }
        }

        params.push(id);
        const query = `UPDATE pembayaran SET ${updates.join(', ')} WHERE id = ?`;

        const [result] = await pool.query<ResultSetHeader>(query, params);

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Pembayaran tidak ditemukan' },
                { status: 404 }
            );
        }

        // If payment is verified, also update transaction status
        if (status === 'verified') {
            // Get the transaction ID
            const [pembayaranRows] = await pool.query<RowDataPacket[]>(
                'SELECT transaksi_id FROM pembayaran WHERE id = ?',
                [id]
            );

            if (pembayaranRows.length > 0) {
                // Update transaction status to menunggu_konfirmasi (waiting for item pickup)
                await pool.query(
                    "UPDATE transaksi SET status = 'menunggu_konfirmasi' WHERE id = ? AND status = 'menunggu_pembayaran'",
                    [pembayaranRows[0].transaksi_id]
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: `Pembayaran berhasil di-${status === 'verified' ? 'verifikasi' : 'tolak'}`
        });
    } catch (error: any) {
        console.error('Update Pembayaran Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal update pembayaran', error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Hapus pembayaran
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID pembayaran wajib diisi' },
                { status: 400 }
            );
        }

        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM pembayaran WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { success: false, message: 'Pembayaran tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Pembayaran berhasil dihapus'
        });
    } catch (error: any) {
        console.error('Delete Pembayaran Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus pembayaran', error: error.message },
            { status: 500 }
        );
    }
}
