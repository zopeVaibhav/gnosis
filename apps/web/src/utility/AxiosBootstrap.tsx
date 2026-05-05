'use client';

import { API_URL, REFRESH_URL } from '@/routes/api-routes';
import axios from 'axios';
import { showToast } from '../lib/ToastProvider';
import { ERROR_CODES } from '@gnosis/types';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

let isRefreshing = false;
let refreshQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

function drainQueue(err?: unknown) {
    refreshQueue.forEach((cb) => (err ? cb.reject(err) : cb.resolve()));
    refreshQueue = [];
}

function redirectToHome() {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
    }
}

axios.interceptors.response.use(
    (response) => ({ ...response, data: response.data?.data ?? response.data }),
    async (error) => {
        const code: string | undefined = error.response?.data?.code;
        const status: number | undefined = error.response?.status;

        if (
            status === 401 &&
            (code === ERROR_CODES.REFRESH_TOKEN_EXPIRED ||
                code === ERROR_CODES.TOKEN_REUSE_DETECTED ||
                code === ERROR_CODES.INVALID_REFRESH_TOKEN)
        ) {
            drainQueue(error);
            redirectToHome();
            return Promise.reject(error);
        }

        if (status === 401 && code === 'ACCESS_TOKEN_EXPIRED' && !error.config._retry) {
            if (isRefreshing) {
                return new Promise<void>((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                }).then(() => axios({ ...error.config, _retry: true }));
            }

            isRefreshing = true;
            error.config._retry = true;

            try {
                await axios.post(REFRESH_URL);
                drainQueue();
                isRefreshing = false;
                return axios({ ...error.config, _retry: true });
            } catch (refreshError) {
                drainQueue(refreshError);
                isRefreshing = false;
                redirectToHome();
                return Promise.reject(refreshError);
            }
        }

        const message: string =
            error.response?.data?.message ?? error.message ?? 'Something went wrong';
        showToast.error(message);
        return Promise.reject(error);
    },
);

export default function AxiosBootstrap() {
    return null;
}
