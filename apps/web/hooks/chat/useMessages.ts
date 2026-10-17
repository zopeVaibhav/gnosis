"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { ApiResponse, Message } from "@gnosis/types";
import { GET_MESSAGES } from "@/routes/api_routes";
import { apiClient } from "@/lib/axios";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";

export const MESSAGES_QUERY_ROOT = "messages";

export const messagesQueryKey = (chatId: string) => [MESSAGES_QUERY_ROOT, chatId] as const;

export function useMessages(chatId: string | undefined) {
    const signedIn = Boolean(useUserSessionStore((s) => s.accessToken));

    return useQuery<Message[]>({
        queryKey: messagesQueryKey(chatId ?? ""),
        enabled: signedIn && Boolean(chatId),
        queryFn: async ({ signal }) => {
            const { data } = await apiClient.get<ApiResponse<Message[]>>(GET_MESSAGES(chatId!), {
                signal,
            });
            return data.data ?? [];
        },
        retry: (failureCount, error) => !isNotFound(error) && failureCount < 1,
    });
}

export function isNotFound(error: unknown): boolean {
    return isAxiosError(error) && error.response?.status === 404;
}
