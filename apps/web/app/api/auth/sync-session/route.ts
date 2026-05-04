import { isProd, AppToken } from '../[...nextauth]/options';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json({ success: false }, { status: 401 });
    }

    const { accessToken, refreshToken, accessTokenExpiresInSec, refreshTokenExpiresAt } =
        token as AppToken;

    if (!accessToken || !refreshToken) {
        return NextResponse.json({ success: true });
    }

    const cookieStore = await cookies();

    cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        path: '/',
        maxAge: accessTokenExpiresInSec,
    });

    cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        path: '/',
        expires: refreshTokenExpiresAt ? new Date(refreshTokenExpiresAt) : undefined,
    });

    return NextResponse.json({ success: true });
}
