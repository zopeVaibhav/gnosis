'use client';
import { signIn } from 'next-auth/react';

export default function Demo() {
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
        </div>
    );
}
