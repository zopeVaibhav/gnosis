import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@gnosis/database';
import { env } from '../../configs/env';
import { generateSha256 } from '../../utility/generateSha256';
import { ResponseWriter } from '../../utility/responseWriter';
import { ACCESS_COOKIE, ERROR_CODES, REFRESH_COOKIE } from '@gnosis/types';

const isProd = env.NODE_ENV === 'production';

const cookieBase = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict' as const,
    path: '/',
};

export const refreshController = async (req: Request, res: Response) => {
    try {
        const raw = req.cookies?.[REFRESH_COOKIE];

        if (!raw) {
            return ResponseWriter.unauthenticated(res);
        }

        const stored = await prisma.refreshToken.findUnique({
            where: { tokenHash: generateSha256(raw) },
        });

        if (!stored) {
            return ResponseWriter.unauthenticated(
                res,
                'Invalid refresh token',
                ERROR_CODES.INVALID_REFRESH_TOKEN,
            );
        }

        if (stored.revokedAt) {
            await prisma.refreshToken.updateMany({
                where: { userId: stored.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            res.clearCookie(ACCESS_COOKIE, cookieBase);
            res.clearCookie(REFRESH_COOKIE, cookieBase);
            return ResponseWriter.unauthenticated(
                res,
                'Token reuse detected',
                ERROR_CODES.TOKEN_REUSE_DETECTED,
            );
        }

        if (stored.expiresAt < new Date()) {
            return ResponseWriter.unauthenticated(
                res,
                'Refresh token expired',
                ERROR_CODES.REFRESH_TOKEN_EXPIRED,
            );
        }

        const newRaw = crypto.randomBytes(64).toString('hex');
        const newHash = generateSha256(newRaw);
        const newExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_SEC * 1000);

        await prisma.$transaction([
            prisma.refreshToken.update({
                where: { id: stored.id },
                data: { revokedAt: new Date() },
            }),
            prisma.refreshToken.create({
                data: { userId: stored.userId, tokenHash: newHash, expiresAt: newExpiresAt },
            }),
        ]);

        const newAccessToken = jwt.sign({ userId: stored.userId }, env.JWT_ACCESS_SECRET, {
            expiresIn: env.ACCESS_TOKEN_TTL_SEC,
        });

        res.cookie(ACCESS_COOKIE, newAccessToken, {
            ...cookieBase,
            maxAge: env.ACCESS_TOKEN_TTL_SEC * 1000,
        });
        res.cookie(REFRESH_COOKIE, newRaw, {
            ...cookieBase,
            expires: newExpiresAt,
        });

        return ResponseWriter.success(res, null, 'Refreshed');
    } catch (err) {
        console.error('refreshController error', err);
        return ResponseWriter.system_error(res);
    }
};
