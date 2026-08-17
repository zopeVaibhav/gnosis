import { Request, Response } from "express";
import { ERROR_CODES, REFRESH_COOKIE } from "@gnosis/types";
import CookieService from "../../services/service.cookie";
import JwtService, { type SessionTokenPayload } from "../../services/service.jwt";
import ResponseWriter from "../../services/service.response";

export default class RefreshController {
    static async process(req: Request, res: Response) {
        try {
            const token = req.cookies?.[REFRESH_COOKIE];
            if (!token) {
                return ResponseWriter.unauthenticated(
                    res,
                    "Refresh token missing",
                    ERROR_CODES.INVALID_REFRESH_TOKEN,
                );
            }

            let payload: SessionTokenPayload;
            try {
                payload = JwtService.verify_refresh_token(token);
            } catch {
                CookieService.clear_session_cookies(res);
                return ResponseWriter.unauthenticated(
                    res,
                    "Refresh token expired",
                    ERROR_CODES.REFRESH_TOKEN_EXPIRED,
                );
            }

            CookieService.set_session_cookies(res, {
                accessToken: JwtService.sign_access_token(payload.userId),
                refreshToken: JwtService.sign_refresh_token(payload.userId),
                refreshExpiresAt: JwtService.refresh_expiry_date(),
            });

            return ResponseWriter.success(res, null, "Refreshed");
        } catch (err) {
            console.error("RefreshController error: ", err);
            return ResponseWriter.system_error(res);
        }
    }
}
