import { STREAM_MESSAGE } from "@gnosis/types";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useRef } from "react";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import type { Chat } from "@gnosis/types";
import { useChatStore } from "@/store/chat/useChatStore";
import { SEND_MESSAGE } from "@/routes/api_routes";
import { chatsQueryKey } from "@/hooks/chat/useChats";
import { messagesQueryKey } from "@/hooks/chat/useMessages";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";
import { renewAccessToken } from "@/lib/axios";

type Frame = {
    type: STREAM_MESSAGE;
    content: string;
};

export default function useSendMessage() {
    const router = useRouter();
    const abortRef = useRef<AbortController | null>(null);
    const queryClient = useQueryClient();

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

        const token = useUserSessionStore.getState().accessToken;
        if (!token) {
            setError("Not authenticated");
            return;
        }

        appendUserMessage(trimmed);
        const assistantId = startAssistantStream();

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const post = (accessToken: string) =>
                fetch(SEND_MESSAGE, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        message: trimmed,
                        id: state.activeChatId ?? undefined,
                    }),
                    signal: controller.signal,
                });

            let res = await post(token);
            if (res.status === 401) {
                const renewed = await renewAccessToken();
                if (renewed) res = await post(renewed);
            }
            if (res.status === 401) {
                finishStream();
                signOut({ callbackUrl: "/" });
                return;
            }
            if (!res.ok || !res.body) {
                setError("Failed to stream message");
                finishStream();
                return;
            }
            await readSSE(res.body, (frame) => {
                handleFrame(frame, {
                    assistantId,
                    appendToken,
                    setActiveChatId,
                    router,
                    queryClient,
                });
            });
            finishStream();

            const chatId = useChatStore.getState().activeChatId;
            if (chatId) queryClient.invalidateQueries({ queryKey: messagesQueryKey(chatId) });
        } catch (error) {
            if ((error as Error).name === "AbortError") return;
            setError("Stream interrupted");
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
    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data: ")) continue;
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
        queryClient: QueryClient;
    },
) {
    switch (frame.type) {
        case STREAM_MESSAGE.CHAT_CREATED:
            ctx.setActiveChatId(frame.content);
            ctx.router.replace(`/chat/${frame.content}`);
            ctx.queryClient.setQueryData<Chat[]>(chatsQueryKey, (chats = []) => [
                { id: frame.content, title: null },
                ...chats,
            ]);
            break;

        case STREAM_MESSAGE.CHAT_MESSAGE:
            ctx.appendToken(ctx.assistantId, frame.content);
            break;

        case STREAM_MESSAGE.CHAT_TITLE:
            const chatId = useChatStore.getState().activeChatId;
            if (!chatId) break;
            ctx.queryClient.setQueryData<Chat[]>(chatsQueryKey, (chats = []) =>
                chats.map((chat) =>
                    chat.id === chatId ? { ...chat, title: frame.content } : chat,
                ),
            );
            break;

        case STREAM_MESSAGE.COMPLETED:
            break;
    }
}
