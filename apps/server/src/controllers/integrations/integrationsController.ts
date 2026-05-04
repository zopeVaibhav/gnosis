import { Request, Response } from 'express';
import { ResponseWriter } from '../../utility/responseWriter';
import { prisma } from '@gnosis/database';
import { signInSchema } from '../../schemas/signInSchema';
import { signInController } from '../auth/signInController';

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

        return ResponseWriter.success(res, null, 'Linked');
    } catch (err) {
        console.error('linkAccountController', err);
        return ResponseWriter.system_error(res);
    }
};

export const getIntegrations = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const accounts = await prisma.account.findMany({
            where: { userId },
            select: { provider: true, scope: true },
        });
        const GOOGLE_SERVICE_SCOPE: Record<string, string> = {
            gmail: 'gmail',
            calendar: 'calendar',
            drive: 'drive',
        };
        const connections = accounts.flatMap((account) => {
            if (account.provider === 'google') {
                return Object.entries(GOOGLE_SERVICE_SCOPE)
                    .filter(([, keyword]) => account.scope?.includes(keyword))
                    .map(([service]) => ({ service, connected: true }));
            }
            return [{ service: account.provider, connected: true }];
        });

        return ResponseWriter.success(res, { connections }, 'Integration fetched');
    } catch (error) {
        console.error('getIntegraionsError', error);
        ResponseWriter.system_error(res, 'Failed to fetch connectors');
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
