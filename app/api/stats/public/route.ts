import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
    try {
        // Count available items
        const [barangRows] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM barang WHERE status = 'tersedia'"
        );
        const alatTersedia = barangRows[0].count;

        // Count active members (approved)
        const [memberRows] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM users WHERE role = 'member' AND status_verifikasi = 'approved'"
        );
        const memberAktif = memberRows[0].count;

        // Count successful transactions
        const [transaksiRows] = await pool.query<RowDataPacket[]>(
            "SELECT COUNT(*) as count FROM transaksi WHERE status = 'selesai'"
        );
        const transaksiSukses = transaksiRows[0].count;

        return NextResponse.json({
            success: true,
            stats: {
                alatTersedia,
                memberAktif,
                transaksiSukses
            }
        });

    } catch (error: any) {
        console.error('Get Public Stats Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data statistik' },
            { status: 500 }
        );
    }
}
