"use client";

import { useEffect } from "react";

export const SIDEBAR_MIN_WIDTH = 208;
export const SIDEBAR_MAX_WIDTH = 320;
export const SIDEBAR_DEFAULT_WIDTH = 260;
const SIDEBAR_COLLAPSE_THRESHOLD = 32;
const KEYBOARD_STEP = 16;

export function clampWidth(width: number): number {
    return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

export default function ResizeHandle({
    width,
    dragging,
    setWidth,
    setDragging,
    onCollapse,
}: {
    width: number;
    dragging: boolean;
    setWidth: (width: number) => void;
    setDragging: (dragging: boolean) => void;
    onCollapse: () => void;
}) {
    useEffect(() => {
        if (!dragging) return;

        const onMove = (event: PointerEvent) => {
            // dragging well past the minimum reads as "put it away"
            if (event.clientX < SIDEBAR_MIN_WIDTH - SIDEBAR_COLLAPSE_THRESHOLD) {
                onCollapse();
                setDragging(false);
                return;
            }
            setWidth(event.clientX);
        };
        const onUp = () => setDragging(false);

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [dragging, setDragging, setWidth, onCollapse]);

    return (
        <button
            type="button"
            role="separator"
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            aria-valuemin={SIDEBAR_MIN_WIDTH}
            aria-valuemax={SIDEBAR_MAX_WIDTH}
            aria-valuenow={width}
            className="group/rail absolute inset-y-0 right-0 z-20 hidden w-1 cursor-col-resize md:block"
            onPointerDown={() => setDragging(true)}
            onDoubleClick={onCollapse}
            onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    setWidth(width - KEYBOARD_STEP);
                }
                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    setWidth(width + KEYBOARD_STEP);
                }
            }}
        >
            <span
                aria-hidden
                className={`absolute top-1/2 right-0 h-20 w-1 -translate-y-1/2 rounded-full bg-border transition-opacity group-hover/rail:opacity-100 group-focus-visible/rail:opacity-100 ${dragging ? "opacity-100" : "opacity-0"}`}
            />
        </button>
    );
}
