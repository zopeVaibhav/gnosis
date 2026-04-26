import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../configs/env';

interface AccessTokenPayload {
    userId: number;
    iat: number;
    exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({ success: false, error: 'unauthenticated' });
    }

    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
        req.user = { id: payload.userId };
        next();
    } catch {
        return res.status(401).json({ success: false, error: 'invalid_token' });
    }
};
