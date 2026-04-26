'use client';
import Demo from '@/src/components/demo';
import { useUserSessionStore } from '@/src/store/user/useUserSessionStore';

export default function Home() {
    const session = useUserSessionStore().session;
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <h1>GNOSIS</h1>
            <div>HEllO {session?.user.name}</div>
            <Demo />
        </div>
    );
}
