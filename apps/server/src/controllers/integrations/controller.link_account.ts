import { Request, Response } from "express";
import z from "zod";
import { prisma } from "@gnosis/database";
import ResponseWriter from "../../services/service.response";

export default class LinkAccountController {
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
            const { data, success } = LinkAccountController.body_schema.safeParse(req.body);
            if (!success) {
                return ResponseWriter.invalid_data(res, "Invalid link account payload");
            }

            const user = await prisma.user.findUnique({
                where: { email: data.email },
            });
            if (!user) {
                return ResponseWriter.not_found(res, "User not found");
            }

            const existingAccount = await prisma.account.findUnique({
                where: {
                    provider_providerAccountId: {
                        provider: data.provider,
                        providerAccountId: data.providerAccountId,
                    },
                },
                select: { scope: true },
            });

            const mergedScope = LinkAccountController.merge_scopes(
                existingAccount?.scope,
                data.scope,
            );

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
                    scope: mergedScope,
                },
                update: {
                    accessToken: data.accessToken ?? null,
                    refreshToken: data.refreshToken ?? undefined,
                    expiresAt: data.expiresAt ?? undefined,
                    scope: mergedScope,
                },
            });

            return ResponseWriter.success(res, null, "Linked");
        } catch (err) {
            console.error("LinkAccountController error: ", err);
            return ResponseWriter.system_error(res);
        }
    }

    private static merge_scopes(
        existing: string | null | undefined,
        incoming: string | null | undefined,
    ): string | null {
        const merged = new Set(
            [...(existing ?? "").split(" "), ...(incoming ?? "").split(" ")].filter(Boolean),
        );
        return merged.size > 0 ? [...merged].join(" ") : null;
    }
}
