"use client";

import ChatInput from "@/components/ChatInput";
import ChatTranscript from "@/components/chat/ChatTranscript";
import { useEffect } from "react";
import { useChatStore } from "@/store/chat/useChatStore";
import { useParams, useRouter } from "next/navigation";
import { isNotFound, useMessages } from "@/hooks/chat/useMessages";

export default function ChatPage() {
    const { messages, isStreaming, error, setActiveChatId, reset, setMessages } = useChatStore();
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { data, error: loadError, isLoading } = useMessages(id);

    useEffect(() => {
        if (!id) return;
        setActiveChatId(id);
        return () => reset();
    }, [id, setActiveChatId, reset]);

    useEffect(() => {
        // the store owns messages mid-stream; server copy lands once the stream ends and the query refetches
        if (!data || useChatStore.getState().isStreaming) return;
        setMessages(data);
    }, [data, setMessages]);

    useEffect(() => {
        if (isNotFound(loadError)) router.push("/");
    }, [loadError, router]);

    return (
        <>
            <ChatTranscript
                messages={messages}
                restoring={isLoading}
                isStreaming={isStreaming}
                error={error}
            />
            <div className="pb-4 sticky bottom-0 z-50 bg-background w-3xl">
                <ChatInput />
            </div>
        </>
    );
}
