import { Request, Response } from 'express';
import { ResponseWriter } from '../utility/responseWriter';

export const notFoundMiddleware = (_req: Request, res: Response) => {
    return ResponseWriter.not_found(res, 'Route not found');
};
