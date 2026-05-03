'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Modal from './shared/Modal';

interface SignInModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SignInModal({ open, onClose }: SignInModalProps) {
    return (
        <Modal open={open} onClose={onClose} className="w-85 overflow-hidden">
            {/* Top spotlight beam */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
                        radial-gradient(ellipse 60% 35% at 50% 0%,
                            rgba(79,57,246,0.22) 0%,
                            rgba(167,139,250,0.07) 40%,
                            transparent 70%
                        )
                    `,
                }}
            />
            {/* Bright source dot at top edge */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: -1,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 80,
                    height: 2,
                    background:
                        'radial-gradient(ellipse at center, rgba(79,57,246,0.8) 0%, transparent 70%)',
                    filter: 'blur(1px)',
                }}
            />

            <div className="relative flex flex-col items-center px-8 pt-12 pb-8 gap-7">
                {/* Brand */}
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        Welcome back
                    </h2>
                    <p className="text-sm text-muted">Sign in to your account</p>
                </div>

                {/* OAuth buttons — stacked */}
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/home' })}
                        className="flex items-center justify-center gap-2.5 w-full rounded-full px-4 py-2.5 text-sm font-medium cursor-pointer transition-all border border-border bg-surface-raised text-foreground hover:bg-surface-faded"
                    >
                        <Image src="/icons/google.png" alt="Google" width={16} height={16} />
                        Continue with Google
                    </button>

                    <button
                        onClick={() => signIn('github', { callbackUrl: '/home' })}
                        className="flex items-center justify-center gap-2.5 w-full rounded-full px-4 py-2.5 text-sm font-medium cursor-pointer transition-all border border-border bg-surface-raised text-foreground hover:bg-surface-faded"
                    >
                        <Image
                            src="/icons/github.png"
                            alt="GitHub"
                            width={16}
                            height={16}
                            className="invert"
                        />
                        Continue with GitHub
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted leading-5 w-7/10">
                    By continuing, you agree to our{' '}
                    <span className="underline underline-offset-2 cursor-pointer text-primary hover:text-primary-hover transition-colors">
                        Terms
                    </span>{' '}
                    and{' '}
                    <span className="underline underline-offset-2 cursor-pointer text-primary hover:text-primary-hover transition-colors">
                        Privacy Policy
                    </span>
                </p>
            </div>
        </Modal>
    );
}
