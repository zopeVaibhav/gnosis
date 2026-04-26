import { API_URL, REFRESH_TOKEN_URL } from '@/routes/api-routes';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = axios
        .post(REFRESH_TOKEN_URL, null, { withCredentials: true })
        .then(() => undefined)
        .finally(() => (refreshPromise = null));
    return refreshPromise;
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

        const status = error.response?.status;
        const isRefreshCall = original?.url?.includes('/auth/refresh');

        if (status !== 401 || original?._retried || isRefreshCall) {
            return Promise.reject(error);
        }

        original._retried = true;

        try {
            await refreshTokens();
        } catch {
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
            return Promise.reject(error);
        }

        return api(original);
    },
);
