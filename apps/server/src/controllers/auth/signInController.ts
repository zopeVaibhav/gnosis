import { Request, Response } from 'express';
import { signInSchema } from '../../schemas/signInSchema';
import { prisma } from '@gnosis/database';
import jwt from 'jsonwebtoken';
import { env } from '../../configs/env';
import { ResponseWriter } from '../../utility/responseWriter';

export const signInController = async (req: Request, res: Response) => {
    try {
        const parsed = signInSchema.safeParse(req.body);
        if (!parsed.success) {
            return ResponseWriter.invalid_data(res, 'Invalid sign-in payload');
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

        const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
            expiresIn: env.REFRESH_TOKEN_TTL_SEC,
        });

        const refreshExpiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_SEC * 1000);

        return ResponseWriter.success(
            res,
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                },
                accessToken,
                refreshToken,
                accessTokenExpiresInSec: env.ACCESS_TOKEN_TTL_SEC,
                refreshTokenExpiresAt: refreshExpiresAt.toISOString(),
            },
            'Authenticated',
        );
    } catch (err) {
        console.error('signInController error', err);
        return ResponseWriter.system_error(res);
    }
};
