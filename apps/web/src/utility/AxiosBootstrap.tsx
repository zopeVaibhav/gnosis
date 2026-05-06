'use client';

import { API_URL, REFRESH_URL } from '@/routes/api-routes';
import axios from 'axios';
import { showToast } from '../lib/ToastProvider';
import { ERROR_CODES } from '@gnosis/types';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

let refreshPromise: Promise<void> | null = null;

function refreshOnce() {
    if (!refreshPromise) {
        refreshPromise = axios
            .post(REFRESH_URL)
            .then(() => undefined)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
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
                code === ERROR_CODES.INVALID_REFRESH_TOKEN)
        ) {
            redirectToHome();
            return Promise.reject(error);
        }

        if (status === 401 && code === ERROR_CODES.ACCESS_TOKEN_EXPIRED && !error.config._retry) {
            error.config._retry = true;
            try {
                await refreshOnce();
                return axios(error.config);
            } catch (refreshError) {
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
