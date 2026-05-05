'use client';

import { GET_MESSAGES } from '@/routes/api-routes';
import ChatInputComponent from '@/src/components/ChatInputComponent';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROLE } from '@gnosis/types';

interface Message {
    id: string;
    role: ROLE;
    content: string;
}

export default function ChatPage() {
    const [messages, setMessage] = useState<Message[]>([]);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;
        axios.get(GET_MESSAGES(id)).then((res) => setMessage(res.data ?? []));
    }, [id]);

    return (
        <div className="flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((m) => (
                    <div
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
            <div className="p-4">
                <ChatInputComponent />
            </div>
        </div>
    );
}
