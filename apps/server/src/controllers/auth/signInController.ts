import { Request, Response } from 'express';
import { signInSchema } from '../../schemas/signInSchema';
import { prisma } from '@gnosis/database';
import jwt from 'jsonwebtoken';
import { env } from '../../configs/env';
import crypto from 'crypto';
import { generateSha256 } from '../../utility/generateSha256';

export const signInController = async (req: Request, res: Response) => {
    try {
        const parsed = signInSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, error: parsed.error });
        }
        const data = parsed.data;

        const user = await prisma.user.upsert({
            where: { email: data.email },
            create: {
                email: data.email,
                name: data.name,
                image: data.image ?? null,
            },
            update: {
                name: data.name,
                image: data.image ?? undefined,
            },
        });

        await prisma.account.upsert({
            where: {
                provider_providerAccountId: {
                    provider: data.provider,
                    providerAccountId: data.providerAccountId,
                },
            },
            create: {
                userId: user.id,
                provider: data.provider,
                providerAccountId: data.providerAccountId,
                accessToken: data.accessToken ?? null,
                refreshToken: data.refreshToken ?? null,
                expiresAt: data.expiresAt ?? null,
                scope: data.scope ?? null,
            },
            update: {
                accessToken: data.accessToken ?? null,
                refreshToken: data.refreshToken ?? undefined,
                expiresAt: data.expiresAt ?? undefined,
                scope: data.scope ?? null,
            },
        });

        const accessToken = jwt.sign({ userId: user.id }, env.JWT_ACCESS_SECRET, {
            expiresIn: env.ACCESS_TOKEN_TTL_SEC,
        });

        const rawRefresh = crypto.randomBytes(64).toString('hex');
        const tokenHash = generateSha256(rawRefresh);
        const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_SEC * 1000);

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });

        return res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                },
                accessToken,
                refreshToken: rawRefresh,
                accessTokenExpiresInSec: env.ACCESS_TOKEN_TTL_SEC,
                refreshTokenExpiresAt: expiresAt.toISOString(),
            },
        });
    } catch (error) {
        console.log('singinControllerError', error);
        return res.status(500).json({
            success: false,
            error: 'internal_error',
        });
    }
};
