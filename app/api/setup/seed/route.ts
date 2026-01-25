import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { mockBarang, mockKategori, mockUsers, mockTransaksi, mockDetailTransaksi } from '@/lib/mock-data';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
    try {
        const connection = await pool.getConnection();

        try {
            // Disable foreign key checks to allow truncation
            await connection.query('SET FOREIGN_KEY_CHECKS = 0');

            // Ensure table `barang` has `merk` column
            try {
                await connection.query('ALTER TABLE barang ADD COLUMN merk VARCHAR(100) AFTER kategori_id');
            } catch (err: any) {
                if (err.code !== 'ER_DUP_FIELDNAME') console.warn('Warning adding merk:', err.message);
            }

            // Ensure table `barang` has `denda` column
            try {
                // Add denda column if not exists (using denda to match seed script logic)
                await connection.query('ALTER TABLE barang ADD COLUMN denda DECIMAL(12,2) DEFAULT 0 AFTER harga_sewa_per_hari');
            } catch (err: any) {
                if (err.code !== 'ER_DUP_FIELDNAME') console.warn('Warning adding denda:', err.message);
            }

            // Truncate tables
            await connection.query('TRUNCATE TABLE detail_transaksi');
            await connection.query('TRUNCATE TABLE transaksi');
            await connection.query('TRUNCATE TABLE barang');
            await connection.query('TRUNCATE TABLE kategori');
            await connection.query('TRUNCATE TABLE users');

            await connection.query('SET FOREIGN_KEY_CHECKS = 1');

            console.log('Tables truncated and schema patched');

            // Insert Users
            const hashedPassword = await bcrypt.hash('123456', 10);

            for (const user of mockUsers) {
                await connection.query(
                    `INSERT INTO users (id, nama, email, password, no_hp, alamat, role, status_verifikasi, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [user.id, user.nama, user.email, hashedPassword, user.noHp, user.alamat, user.role, user.statusVerifikasi, new Date()]
                );
            }
            console.log('Users seeded');

            // Insert Kategori
            for (const cat of mockKategori) {
                await connection.query(
                    'INSERT INTO kategori (id, nama, deskripsi, icon) VALUES (?, ?, ?, ?)',
                    [cat.id, cat.nama, cat.deskripsi, cat.icon]
                );
            }
            console.log('Kategori seeded');

            // Insert Barang
            for (const item of mockBarang) {
                await connection.query(
                    `INSERT INTO barang (id, kode, nama, kategori_id, merk, deskripsi, harga_sewa_per_hari, denda, stok, foto, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        item.id,
                        item.kode,
                        item.nama,
                        item.kategoriId,
                        item.merk,
                        item.deskripsi,
                        item.hargaSewaPerHari, // Correct column name
                        item.dendaPerHari,     // Correct column name (newly added)
                        item.stok,
                        JSON.stringify(item.foto),
                        item.status
                    ]
                );
            }
            console.log('Barang seeded');

            // Insert Transaksi
            for (const trx of mockTransaksi) {
                await connection.query(
                    `INSERT INTO transaksi (id, kode, user_id, tanggal_mulai, tanggal_selesai, total_hari, subtotal, diskon, denda, total, status, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        trx.id,
                        trx.kode,
                        trx.userId,
                        trx.tanggalMulai,
                        trx.tanggalSelesai,
                        trx.totalHari,
                        trx.subtotal,
                        trx.diskon,
                        trx.denda,
                        trx.total,
                        trx.status,
                        new Date(trx.createdAt) // Convert ISO string to Date object for MySQL
                    ]
                );
            }
            console.log('Transaksi seeded');

            // Insert Detail Transaksi
            for (const detail of mockDetailTransaksi) {
                await connection.query(
                    `INSERT INTO detail_transaksi (id, transaksi_id, barang_id, harga_sewa, qty, subtotal) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [detail.id, detail.transaksiId, detail.barangId, detail.hargaSewa, detail.qty, detail.subtotal]
                );
            }
            console.log('Detail Transaksi seeded');

            connection.release();

            return NextResponse.json({
                success: true,
                message: 'Database seeding completed successfully!',
                details: {
                    users: mockUsers.length,
                    categories: mockKategori.length,
                    items: mockBarang.length,
                    transactions: mockTransaksi.length,
                }
            });

        } catch (error) {
            connection.release();
            throw error;
        }

    } catch (error: any) {
        console.error('Seeding Error:', error);
        return NextResponse.json(
            { success: false, message: 'Seeding failed', error: error.message },
            { status: 500 }
        );
    }
}
