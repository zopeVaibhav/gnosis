'use client';

import { API_URL } from '@/routes/api-routes';
import axios from 'axios';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
    (response) => ({ ...response, data: response.data?.data ?? response.data }),
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            window.location.href = '/';
        }
        return Promise.reject(error);
    },
);

export default function AxiosBootstrap() {
    return null;
}
