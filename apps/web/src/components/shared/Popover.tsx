'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { RefObject, useEffect, useRef, useState, useLayoutEffect } from 'react';

interface PopoverProps {
    anchorRef: RefObject<HTMLElement | null>;
    children: React.ReactNode;
    open: boolean;
    className?: string;
    onClose: () => void;
}

interface Position {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

function computePosition(anchor: HTMLElement, popover: HTMLElement): Position {
    const a = anchor.getBoundingClientRect();
    const p = popover.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceBelow = vh - a.bottom;
    const spaceAbove = a.top;
    const spaceRight = vw - a.left;

    const vertical: Position =
        spaceBelow > p.height || spaceBelow >= spaceAbove
            ? { top: a.bottom + 4 }
            : { bottom: vh - a.top + 4 };
    const horizontal: Position = spaceRight >= p.width ? { left: a.left } : { right: vw - a.right };

    return { ...vertical, ...horizontal };
}

export default function Popover({ anchorRef, children, open, onClose, className }: PopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<Position>({});

    useLayoutEffect(() => {
        if (!open || !anchorRef.current || !popoverRef.current) return;
        setPos(computePosition(anchorRef.current, popoverRef.current));

        const handleResize = () => {
            if (anchorRef.current && popoverRef.current)
                setPos(computePosition(anchorRef.current, popoverRef.current));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [open, anchorRef]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popoverRef.current?.contains(e.target as Node) ||
                anchorRef.current?.contains(e.target as Node)
            )
                return;
            onClose();
        };
        document.addEventListener('keydown', handler);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handler);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose, anchorRef]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={popoverRef}
                    style={{ position: 'fixed', ...pos }}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className={`z-50 rounded-lg border border-border bg-surface shadow-lg overflow-hidden ${className}`}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
