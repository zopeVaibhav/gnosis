"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Chat } from "@gnosis/types";
import { GET_CHATS } from "@/routes/api_routes";
import { apiClient } from "@/lib/axios";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";

export const chatsQueryKey = ["chats"] as const;

export function useChats() {
    const signedIn = Boolean(useUserSessionStore((s) => s.accessToken));

    return useQuery<Chat[]>({
        queryKey: chatsQueryKey,
        enabled: signedIn,
        queryFn: async ({ signal }) => {
            const { data } = await apiClient.get<ApiResponse<Chat[]>>(GET_CHATS, { signal });
            return data.data ?? [];
        },
    });
}
