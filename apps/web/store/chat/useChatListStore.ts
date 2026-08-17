import { create } from "zustand";
import { Chat } from "@gnosis/types";

interface UseChatListStore {
    chatList: Chat[];

    setChatList: (chatList: Chat[]) => void;
    updateChatTitle: (id: string, title: string) => void;
    appendChatList: (chat: Chat) => void;
}

export const useChatListStore = create<UseChatListStore>((set) => ({
    chatList: [],

    setChatList: (chatList) => set({ chatList }),

    appendChatList: (chat) =>
        set((state) => ({
            chatList: [chat, ...state.chatList],
        })),

    updateChatTitle: (id, title) =>
        set((state) => ({
            chatList: state.chatList.map((chat) => (chat.id === id ? { ...chat, title } : chat)),
        })),
}));
