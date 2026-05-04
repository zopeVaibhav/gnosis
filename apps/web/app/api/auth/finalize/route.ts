import { AppToken, isProd } from '../[...nextauth]/options';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') ?? '/';

    if (!token) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    const { accessToken, refreshToken, accessTokenExpiresInSec, refreshTokenExpiresAt } =
        token as AppToken;

    if (accessToken && refreshToken) {
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
    }

    return NextResponse.redirect(new URL(callbackUrl, req.url));
}
