'use client';

import { API_URL } from '@/routes/api-routes';
import axios from 'axios';
import { useEffect } from 'react';

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export default function AxiosBootstrap() {
    useEffect(() => {
        const id = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && typeof window !== 'undefined') {
                    window.location.href = '/';
                }
                return Promise.reject(error);
            },
        );
        return () => {
            axios.interceptors.response.eject(id);
        };
    }, []);

    return null;
}
