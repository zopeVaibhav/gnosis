import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env';
import { ResponseWriter } from '../utility/responseWriter';
import { ACCESS_COOKIE, ERROR_CODES } from '@gnosis/types';

interface AccessTokenPayload {
    userId: string;
    iat: number;
    exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.[ACCESS_COOKIE];

    if (!accessToken) {
        return ResponseWriter.unauthenticated(
            res,
            'Access token missing',
            ERROR_CODES.ACCESS_TOKEN_EXPIRED,
        );
    }

    try {
        const payload = jwt.verify(accessToken, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
        req.user = { id: payload.userId };
        return next();
    } catch {
        return ResponseWriter.unauthenticated(
            res,
            'Access token expired',
            ERROR_CODES.ACCESS_TOKEN_EXPIRED,
        );
    }
};
