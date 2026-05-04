'use client';
import { GET_INTEGRATIONS } from '@/routes/api-routes';
import { useUserSessionStore } from '@/src/store/user/useUserSessionStore';
import axios from 'axios';
import { Session } from 'next-auth';
import { useEffect } from 'react';

export default function SessionSetter({ session }: { session: Session | null }) {
    const { setSession, setIntegrations } = useUserSessionStore();

    useEffect(() => {
        setSession(session);
    }, [session, setSession]);

    useEffect(() => {
        if (!session) return;
        const init = async () => {
            await fetch('/api/auth/sync-session', { method: 'POST' });
            const response = await axios.get(GET_INTEGRATIONS, { withCredentials: true });
            setIntegrations(response.data ?? null);
        };
        init();
    }, [session]);

    return null;
}
