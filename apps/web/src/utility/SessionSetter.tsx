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
        axios.get(GET_INTEGRATIONS).then((res) => {
            setIntegrations(res.data ?? null);
        });
    }, [session, setIntegrations]);

    return null;
}
