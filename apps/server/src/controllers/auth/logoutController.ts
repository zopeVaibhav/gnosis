import { Request, Response } from 'express';
import { prisma } from '@gnosis/database';
import { env } from '../../configs/env';
import { generateSha256 } from '../../utility/generateSha256';
import { ResponseWriter } from '../../utility/responseWriter';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@gnosis/types';

const isProd = env.NODE_ENV === 'production';

const clearOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict' as const,
    path: '/',
};

export const logoutController = async (req: Request, res: Response) => {
    try {
        const raw = req.cookies?.[REFRESH_COOKIE];

        if (raw) {
            const tokenHash = generateSha256(raw);
            await prisma.refreshToken.updateMany({
                where: { tokenHash, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }

        res.clearCookie(ACCESS_COOKIE, clearOptions);
        res.clearCookie(REFRESH_COOKIE, clearOptions);

        return ResponseWriter.success(res, null, 'Logged out');
    } catch (err) {
        console.error('logoutController error', err);
        return ResponseWriter.system_error(res);
    }
};
