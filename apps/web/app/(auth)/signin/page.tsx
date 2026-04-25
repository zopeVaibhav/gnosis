'use client';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center h-full">
            <button
                className="px-4 py-2 border rounded"
                onClick={() => signIn('google', { callbackUrl: '/home' })}
            >
                Sign in with Google
            </button>
        </div>
    );
}
