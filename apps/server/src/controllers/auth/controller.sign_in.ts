import { Request, Response } from "express";
import z from "zod";
import { prisma } from "@gnosis/database";
import { env } from "../../configs/env";
import JwtService from "../../services/service.jwt";
import ResponseWriter from "../../services/service.response";

export default class SignInController {
    static body_schema = z.object({
        provider: z.enum(["google", "github"]),
        providerAccountId: z.string().min(1),
        email: z.email(),
        name: z.string().min(1),
        image: z.url().nullable().optional(),
        accessToken: z.string().nullable().optional(),
        refreshToken: z.string().nullable().optional(),
        expiresAt: z.number().nullable().optional(),
        scope: z.string().nullable().optional(),
    });

    static async process(req: Request, res: Response) {
        try {
            const { data, success } = SignInController.body_schema.safeParse(req.body);
            if (!success) {
                return ResponseWriter.invalid_data(res, "Invalid sign-in payload");
            }

            const user = await prisma.user.upsert({
                where: { email: data.email },
                create: {
                    email: data.email,
                    name: data.name,
                    image: data.image ?? null,
                },
                update: {
                    name: data.name,
                    image: data.image ?? undefined,
                },
            });

            await prisma.account.upsert({
                where: {
                    provider_providerAccountId: {
                        provider: data.provider,
                        providerAccountId: data.providerAccountId,
                    },
                },
                create: {
                    userId: user.id,
                    provider: data.provider,
                    providerAccountId: data.providerAccountId,
                    accessToken: data.accessToken ?? null,
                    refreshToken: data.refreshToken ?? null,
                    expiresAt: data.expiresAt ?? null,
                    scope: data.scope ?? null,
                },
                update: {
                    accessToken: data.accessToken ?? null,
                    refreshToken: data.refreshToken ?? undefined,
                    expiresAt: data.expiresAt ?? undefined,
                    scope: data.scope ?? null,
                },
            });

            const accessToken = JwtService.sign_access_token(user.id);
            const refreshToken = JwtService.sign_refresh_token(user.id);
            const refreshExpiresAt = JwtService.refresh_expiry_date();

            return ResponseWriter.success(
                res,
                {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    },
                    accessToken,
                    refreshToken,
                    accessTokenExpiresInSec: env.ACCESS_TOKEN_TTL_SEC,
                    refreshTokenExpiresAt: refreshExpiresAt.toISOString(),
                },
                "Authenticated",
            );
        } catch (err) {
            console.error("SignInController error: ", err);
            return ResponseWriter.system_error(res);
        }
    }
}
