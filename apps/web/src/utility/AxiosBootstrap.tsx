'use client';

import { API_URL } from '@/routes/api-routes';
import axios from 'axios';
import { showToast } from '../lib/ToastProvider';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
    (response) => ({ ...response, data: response.data?.data ?? response.data }),
    (error) => {
        const message: string =
            error.response?.data?.message ?? error.message ?? 'Something went wrong';
        showToast.error(message);

        if (error.response?.status === 401 && typeof window !== 'undefined') {
            if (window.location.pathname !== '/') window.location.href = '/';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    },
);

export default function AxiosBootstrap() {
    return null;
}
