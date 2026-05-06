'use client';

import { GET_MESSAGES } from '@/routes/api-routes';
import ChatInputComponent from '@/src/components/ChatInputComponent';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ROLE } from '@gnosis/types';

interface Message {
    id: string;
    role: ROLE;
    content: string;
}

export default function ChatPage() {
    const [messages, setMessage] = useState<Message[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!id) return;
        axios.get(GET_MESSAGES(id)).then((res) => setMessage(res.data ?? []));
    }, [id]);

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
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>
            <div className="pb-4 sticky bottom-0 z-50 bg-background w-3xl">
                <ChatInputComponent id={id} />
            </div>
        </>
    );
}
