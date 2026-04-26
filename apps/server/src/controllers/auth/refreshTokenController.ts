import { Request, Response } from 'express';
import { generateSha256 } from '../../utility/generateSha256';
import { prisma } from '@gnosis/database';
import crypto from 'crypto';
import { env } from '../../configs/env';
import jwt from 'jsonwebtoken';

const isProd = env.NODE_ENV === 'production';

export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const raw = req.cookies?.refreshToken;

        if (!raw) {
            return res.status(401).json({ success: false, error: 'no_refresh_token' });
        }

        const tokenHash = generateSha256(raw);
        const stored = await prisma.refreshToken.findUnique({
            where: { tokenHash },
        });
        if (!stored) {
            return res.status(401).json({ success: false, error: 'invalid_refresh_token' });
        }
        if (stored.revokedAt) {
            await prisma.refreshToken.updateMany({
                where: { userId: stored.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
            return res.status(401).json({ success: false, message: 'token_reuse_detected' });
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

        const accessToken = jwt.sign({ userId: stored.userId }, env.JWT_ACCESS_SECRET, {
            expiresIn: env.ACCESS_TOKEN_TTL_SEC,
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: env.ACCESS_TOKEN_TTL_SEC * 1000,
        });

        res.cookie('refreshToken', newRaw, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            expires: newExpiresAt,
        });

        return res.json({
            success: true,
            data: {
                accessTokenExpiresInSec: env.ACCESS_TOKEN_TTL_SEC,
                refreshTokenExpiresAt: newExpiresAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('refreshTokenController error', error);
        return res.status(500).json({ success: false, error: 'internal_error' });
    }
};
