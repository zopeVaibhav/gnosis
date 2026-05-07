'use client';

import ChatInputComponent from '@/src/components/ChatInputComponent';
import { useEffect, useRef } from 'react';
import { Message, ROLE } from '@gnosis/types';
import { useChatStore } from '@/src/store/chat/useChatStore';
import { useParams } from 'next/navigation';
import { GET_MESSAGES } from '@/routes/api-routes';
import axios from 'axios';

export default function ChatPage() {
    const { messages, setActiveChatId, reset, setMessages } = useChatStore();
    const bottomRef = useRef<HTMLDivElement>(null);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;
        setActiveChatId(id);
        if (useChatStore.getState().isStreaming) return;
        axios.get<Message[]>(GET_MESSAGES(id)).then((res) => {
            setMessages(res.data ?? []);
        });
        return () => reset();
    }, [id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <>
            <div className="w-3xl flex-1 py-4">
                {messages.map((m) => (
                    <div
                        ref={bottomRef}
                        key={m.id}
                        className={`flex ${m.role === ROLE.USER ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.role === ROLE.USER ? 'bg-surface-faded rounded-br-none' : 'bg-transparent'}`}
                        >
                            {m.content || (m.pending ? <span>Loading</span> : null)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="pb-4 sticky bottom-0 z-50 bg-background w-3xl">
                <ChatInputComponent />
            </div>
        </>
    );
}
