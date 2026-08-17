import { Response } from "express";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@gnosis/types";
import { env } from "../configs/env";

const COOKIE_BASE = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
};

export default class CookieService {
    static set_session_cookies(
        res: Response,
        tokens: { accessToken: string; refreshToken: string; refreshExpiresAt: Date },
    ) {
        res.cookie(ACCESS_COOKIE, tokens.accessToken, {
            ...COOKIE_BASE,
            maxAge: env.ACCESS_TOKEN_TTL_SEC * 1000,
        });
        res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
            ...COOKIE_BASE,
            expires: tokens.refreshExpiresAt,
        });
    }

    static clear_session_cookies(res: Response) {
        res.clearCookie(ACCESS_COOKIE, COOKIE_BASE);
        res.clearCookie(REFRESH_COOKIE, COOKIE_BASE);
    }
}
