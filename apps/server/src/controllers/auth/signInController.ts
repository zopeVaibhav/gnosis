import { Request, Response } from 'express';
import { signInSchema } from '../../schemas/signInSchema';
import { prisma } from '@gnosis/database';
import jwt from 'jsonwebtoken';
import { env } from '../../configs/env';
import crypto from 'crypto';
import { generateSha256 } from '../../utility/generateSha256';
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

        const rawRefresh = crypto.randomBytes(64).toString('hex');
        const tokenHash = generateSha256(rawRefresh);
        const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_SEC * 1000);

        await prisma.refreshToken.create({
            data: { userId: user.id, tokenHash, expiresAt },
        });

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
                refreshToken: rawRefresh,
                accessTokenExpiresInSec: env.ACCESS_TOKEN_TTL_SEC,
                refreshTokenExpiresAt: expiresAt.toISOString(),
            },
            'Authenticated',
        );
    } catch (err) {
        console.error('signInController error', err);
        return ResponseWriter.system_error(res);
    }
};

export const linkAccountController = async (req: Request, res: Response) => {
    try {
        const parsed = signInSchema.safeParse(req.body);
        if (!parsed.success) {
            return ResponseWriter.invalid_data(res, 'Invalid link account payload');
        }
        const data = parsed.data;

        const user = await prisma.user.findUnique({
            where: {
                email: data?.email,
            },
        });
        if (!user) return signInController(req, res);

        const existingAccount = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: data.provider,
                    providerAccountId: data.providerAccountId,
                },
            },
            select: { scope: true },
        });

        const mergedScope = mergeScopes(existingAccount?.scope, data.scope);

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
                scope: mergedScope,
            },
            update: {
                accessToken: data.accessToken ?? null,
                refreshToken: data.refreshToken ?? undefined,
                expiresAt: data.expiresAt ?? undefined,
                scope: mergedScope,
            },
        });

        return ResponseWriter.success(res, 'Linked');
    } catch (err) {
        console.error('linkAccountController', err);
        return ResponseWriter.system_error(res);
    }
};

function mergeScopes(
    existing: string | null | undefined,
    incoming: string | null | undefined,
): string | null {
    const merged = new Set(
        [...(existing ?? '').split(' '), ...(incoming ?? '').split(' ')].filter(Boolean),
    );
    return merged.size > 0 ? [...merged].join(' ') : null;
}
