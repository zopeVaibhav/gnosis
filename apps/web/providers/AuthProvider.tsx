"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useEffect } from "react";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";

const SESSION_POLL_SEC = 4 * 60;

function SessionSetter() {
    const { data: session } = useSession();
    const setSession = useUserSessionStore((state) => state.setSession);

    useEffect(() => {
        if (session?.error) {
            setSession(null, null);
            signOut({ callbackUrl: "/" });
            return;
        }

        setSession(session?.user ?? null, session?.accessToken ?? null);
    }, [session, setSession]);

    return null;
}

export default function AuthProvider({
    children,
    session,
}: {
    children: React.ReactNode;
    session: Session | null;
}) {
    return (
        <SessionProvider session={session} refetchInterval={SESSION_POLL_SEC} refetchOnWindowFocus>
            <SessionSetter />
            {children}
        </SessionProvider>
    );
}
