import type { Request, Response, NextFunction } from "express";
import { ACCESS_COOKIE, ERROR_CODES } from "@gnosis/types";
import JwtService from "../services/service.jwt";
import ResponseWriter from "../services/service.response";

export function require_auth(req: Request, res: Response, next: NextFunction) {
    const access_token = req.cookies?.[ACCESS_COOKIE];
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
