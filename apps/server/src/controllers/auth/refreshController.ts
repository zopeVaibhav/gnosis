import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../configs/env';
import { ResponseWriter } from '../../utility/responseWriter';
import { ACCESS_COOKIE, ERROR_CODES, REFRESH_COOKIE } from '@gnosis/types';

const isProd = env.NODE_ENV === 'production';

const cookieBase = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict' as const,
    path: '/',
};

interface RefreshTokenPayload {
    userId: string;
    iat: number;
    exp: number;
}

export const refreshController = async (req: Request, res: Response) => {
    try {
        const token = req.cookies?.[REFRESH_COOKIE];

        if (!token) {
            return ResponseWriter.unauthenticated(
                res,
                'Refresh token missing',
                ERROR_CODES.INVALID_REFRESH_TOKEN,
            );
        }

        let payload: RefreshTokenPayload;
        try {
            payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
        } catch {
            res.clearCookie(ACCESS_COOKIE, cookieBase);
            res.clearCookie(REFRESH_COOKIE, cookieBase);
            return ResponseWriter.unauthenticated(
                res,
                'Refresh token expired',
                ERROR_CODES.REFRESH_TOKEN_EXPIRED,
            );
        }

        const newAccessToken = jwt.sign({ userId: payload.userId }, env.JWT_ACCESS_SECRET, {
            expiresIn: env.ACCESS_TOKEN_TTL_SEC,
        });

        const newRefreshToken = jwt.sign({ userId: payload.userId }, env.JWT_REFRESH_SECRET, {
            expiresIn: env.REFRESH_TOKEN_TTL_SEC,
        });

        const refreshExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_SEC * 1000);

        res.cookie(ACCESS_COOKIE, newAccessToken, {
            ...cookieBase,
            maxAge: env.ACCESS_TOKEN_TTL_SEC * 1000,
        });
        res.cookie(REFRESH_COOKIE, newRefreshToken, {
            ...cookieBase,
            expires: refreshExpiresAt,
        });

        return ResponseWriter.success(res, null, 'Refreshed');
    } catch (err) {
        console.error('refreshController error', err);
        return ResponseWriter.system_error(res);
    }
};
