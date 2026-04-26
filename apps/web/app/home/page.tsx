import { useUserSessionStore } from '@/src/store/user/useUserSessionStore';

export default function HomePage() {
    const session = useUserSessionStore((s) => s.session);

    return (
        <div>
            <h1>welcome {session?.user.name}</h1>
        </div>
    );
}
