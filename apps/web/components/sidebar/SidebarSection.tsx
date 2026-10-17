"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";
import { EASE_OUT, ENTRANCE_SECONDS } from "@/lib/motion";

export default function SidebarSection({
    label,
    open,
    onToggle,
    children,
}: {
    label: string;
    open: boolean;
    onToggle: () => void;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-7 shrink-0 items-center">
                <button
                    type="button"
                    className="flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-xs font-semibold tracking-tight text-muted outline-none hover:text-foreground focus-visible:ring-1 focus-visible:ring-border"
                    onClick={onToggle}
                    aria-expanded={open}
                >
                    {label}
                    <ChevronDown
                        aria-hidden
                        className={`size-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
                    />
                </button>
            </div>
            <div className="relative flex min-h-0 flex-1 flex-col">
                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div
                            key="content"
                            className="scrollbar-none flex min-h-0 flex-1 flex-col gap-px overflow-y-auto pb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: ENTRANCE_SECONDS, ease: EASE_OUT }}
                        >
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
                {open && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-background to-transparent" />
                )}
            </div>
        </div>
    );
}
