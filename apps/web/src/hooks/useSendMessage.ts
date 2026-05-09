import { STREAM_MESSAGE } from '@gnosis/types';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { useChatStore } from '../store/chat/useChatStore';
import { SEND_MESSAGE } from '@/routes/api-routes';
import { useChatListStore } from '../store/chat/useChatListStore';

type Frame = {
    type: STREAM_MESSAGE;
    content: string;
};

export default function useSendMessage() {
    const router = useRouter();
    const abortRef = useRef<AbortController | null>(null);

    const {
        appendUserMessage,
        appendToken,
        startAssistantStream,
        finishStream,
        setActiveChatId,
        setError,
    } = useChatStore();

    const send = async (message: string) => {
        const trimmed = message.trim();
        const state = useChatStore.getState();
        if (!trimmed || state.isStreaming) return;

        appendUserMessage(trimmed);
        const assistantId = startAssistantStream();

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await fetch(SEND_MESSAGE, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: trimmed, id: state.activeChatId ?? undefined }),
                signal: controller.signal,
            });
            if (!res.ok || !res.body) {
                setError('Failed to stream message');
                finishStream();
                return;
            }
            await readSSE(res.body, (frame) => {
                handleFrame(frame, { assistantId, appendToken, setActiveChatId, router });
            });
            finishStream();
        } catch (error) {
            if ((error as Error).name === 'AbortError') return;
            setError('Stream interrupted');
            finishStream();
        } finally {
            abortRef.current = null;
        }
    };

    const cancel = () => abortRef.current?.abort();

    return {
        send,
        cancel,
    };
}

async function readSSE(body: ReadableStream<Uint8Array>, onFrame: (frame: Frame) => void) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith('data: ')) continue;
            try {
                const json = JSON.parse(line.slice(6)) as Frame;
                onFrame(json);
            } catch {
                // malformed frame - skip
            }
        }
    }
}

function handleFrame(
    frame: Frame,
    ctx: {
        assistantId: string;
        appendToken: (id: string, token: string) => void;
        setActiveChatId: (id: string | null) => void;
        router: ReturnType<typeof useRouter>;
    },
) {
    const { appendChatList, updateChatTitle } = useChatListStore.getState();
    switch (frame.type) {
        case STREAM_MESSAGE.CHAT_CREATED:
            ctx.setActiveChatId(frame.content);
            ctx.router.replace(`/chat/${frame.content}`);
            appendChatList({
                id: frame.content,
                title: null,
            });
            break;

        case STREAM_MESSAGE.CHAT_MESSAGE:
            ctx.appendToken(ctx.assistantId, frame.content);
            break;

        case STREAM_MESSAGE.CHAT_TITLE:
            const chatId = useChatStore.getState().activeChatId;
            if (!chatId) break;
            updateChatTitle(chatId, frame.content);
            break;

        case STREAM_MESSAGE.COMPLETED:
            break;
    }
}
