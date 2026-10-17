import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// per character so every title types at the same speed, capped so a long one doesn't drag
const TYPING_SECONDS_PER_CHARACTER = 0.014;
const TYPING_MAX_SECONDS = 0.45;

function typingSeconds(length: number): number {
    return Math.min(length * TYPING_SECONDS_PER_CHARACTER, TYPING_MAX_SECONDS);
}

/**
 * Types a title in when it first arrives (none -> some). A row that mounts already titled draws it
 * outright, otherwise opening the app would set the whole list typing at once.
 */
export function useTypedReveal(title: string | null | undefined): string | null | undefined {
    const reduce = useReducedMotion();
    const previous = useRef(title);
    const firstRun = useRef(true);
    const [typed, setTyped] = useState<number | null>(null);

    useEffect(() => {
        const from = previous.current;
        previous.current = title;
        const mounting = firstRun.current;
        firstRun.current = false;
        if (mounting || !title || from || reduce) return;

        let frame = 0;
        const started = performance.now();
        const total = typingSeconds(title.length) * 1000;
        // linear on purpose: an eased typewriter reads as hesitation
        const step = (now: number) => {
            const progress = Math.min((now - started) / total, 1);
            setTyped(Math.round(progress * title.length));
            if (progress < 1) {
                frame = requestAnimationFrame(step);
                return;
            }
            setTyped(null);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [title, reduce]);

    if (typed === null || !title) return title;
    return title.slice(0, typed);
}
