'use client';
import { useUserSessionStore } from '@/src/store/user/useUserSessionStore';
import { Session } from 'next-auth';

export default function SessionSetter({ session }: { session: Session | null }) {
    if (useUserSessionStore.getState().session !== session) {
        useUserSessionStore.setState({ session });
    }
    return null;
}
