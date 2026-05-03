'use client';
import { Plus, SendIcon } from 'lucide-react';
import { useRef } from 'react';

export default function ChatInputComponent() {
    const ref = useRef<HTMLTextAreaElement>(null);

    const handleInput = () => {
        const el = ref.current;
        if (!el) return;
        const lineHeight = parseInt(getComputedStyle(el).lineHeight);
        const maxHeight = lineHeight * 6;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
        el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    return (
        <div className="flex items-center justify-center flex-1">
            <div className="border border-border p-4 rounded-xl w-2xl shadow-sm shadow-primary">
                <textarea
                    ref={ref}
                    rows={1}
                    onInput={handleInput}
                    className="border-none outline-none appearance-none p-0 m-0 mb-4 w-full bg-transparent resize-none overflow-y-hidden"
                    placeholder=" Ask anything..."
                />
                <div className="flex items-center justify-between">
                    <Plus strokeWidth={1} />
                    <SendIcon strokeWidth={1} />
                </div>
            </div>
        </div>
    );
}
