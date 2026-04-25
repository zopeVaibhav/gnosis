'use client';
import { useUserSessionStore } from '@/src/store/user/useUserSessionStore';
import { Session } from 'next-auth';
import { useEffect } from 'react';

export default function SessionSetter({ session }: { session: Session | null }) {
    const setSessoin = useUserSessionStore((s) => s.setSession);
    useEffect(() => setSessoin(session), [session, setSessoin]);
    return null;
}
