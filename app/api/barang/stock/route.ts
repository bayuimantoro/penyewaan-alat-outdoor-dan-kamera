import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// PATCH - Update stok barang (untuk checkout/return/maintenance/repair)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, action, qty } = body; // action: 'decrease', 'increase', 'maintenance', 'rusak', 'repair'

        if (!id || !action || !qty) {
            return NextResponse.json(
                { success: false, message: 'id, action, dan qty wajib diisi' },
                { status: 400 }
            );
        }

        // Get current stock
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT stok, status, stok_maintenance, stok_rusak FROM barang WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Barang tidak ditemukan' },
                { status: 404 }
            );
        }

        const currentStok = rows[0].stok;
        let newStok: number = currentStok;
        let newStatus: string = rows[0].status;

        // Handle Actions
        if (action === 'decrease') {
            newStok = Math.max(0, currentStok - qty);
            // Auto-update status if stock becomes 0
            if (newStok === 0) newStatus = 'disewa';

            await pool.query(
                'UPDATE barang SET stok = ?, status = ? WHERE id = ?',
                [newStok, newStatus, id]
            );

        } else if (action === 'increase') {
            newStok = currentStok + qty;
            // Auto-update status back to tersedia if was disewa
            if (rows[0].status === 'disewa' && newStok > 0) newStatus = 'tersedia';

            await pool.query(
                'UPDATE barang SET stok = ?, status = ? WHERE id = ?',
                [newStok, newStatus, id]
            );

        } else if (action === 'maintenance') {
            // Move from 'virtual' rented/missing to maintenance
            // In inspection flow, items are not in 'stok' (they were decreased at checkout).
            // So we simply increment stok_maintenance without touching 'stok' (active stock).
            await pool.query('UPDATE barang SET stok_maintenance = stok_maintenance + ? WHERE id = ?', [qty, id]);

            return NextResponse.json({
                success: true,
                message: 'Stok maintenance bertambah',
                newStok: currentStok
            });

        } else if (action === 'rusak') {
            // Move from 'virtual' rented/missing to rusak
            await pool.query('UPDATE barang SET stok_rusak = stok_rusak + ? WHERE id = ?', [qty, id]);

            return NextResponse.json({
                success: true,
                message: 'Stok rusak bertambah',
                newStok: currentStok
            });

        } else if (action === 'repair') {
            // Move from Maintenance -> Tersedia
            // Validation: ensure enough maintenance stock
            if ((rows[0].stok_maintenance || 0) < qty) {
                return NextResponse.json({ success: false, message: 'Stok maintenance tidak cukup' }, { status: 400 });
            }

            await pool.query('UPDATE barang SET stok_maintenance = stok_maintenance - ? WHERE id = ?', [qty, id]);
            newStok = currentStok + qty;

            // If we are adding stock, status should be available
            if (newStatus !== 'tersedia') newStatus = 'tersedia';

            await pool.query('UPDATE barang SET stok = ?, status = ? WHERE id = ?', [newStok, newStatus, id]);

            return NextResponse.json({
                success: true,
                message: 'Barang berhasil diperbaiki (Stok kembali tersedia)',
                newStok: newStok
            });

        } else {
            return NextResponse.json(
                { success: false, message: 'Action tidak valid' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Update berhasil`,
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
