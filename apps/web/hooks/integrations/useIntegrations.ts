"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@gnosis/types";
import { GET_INTEGRATIONS } from "@/routes/api_routes";
import { apiClient } from "@/lib/axios";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";

export interface ConnectedService {
    service: string;
    connected: boolean;
}

export const integrationsQueryKey = ["integrations"] as const;

export function useIntegrations() {
    const signedIn = Boolean(useUserSessionStore((s) => s.accessToken));

    return useQuery<ConnectedService[]>({
        queryKey: integrationsQueryKey,
        enabled: signedIn,
        queryFn: async ({ signal }) => {
            const { data } = await apiClient.get<ApiResponse<ConnectedService[]>>(
                GET_INTEGRATIONS,
                { signal },
            );
            return data.data ?? [];
        },
    });
}
