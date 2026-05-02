'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export default function Modal({ open, onClose, children, className }: ModalProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={onClose}
                >
                    <motion.div
                        className={`relative bg-surface border border-border rounded-xl shadow-xl mx-4 ${className ?? ''}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
