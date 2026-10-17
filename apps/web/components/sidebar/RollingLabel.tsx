"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ROLL_DELAY_MS, ROLL_PIXELS_PER_SECOND, ROLL_RESET_MS } from "@/lib/motion";

/** A one-line label that, on hover, slowly scrolls to reveal whatever the row truncated. */
export default function RollingLabel({
    text,
    rolling,
    className = "",
}: {
    text: string;
    rolling: boolean;
    className?: string;
}) {
    const trackRef = useRef<HTMLSpanElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [overflow, setOverflow] = useState(0);
    const [ready, setReady] = useState(false);

    useLayoutEffect(() => {
        const track = trackRef.current;
        const label = textRef.current;
        if (!track || !label) return;
        setOverflow(Math.max(0, label.scrollWidth - track.clientWidth));
    }, [text, rolling, ready]);

    useEffect(() => {
        const timer = setTimeout(() => setReady(rolling), rolling ? ROLL_DELAY_MS : 0);
        return () => clearTimeout(timer);
    }, [rolling]);

    const active = rolling && ready;
    const shift = active ? overflow : 0;
    const duration = active
        ? Math.round((overflow / ROLL_PIXELS_PER_SECOND) * 1000)
        : ROLL_RESET_MS;

    return (
        <span
            ref={trackRef}
            className={`min-w-0 flex-1 overflow-hidden ${overflow > 0 ? "mask-r-from-85%" : ""} ${className}`}
        >
            <span
                ref={textRef}
                className="inline-block max-w-none whitespace-nowrap align-bottom transition-transform ease-linear"
                style={{
                    transform: `translateX(-${shift}px)`,
                    transitionDuration: `${duration}ms`,
                }}
            >
                {text}
            </span>
        </span>
    );
}
