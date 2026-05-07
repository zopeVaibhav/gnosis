import { Message, ROLE } from '@gnosis/types';
import { create } from 'zustand';

interface ChatStore {
    messages: Message[];
    activeChatId: string | null;
    isStreaming: boolean;
    streamingMessageId: string | null;
    error: string | null;

    setMessages: (messages: Message[]) => void;
    setActiveChatId: (id: string | null) => void;
    appendUserMessage: (content: string) => void;
    startAssistantStream: () => string;
    appendToken: (id: string, token: string) => void;
    finishStream: () => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    messages: [],
    activeChatId: null,
    isStreaming: false,
    streamingMessageId: null,
    error: null,

    setMessages: (messages) => set({ messages }),
    setActiveChatId: (activeChatId) => set({ activeChatId }),

    appendUserMessage: (content) =>
        set((state) => ({
            messages: [
                ...state.messages,
                {
                    id: crypto.randomUUID(),
                    role: ROLE.USER,
                    content,
                },
            ],
        })),
    startAssistantStream: () => {
        const id = crypto.randomUUID();
        set((state) => ({
            messages: [
                ...state.messages,
                {
                    id,
                    role: ROLE.ASSISTANT,
                    content: '',
                    pending: true,
                },
            ],
            isStreaming: true,
            streamingMessageId: id,
            error: null,
        }));
        return id;
    },
    appendToken: (id, token) =>
        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === id
                    ? {
                          ...m,
                          content: m.content + token,
                      }
                    : m,
            ),
        })),
    finishStream: () =>
        set((state) => ({
            isStreaming: false,
            streamingMessageId: null,
            messages: state.messages.map((m) =>
                m.id === state.streamingMessageId ? { ...m, pending: false } : m,
            ),
        })),
    setError: (error) => set({ error }),
    reset: () =>
        set({
            messages: [],
            activeChatId: null,
            isStreaming: false,
            streamingMessageId: null,
            error: null,
        }),
}));
