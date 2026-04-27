import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@gnosis/database';
import { env } from '../configs/env';
import { generateSha256 } from '../utility/generateSha256';

interface AccessTokenPayload {
    userId: number;
    iat: number;
    exp: number;
}

const isProd = env.NODE_ENV === 'production';

const cookieBase = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;

    if (accessToken) {
        try {
            const payload = jwt.verify(accessToken, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
            req.user = { id: payload.userId };
            return next();
        } catch {
            // expired or invalid → fall through to refresh
        }
    }

    const raw = req.cookies?.refreshToken;
    if (!raw) {
        return res.status(401).json({ success: false, error: 'unauthenticated' });
    }

    const stored = await prisma.refreshToken.findUnique({
        where: { tokenHash: generateSha256(raw) },
    });

    if (!stored) {
        return res.status(401).json({ success: false, error: 'invalid_refresh_token' });
    }

    if (stored.revokedAt) {
        await prisma.refreshToken.updateMany({
            where: { userId: stored.userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        res.clearCookie('accessToken', cookieBase);
        res.clearCookie('refreshToken', cookieBase);
        return res.status(401).json({ success: false, error: 'token_reuse_detected' });
    }

    if (stored.expiresAt < new Date()) {
        return res.status(401).json({ success: false, error: 'refresh_token_expired' });
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
            data: {
                userId: stored.userId,
                tokenHash: newHash,
                expiresAt: newExpiresAt,
            },
        }),
    ]);

    const newAccessToken = jwt.sign({ userId: stored.userId }, env.JWT_ACCESS_SECRET, {
        expiresIn: env.ACCESS_TOKEN_TTL_SEC,
    });

    res.cookie('accessToken', newAccessToken, {
        ...cookieBase,
        maxAge: env.ACCESS_TOKEN_TTL_SEC * 1000,
    });
    res.cookie('refreshToken', newRaw, {
        ...cookieBase,
        expires: newExpiresAt,
    });

    req.user = { id: stored.userId };
    next();
};
