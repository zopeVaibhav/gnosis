import { Session } from 'next-auth';
import { create } from 'zustand';

interface UserSessionStore {
    session: Session | null;
    setSession: (session: Session | null) => void;
}

export const useUserSessionStore = create<UserSessionStore>((set) => ({
    session: null,
    setSession: (session) => set({ session }),
}));
