import { useUserSessionStore } from '@/src/store/user/useUserSessionStore';
import { signOut } from 'next-auth/react';

export default function HomePage() {
    const session = useUserSessionStore((s) => s.session);

    return (
        <div>
            <h1>welcome {session?.user.name}</h1>
            <button onClick={() => signOut({ callbackUrl: '/signin' })}>signout</button>
        </div>
    );
}
