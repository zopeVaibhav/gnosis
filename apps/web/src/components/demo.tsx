'use client';
import { api } from '@/src/lib/apiClients';
import { signIn, signOut as nextSignOut } from 'next-auth/react';

export default function Demo() {
    const signOut = async () => {
        await api.post('/auth/logout');
        await nextSignOut();
    };
    const protctedRouter = async () => {
        await api.post('/auth/protected-route');
    };
    return (
        <div className="flex gap-2">
            <button
                className="px-4 py-2 border rounded"
                onClick={() => signIn('google', { callbackUrl: '/' })}
            >
                Sign in with Google
            </button>
            <button
                className="px-4 py-2 border rounded"
                onClick={() => signIn('github', { callbackUrl: '/' })}
            >
                Sign in with GitHub
            </button>
            <button className="px-4 py-2 border rounded" onClick={signOut}>
                LOGOUT
            </button>
            <button className="px-4 py-2 border rounded" onClick={protctedRouter}>
                protected route
            </button>
        </div>
    );
}
