"use client";
import { useLayoutEffect, useRef, useState } from "react";
import SignInModal from "./SignInModal";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Button from "./shared/Button";
import AppLogo from "./AppLogo";

const tabs = ["Home", "Features", "Docs", "Pricing"];

export default function Navbar() {
    const { data: session, status } = useSession();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Home");
    const [hovered, setHovered] = useState<string | null>(null);
    const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [indicatorStyle, setIndicatorStyle] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);

    useLayoutEffect(() => {
        const el = tabRefs.current[hovered ?? activeTab];
        if (el) {
            setIndicatorStyle({
                x: el.offsetLeft,
                y: el.offsetTop,
                width: el.offsetWidth,
                height: el.offsetHeight,
            });
        }
    }, [hovered, activeTab]);

    return (
        <>
            <div className="flex  items-center justify-between p-4">
                <AppLogo />
                <nav className="relative flex items-center gap-1 px-2 py-2 rounded-full border border-border border-b-3 bg-surface/80 backdrop-blur-md">
                    {indicatorStyle && (
                        <motion.div
                            className="absolute top-0 left-0 rounded-full bg-surface-raised pointer-events-none flex flex-col-reverse items-center"
                            initial={false}
                            animate={indicatorStyle}
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        >
                            <div className="h-1 w-1 bg-primary rounded-full"></div>
                        </motion.div>
                    )}

                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            ref={(el) => {
                                tabRefs.current[tab] = el;
                            }}
                            onClick={() => setActiveTab(tab)}
                            onMouseEnter={() => setHovered(tab)}
                            onMouseLeave={() => setHovered(null)}
                            className="relative z-10 px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors"
                            style={{
                                color:
                                    activeTab === tab || hovered === tab
                                        ? "var(--foreground)"
                                        : "var(--muted-text)",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                {status === "loading" ? (
                    <div className="h-8 w-24 rounded-full bg-surface-raised animate-pulse" />
                ) : session?.user ? (
                    <div className="flex gap-2">
                        <Link
                            href="/chat"
                            className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground cursor-pointer hover:bg-primary-hover transition-colors"
                        >
                            Deep Dive
                        </Link>
                        <Image
                            src={session.user?.image || "/logo-filled.png"}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="rounded-full"
                        ></Image>
                    </div>
                ) : (
                    <Button label="Get Started" onClick={() => setAuthModalOpen(true)} />
                )}
            </div>
            <SignInModal open={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
        </>
    );
}
