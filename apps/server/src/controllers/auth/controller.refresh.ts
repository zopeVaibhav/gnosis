import { Request, Response } from "express";
import z from "zod";
import { prisma } from "@gnosis/database";
import { ERROR_CODES } from "@gnosis/types";
import { env } from "../../configs/env";
import JwtService, { type SessionTokenPayload } from "../../services/service.jwt";
import ResponseWriter from "../../services/service.response";

export default class RefreshController {
    static body_schema = z.object({
        refreshToken: z.string().min(1),
    });

    static async process(req: Request, res: Response) {
        try {
            const { data, success } = RefreshController.body_schema.safeParse(req.body);
            if (!success) {
                return ResponseWriter.unauthenticated(
                    res,
                    "Refresh token missing",
                    ERROR_CODES.INVALID_REFRESH_TOKEN,
                );
            }

            let payload: SessionTokenPayload;
            try {
                payload = JwtService.verify_refresh_token(data.refreshToken);
            } catch {
                return ResponseWriter.unauthenticated(
                    res,
                    "Refresh token expired",
                    ERROR_CODES.REFRESH_TOKEN_EXPIRED,
                );
            }

            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                select: { id: true },
            });
            if (!user) {
                return ResponseWriter.unauthenticated(
                    res,
                    "User no longer exists",
                    ERROR_CODES.INVALID_REFRESH_TOKEN,
                );
            }

            // rotate both tokens so the refresh window slides with activity
            const refreshExpiresAt = JwtService.refresh_expiry_date();
            return ResponseWriter.success(
                res,
                {
                    accessToken: JwtService.sign_access_token(user.id),
                    refreshToken: JwtService.sign_refresh_token(user.id),
                    accessTokenExpiresInSec: env.ACCESS_TOKEN_TTL_SEC,
                    refreshTokenExpiresAt: refreshExpiresAt.toISOString(),
                },
                "Refreshed",
            );
        } catch (err) {
            console.error("RefreshController error: ", err);
            return ResponseWriter.system_error(res);
        }
    }
}
