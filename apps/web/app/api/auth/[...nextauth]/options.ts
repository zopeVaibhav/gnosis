import { LINK_INTEGRATION_URL, SIGN_URL } from '@/routes/api-routes';
import { GoogleAuth } from '@gnosis/types';
import axios from 'axios';
import { Account, NextAuthOptions, Profile } from 'next-auth';
import Github from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export type AppUser = {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    token?: string | null;
};

export type AppToken = {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresInSec?: number;
    refreshTokenExpiresAt?: string;
};

export const isProd = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/',
    },
    callbacks: {
        async signIn({
            user,
            account,
            profile,
        }: {
            user: AppUser;
            account: Account | null;
            profile?: Profile;
        }) {
            try {
                if (!account) return false;
                if (account.provider !== 'google' && account.provider !== 'github') return false;

                if (account.provider === 'google') {
                    if (!(profile as { email_verified?: boolean })?.email_verified) {
                        return false;
                    }
                }

                if (!user.email) return false;

                const isServiceLink = ['gmail', 'drive', 'calendar'].some((s) =>
                    account.scope?.includes(s),
                );
                const url = isServiceLink ? LINK_INTEGRATION_URL : SIGN_URL;

                const response = await axios.post(
                    url,
                    {
                        ...account,
                        ...user,
                        accessToken: account.access_token ?? null,
                        refreshToken: account.refresh_token ?? null,
                        expiresAt: account.expires_at ?? null,
                    },
                    {
                        headers: {
                            'X-Internal-Secret': process.env.INTERNAL_API_SECRET ?? '',
                        },
                    },
                );

                const result = response.data;
                if (!result?.success) return false;

                // service links don't return tokens — just confirm success and done
                if (isServiceLink) return true;

                const {
                    user: backendUser,
                    accessToken,
                    refreshToken,
                    accessTokenExpiresInSec,
                    refreshTokenExpiresAt,
                } = result.data;

                user.id = String(backendUser?.id ?? '');

                // store tokens on user object so jwt callback can pick them up
                (user as AppUser & AppToken).accessToken = accessToken;
                (user as AppUser & AppToken).refreshToken = refreshToken;
                (user as AppUser & AppToken).accessTokenExpiresInSec = accessTokenExpiresInSec;
                (user as AppUser & AppToken).refreshTokenExpiresAt = refreshTokenExpiresAt;

                return true;
            } catch (error) {
                console.error('signIn callback error', error);
                return false;
            }
        },

        async jwt({ user, token }) {
            if (user) {
                token.user = user;
                const u = user as AppUser & AppToken;
                if (u.accessToken) {
                    token.accessToken = u.accessToken;
                    token.refreshToken = u.refreshToken;
                    token.accessTokenExpiresInSec = u.accessTokenExpiresInSec;
                    token.refreshTokenExpiresAt = u.refreshTokenExpiresAt;
                }
            }
            return token;
        },

        async session({ session, token }) {
            session.user = token.user as AppUser;
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
