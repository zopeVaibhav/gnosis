import { SIGN_URL } from '@/routes/api-routes';
import axios from 'axios';
import { Account, NextAuthOptions, User } from 'next-auth';
import Github from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export type AppUser = {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    token?: string | null;
};

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/',
    },
    callbacks: {
        async signIn({ user, account }: { user: AppUser; account: Account | null }) {
            try {
                if (account?.provider === 'google' || account?.provider === 'github') {
                    const response = await axios.post(`${SIGN_URL}`, {
                        user,
                        account,
                    });

                    const result = response.data;

                    if (result.success) {
                        user.id = result.data.user.id.toString();
                        user.token = result.data.user.token;
                        return true;
                    }
                    return false;
                }
                return false;
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
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                },
            },
        }),
        Github({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
};
