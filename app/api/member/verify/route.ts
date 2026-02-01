import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        // 1. Authentication Check
        const sessionCookie = request.cookies.get('session');
        if (!sessionCookie?.value) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const userSession = JSON.parse(sessionCookie.value);
        const userId = userSession.id;

        // 2. Handle File Upload
        const formData = await request.formData();
        const file = formData.get('ktp') as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'File KTP wajib diupload' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ success: false, message: 'File harus berupa gambar' }, { status: 400 });
        }

        // Save file to public/uploads/ktp
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists (manual check usually needed, but for now assuming uploads folder structure or using unique names in public)
        // Best practice: save to external storage (S3). Academic project: save to public folder.
        // Problem: saving to public folder in Vercel/production is ephemeral. But for local dev it works.
        // Let's name it with timestamp to avoid collision.
        const fileName = `ktp-${userId}-${Date.now()}${path.extname(file.name)}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ktp');

        // Ensure dir exists
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/ktp/${fileName}`;

        // 3. Update Database
        const connection = await pool.getConnection();
        try {
            // Ensure column exists (Dirty migration for dev)
            try {
                await connection.query('ALTER TABLE users ADD COLUMN foto_ktp VARCHAR(255) DEFAULT NULL');
            } catch (err: any) {
                // Ignore if exists
                if (err.code !== 'ER_DUP_FIELDNAME') console.log('Column check:', err.message);
            }

            // Update user
            await connection.query(
                `UPDATE users SET foto_ktp = ?, status_verifikasi = 'pending' WHERE id = ?`,
                [fileUrl, userId]
            );

            // Fetch updated user to refresh session
            const [updatedParams] = await connection.query<RowDataPacket[]>(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );
            const updatedUser = updatedParams[0];

            // 4. Update Session Cookie
            // Create a response object
            const response = NextResponse.json({
                success: true,
                message: 'Verifikasi berhasil dikirim',
                user: updatedUser
            });

            // Set cookie with updated user data
            response.cookies.set('session', JSON.stringify(updatedUser), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            return response;

        } finally {
            connection.release();
        }

    } catch (error: any) {
        console.error('Verification Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
