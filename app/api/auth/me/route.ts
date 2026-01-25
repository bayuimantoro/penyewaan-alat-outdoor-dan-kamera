import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const sessionCookie = request.cookies.get('session');

        if (!sessionCookie?.value) {
            return NextResponse.json({
                success: false,
                user: null,
                message: 'Not authenticated'
            });
        }

        const user = JSON.parse(sessionCookie.value);

        return NextResponse.json({
            success: true,
            user: user
        });

    } catch (error: any) {
        console.error('Session Error:', error);
        return NextResponse.json({
            success: false,
            user: null,
            message: 'Invalid session'
        });
    }
}
