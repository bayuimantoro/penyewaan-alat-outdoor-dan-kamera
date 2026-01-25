import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// PATCH - Update stok barang (untuk checkout/return)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, action, qty } = body; // action: 'decrease' atau 'increase'

        if (!id || !action || !qty) {
            return NextResponse.json(
                { success: false, message: 'id, action, dan qty wajib diisi' },
                { status: 400 }
            );
        }

        // Get current stock
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT stok, status FROM barang WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Barang tidak ditemukan' },
                { status: 404 }
            );
        }

        const currentStok = rows[0].stok;
        let newStok: number;
        let newStatus: string = rows[0].status;

        if (action === 'decrease') {
            newStok = Math.max(0, currentStok - qty);
            // Auto-update status if stock becomes 0
            if (newStok === 0) newStatus = 'disewa';
        } else if (action === 'increase') {
            newStok = currentStok + qty;
            // Auto-update status back to tersedia if was disewa
            if (rows[0].status === 'disewa' && newStok > 0) newStatus = 'tersedia';
        } else {
            return NextResponse.json(
                { success: false, message: 'Action tidak valid (gunakan decrease/increase)' },
                { status: 400 }
            );
        }

        await pool.query<ResultSetHeader>(
            'UPDATE barang SET stok = ?, status = ? WHERE id = ?',
            [newStok, newStatus, id]
        );

        return NextResponse.json({
            success: true,
            message: `Stok berhasil di${action === 'decrease' ? 'kurangi' : 'tambah'}`,
            newStok,
            newStatus
        });
    } catch (error: any) {
        console.error('Update Stock Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal update stok', error: error.message },
            { status: 500 }
        );
    }
}
