'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Session } from 'next-auth';
import Button from '../shared/Button';
import SignInModal from '../SignInModal';

const integrations = [
    { src: '/icons/gmail.svg', label: 'Gmail' },
    { src: '/icons/gdrive.svg', label: 'Google Drive' },
    { src: '/icons/github.svg', label: 'GitHub' },
    { src: '/icons/gcalendar.svg', label: 'Google Calendar' },
];

const container = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 120, damping: 18 },
    },
};

export default function HeroSection({ session }: { session: Session | null }) {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    return (
        <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
            {/* Ambient glow backdrop */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[120px]"
                style={{
                    background:
                        'radial-gradient(circle at center, var(--glow-purple), transparent 70%)',
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.15]"
                style={{
                    backgroundImage:
                        'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    maskImage: 'radial-gradient(ellipse 60% 50% at 50% 45%, black, transparent)',
                }}
            />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="flex max-w-3xl flex-col items-center"
            >
                {/* Eyebrow badge */}
                <motion.div
                    variants={item}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-sm text-muted backdrop-blur-md"
                >
                    <Sparkles size={14} className="text-accent" />
                    <span>AI-powered knowledge, unified</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={item}
                    className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl"
                >
                    Summarize everything you{' '}
                    <span className="bg-gradient-to-r from-primary-hover via-accent to-primary-hover bg-clip-text text-transparent">
                        know
                    </span>
                </motion.h1>

                {/* Subtext */}
                <motion.p
                    variants={item}
                    className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
                >
                    Gnosis connects your inbox, drive, calendar, and repos into a single intelligent
                    knowledgebase — then answers, summarizes, and surfaces what matters in seconds.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    variants={item}
                    className="mt-9 flex flex-wrap items-center justify-center gap-3"
                >
                    {session?.user ? (
                        <Link
                            href="/chat"
                            className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_16px_var(--primary-dim)] transition-all duration-150 hover:bg-primary-hover active:scale-[0.97]"
                        >
                            Open Deep Dive
                            <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </Link>
                    ) : (
                        <button
                            onClick={() => setAuthModalOpen(true)}
                            className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_16px_var(--primary-dim)] transition-all duration-150 hover:bg-primary-hover active:scale-[0.97]"
                        >
                            Get Started Free
                            <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </button>
                    )}
                    <Button
                        variant="secondary"
                        label="See how it works"
                        onClick={() =>
                            document
                                .getElementById('features')
                                ?.scrollIntoView({ behavior: 'smooth' })
                        }
                    />
                </motion.div>

                {/* Integrations strip */}
                <motion.div variants={item} className="mt-14 flex flex-col items-center gap-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted">
                        Connects with
                    </span>
                    <div className="flex items-center gap-5">
                        {integrations.map((integration) => (
                            <div
                                key={integration.label}
                                title={integration.label}
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface/60 backdrop-blur-md transition-colors hover:border-[var(--border-strong)]"
                            >
                                <Image
                                    src={integration.src}
                                    alt={integration.label}
                                    width={22}
                                    height={22}
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            <SignInModal open={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
        </section>
    );
}
