import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";

export const apiClient = axios.create();

let renewing: Promise<string | null> | null = null;

// reading the session runs the NextAuth jwt callback, which rotates the tokens
// when the access token is near or past expiry; concurrent 401s share one read
export function renewAccessToken(): Promise<string | null> {
    renewing ??= getSession()
        .then((session) => {
            const accessToken = session?.error ? null : (session?.accessToken ?? null);
            useUserSessionStore.getState().setSession(session?.user ?? null, accessToken);
            return accessToken;
        })
        .catch(() => null)
        .finally(() => {
            renewing = null;
        });
    return renewing;
}

apiClient.interceptors.request.use((config) => {
    const accessToken = useUserSessionStore.getState().accessToken;
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const config = error.config as
            (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

        if (error.response?.status !== 401 || !config) return Promise.reject(error);

        if (!config._retried) {
            config._retried = true;
            const accessToken = await renewAccessToken();
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(config);
            }
        }

        signOut({ callbackUrl: "/" });
        return Promise.reject(error);
    },
);
