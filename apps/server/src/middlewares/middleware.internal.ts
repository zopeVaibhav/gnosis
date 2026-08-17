import type { Request, Response, NextFunction } from "express";
import { env } from "../configs/env";
import ResponseWriter from "../services/service.response";

export function require_internal_secret(req: Request, res: Response, next: NextFunction) {
    const secret = req.headers["x-internal-secret"];
    if (!secret || secret !== env.INTERNAL_API_SECRET) {
        return ResponseWriter.unauthenticated(res, "Forbidden");
    }
    return next();
}
