import { useEffect } from 'react';

interface ShortcutOptions {
    meta?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
}

export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    options: ShortcutOptions = {},
) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const { meta = false, ctrl = false, shift = false, alt = false } = options;
            if (
                e.key === key &&
                e.metaKey === meta &&
                e.ctrlKey === ctrl &&
                e.shiftKey === shift &&
                e.altKey === alt
            ) {
                e.preventDefault();
                callback();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, callback, options]);
}
