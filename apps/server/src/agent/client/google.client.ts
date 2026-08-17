import { prisma } from "@gnosis/database";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { env } from "../../configs/env";
import { NotConnectedError } from "./error";

export const googleClient = async (userId: string): Promise<OAuth2Client> => {
    const account = await prisma.account.findFirst({
        where: {
            provider: "google",
            userId,
        },
    });
    if (!account) throw new NotConnectedError("google");

    const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);

    oauth2Client.setCredentials({
        access_token: account.accessToken ?? undefined,
        refresh_token: account.refreshToken ?? undefined,
        expiry_date: account.expiresAt ? account.expiresAt * 1000 : undefined,
    });

    oauth2Client.on("tokens", async (token) => {
        await prisma.account.update({
            where: { id: account.id },
            data: {
                accessToken: token.access_token ?? account.accessToken,
                refreshToken: token.refresh_token ?? account.refreshToken,
                expiresAt: token.expiry_date
                    ? Math.floor(token.expiry_date / 1000)
                    : account.expiresAt,
            },
        });
    });

    return oauth2Client;
};

export const getGmailClient = async (userId: string) => {
    const auth = await googleClient(userId);
    return google.gmail({ version: "v1", auth });
};

export const getDriveClient = async (userId: string) => {
    const auth = await googleClient(userId);
    return google.drive({ version: "v2", auth });
};
