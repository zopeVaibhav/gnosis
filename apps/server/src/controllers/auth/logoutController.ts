import { Request, Response } from 'express';
import { prisma } from '@gnosis/database';
import { env } from '../../configs/env';
import { generateSha256 } from '../../utility/generateSha256';

const isProd = env.NODE_ENV === 'production';

export const logoutController = async (req: Request, res: Response) => {
    try {
        const raw = req.cookies?.refreshToken;

        if (raw) {
            const tokenHash = generateSha256(raw);
            await prisma.refreshToken.updateMany({
                where: { tokenHash, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }

        const clearOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax' as const,
            path: '/',
        };

        res.clearCookie('accessToken', clearOptions);
        res.clearCookie('refreshToken', clearOptions);

        return res.json({ success: true });
    } catch (err) {
        console.error('logoutController error', err);
        return res.status(500).json({ success: false, error: 'internal_error' });
    }
};
