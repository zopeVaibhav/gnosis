import { LINK_URL, SIGN_URL } from '@/routes/api-routes';
import { GoogleAuth } from '@gnosis/types';
import axios from 'axios';
import { Account, NextAuthOptions, Profile, User } from 'next-auth';
import Github from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { cookies } from 'next/headers';

export type AppUser = {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    token?: string | null;
};

const isProd = process.env.NODE_ENV === 'production';

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
                const url = isServiceLink ? LINK_URL : SIGN_URL;

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
                        withCredentials: true,
                    },
                );

                const result = response.data;
                if (!result?.success) return false;

                const {
                    user: backendUser,
                    accessToken,
                    refreshToken,
                    accessTokenExpiresInSec,
                    refreshTokenExpiresAt,
                } = result.data;

                user.id = String(backendUser.id);

                if (!accessToken) return true;

                const cookieStore = await cookies();

                cookieStore.set('accessToken', accessToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: accessTokenExpiresInSec,
                });

                cookieStore.set('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: 'lax',
                    path: '/',
                    expires: new Date(refreshTokenExpiresAt),
                });

                return true;
            } catch (error) {
                console.log(error);
                return false;
            }
        },

        async jwt({ user, token }) {
            if (user) {
                token.user = user;
            }
            return token;
        },

        async session({ session, token }) {
            session.user = token.user;
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
