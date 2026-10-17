import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // the access token may be stale here (the jwt callback refreshes it on the next
    // session read), so only the refresh token's expiry decides whether to bounce
    const expired = !token?.refreshExpiresAt || Date.now() >= token.refreshExpiresAt;
    if (!token || token.error || expired) {
        return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
}

export const config = { matcher: ["/chat/:path*"] };
