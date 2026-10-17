import type { Request, Response, NextFunction } from "express";
import { ERROR_CODES } from "@gnosis/types";
import JwtService from "../services/service.jwt";
import ResponseWriter from "../services/service.response";

function bearer_token(req: Request) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return null;
    const token = header.slice(7).trim();
    return token || null;
}

export function require_auth(req: Request, res: Response, next: NextFunction) {
    const access_token = bearer_token(req);
    if (!access_token) {
        return ResponseWriter.unauthenticated(
            res,
            "Access token missing",
            ERROR_CODES.ACCESS_TOKEN_EXPIRED,
        );
    }

    try {
        const payload = JwtService.verify_access_token(access_token);
        req.user = { id: payload.userId };
        return next();
    } catch {
        return ResponseWriter.unauthenticated(
            res,
            "Access token expired",
            ERROR_CODES.ACCESS_TOKEN_EXPIRED,
        );
    }
}
