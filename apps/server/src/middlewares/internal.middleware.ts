import { Request, Response, NextFunction } from 'express';
import { env } from '../configs/env';
import { ResponseWriter } from '../utility/responseWriter';

export const internalMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const secret = req.headers['x-internal-secret'];
    if (!secret || secret !== env.INTERNAL_API_SECRET) {
        return ResponseWriter.unauthenticated(res, 'Forbidden');
    }
    return next();
};
