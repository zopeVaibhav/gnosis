import { LINK_INTEGRATION_URL, REFRESH_URL, SIGN_URL } from "@/routes/api_routes";
import type { SessionUser } from "@/store/user/useUserSessionStore";
import { ApiResponse, GoogleAuth } from "@gnosis/types";
import axios from "axios";
import { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Github from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

// refresh this long before expiry; must exceed the client's session poll (4 min)
// so the token the browser holds never lapses between polls
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresInSec: number;
    refreshTokenExpiresAt: string;
}

export interface SignInData extends TokenPair {
    user: SessionUser;
}

type SignedInUser = User & Partial<TokenPair> & { appUser?: SessionUser };

const internalHeaders = () => ({
    "X-Internal-Secret": process.env.INTERNAL_API_SECRET ?? "",
});

function expiryFrom(expiresIn: number | undefined): number | undefined {
    if (typeof expiresIn !== "number" || !Number.isFinite(expiresIn)) return undefined;
    return Date.now() + expiresIn * 1000;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
    const accessStillValid = !!token.expiresAt && Date.now() < token.expiresAt;
    try {
        const { data: result } = await axios.post<ApiResponse<TokenPair>>(
            REFRESH_URL,
            { refreshToken: token.refreshToken },
            { headers: internalHeaders() },
        );
        const expiresAt = expiryFrom(result.data?.accessTokenExpiresInSec);
        if (!result.success || !result.data || !expiresAt) {
            return { ...token, error: "SessionExpired" };
        }

        return {
            ...token,
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            expiresAt,
            refreshExpiresAt: Date.parse(result.data.refreshTokenExpiresAt),
            error: undefined,
        };
    } catch (error) {
        // a 401 means the refresh token is dead; anything else (server down, timeout)
        // is transient, so keep the session while the current access token still works
        const rejected = axios.isAxiosError(error) && error.response?.status === 401;
        if (!rejected && accessStillValid) return token;

        console.error("[jwt] token refresh failed", rejected ? "rejected" : error);
        return { ...token, error: "SessionExpired" };
    }
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt",
        maxAge: SESSION_MAX_AGE_SEC,
    },

    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                if (!account) return false;
                if (account.provider !== "google" && account.provider !== "github") return false;

                if (account.provider === "google") {
                    if (!(profile as { email_verified?: boolean })?.email_verified) {
                        return false;
                    }
                }

                if (!user.email) return false;

                // linking gmail/drive/calendar re-runs sign-in, so both paths must hand back an app token
                const isServiceLink = ["gmail", "drive", "calendar"].some((s) =>
                    account.scope?.includes(s),
                );
                const url = isServiceLink ? LINK_INTEGRATION_URL : SIGN_URL;

                const response = await axios.post<ApiResponse<SignInData>>(
                    url,
                    {
                        ...account,
                        ...user,
                        accessToken: account.access_token ?? null,
                        refreshToken: account.refresh_token ?? null,
                        expiresAt: account.expires_at ?? null,
                    },
                    { headers: internalHeaders() },
                );
                const result = response.data;

                if (!result.success || !result.data) {
                    console.error("[signIn] backend rejected sign in", result.message);
                    return false;
                }

                const { user: appUser, ...tokens } = result.data;
                Object.assign(user as SignedInUser, { appUser, ...tokens });
                return true;
            } catch (error) {
                console.error("[signIn]", error);
                return false;
            }
        },

        async jwt({ user, token }) {
            if (user) {
                const signedIn = user as SignedInUser;
                const expiresAt = expiryFrom(signedIn.accessTokenExpiresInSec);

                if (
                    !signedIn.appUser ||
                    !signedIn.accessToken ||
                    !signedIn.refreshToken ||
                    !expiresAt
                ) {
                    console.error("[jwt] sign in payload missing user/tokens/expiresIn");
                    return { ...token, error: "SessionExpired" };
                }

                return {
                    ...token,
                    user: signedIn.appUser,
                    accessToken: signedIn.accessToken,
                    refreshToken: signedIn.refreshToken,
                    expiresAt,
                    refreshExpiresAt: Date.parse(signedIn.refreshTokenExpiresAt ?? ""),
                    error: undefined,
                };
            }

            if (token.error) return token;
            if (!token.refreshToken) return { ...token, error: "SessionExpired" };
            if (token.expiresAt && Date.now() < token.expiresAt - REFRESH_BUFFER_MS) {
                return token;
            }

            return refreshAccessToken(token);
        },

        async session({ session, token }) {
            session.user = token.user;
            session.accessToken = token.error ? undefined : token.accessToken;
            session.error = token.error;
            return session;
        },
    },

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: GoogleAuth.provider,
            },
        }),
        Github({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
};
