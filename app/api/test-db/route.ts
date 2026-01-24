import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return NextResponse.json({ status: 'success', message: 'Connected to Docker Database!' });
    } catch (error: any) {
        console.error('Database Connection Error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Database connection failed',
                error: error.message,
                code: error.code,
                details: JSON.stringify(error, Object.getOwnPropertyNames(error))
            },
            { status: 500 }
        );
    }
}
