"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo, ReactNode, useEffect, useRef, useState } from "react";
import { Message, ROLE } from "@gnosis/types";
import { Streamdown } from "streamdown";
import Skeleton from "@/components/shared/Skeleton";
import { EASE_OUT, ENTRANCE_SECONDS } from "@/lib/motion";
import { markdownComponents, markdownPlugins } from "@/lib/markdown";

// opening a chat cascades its last few messages in; anything sent afterwards arrives with no wait
const FIRST_PAINT_STAGGER_COUNT = 12;
const FIRST_PAINT_STAGGER_SECONDS = 0.04;

function createFirstPaintDelays() {
    const decided = new Map<string, number>();
    let settled = false;

    return {
        settle() {
            settled = true;
        },
        delayFor(id: string, index: number, total: number): number {
            const known = decided.get(id);
            if (known !== undefined) return known;
            const place = index - Math.max(0, total - FIRST_PAINT_STAGGER_COUNT);
            const delay = settled || place < 0 ? 0 : place * FIRST_PAINT_STAGGER_SECONDS;
            decided.set(id, delay);
            return delay;
        },
    };
}

// shaped like the conversation that is coming, on the same line pitch so the column doesn't jump
const RESTORING_ANSWER_WIDTHS = ["w-full", "w-11/12", "w-full", "w-10/12", "w-11/12", "w-2/3"];

function RestoringTranscript() {
    return (
        <div aria-label="Loading this conversation" role="status">
            <div aria-hidden className="flex justify-end pb-7">
                <Skeleton className="h-10 w-64 rounded-xl" />
            </div>
            <div aria-hidden className="flex flex-col gap-3">
                {RESTORING_ANSWER_WIDTHS.map((width, idx) => (
                    <Skeleton key={idx} className={`h-4 ${width}`} />
                ))}
            </div>
        </div>
    );
}

/** The assistant has the turn and hasn't produced a token yet. */
function Thinking() {
    return (
        <p className="shimmer-text text-sm text-muted" role="status">
            Thinking
        </p>
    );
}

/** The turn ended without an answer. Not a message: it is gone once the next turn starts. */
function Stopped({ reason }: { reason: string }) {
    return (
        <p className="text-sm text-danger" role="alert">
            {reason}
        </p>
    );
}

/** Fades a message up into place. Transform and opacity only, so it never shifts layout. */
function Arriving({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            className="flex w-full flex-col"
            initial={{
                opacity: 0,
                transform: shouldReduceMotion ? "none" : "translateY(8px)",
            }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{
                delay: shouldReduceMotion ? 0 : delay,
                duration: ENTRANCE_SECONDS,
                ease: EASE_OUT,
            }}
        >
            {children}
        </motion.div>
    );
}

// memoised on primitives so a streaming reply only re-renders the message that is changing
const TranscriptMessage = memo(function TranscriptMessage({
    role,
    content,
    delay,
}: {
    role: ROLE;
    content: string;
    delay: number;
}) {
    const isUser = role === ROLE.USER;

    return (
        <Arriving delay={delay}>
            {isUser ? (
                <div className="w-fit max-w-[80%] min-w-0 self-end overflow-hidden rounded-xl bg-surface-faded px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {content}
                </div>
            ) : (
                // the assistant takes the whole column so code blocks and tables span it rather than shrink to their text
                <div className="w-full min-w-0 text-sm leading-relaxed wrap-break-word">
                    {/* streaming-aware: an unclosed fence or bold marker mid-stream is closed for the
                        duration instead of flashing raw backticks until the closing token lands */}
                    <Streamdown components={markdownComponents} plugins={markdownPlugins}>
                        {content}
                    </Streamdown>
                </div>
            )}
        </Arriving>
    );
});

export default function ChatTranscript({
    messages,
    restoring,
    isStreaming,
    error,
}: {
    messages: Message[];
    restoring: boolean;
    isStreaming: boolean;
    error: string | null;
}) {
    // one decider per mounted transcript; it remembers each message's delay so re-renders never replay it
    const [delays] = useState(createFirstPaintDelays);

    const bottomRef = useRef<HTMLDivElement>(null);
    const hasMessages = messages.length > 0;

    // an assistant row with no text yet is drawn as Thinking (or nothing, if the turn failed), never a blank bubble
    const items = messages.filter((m) => m.role === ROLE.USER || m.content);
    const last = messages[messages.length - 1];
    const waitingOnFirstToken = isStreaming && last?.role === ROLE.ASSISTANT && !last.content;

    useEffect(() => {
        if (hasMessages) delays.settle();
    }, [hasMessages, delays]);

    const lastContent = last?.content;
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: isStreaming ? "smooth" : "auto" });
    }, [messages.length, lastContent, isStreaming]);

    return (
        <div
            role="log"
            aria-busy={isStreaming}
            className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6"
        >
            {!hasMessages && restoring ? <RestoringTranscript /> : null}
            {items.map((m, index) => (
                <TranscriptMessage
                    key={m.id}
                    role={m.role}
                    content={m.content}
                    delay={delays.delayFor(m.id, index, items.length)}
                />
            ))}
            {error && !isStreaming ? (
                <Stopped reason={error} />
            ) : waitingOnFirstToken ? (
                <Thinking />
            ) : null}
            <div ref={bottomRef} aria-hidden />
        </div>
    );
}
