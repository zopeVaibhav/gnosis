import { Session } from 'next-auth';
import { create } from 'zustand';

interface ConnectedService {
    service: string;
    connected: boolean;
}

interface UserSessionStore {
    session: Session | null;
    integrations: ConnectedService[] | null;

    setSession: (session: Session | null) => void;
    setIntegrations: (integrations: ConnectedService[] | null) => void;
    updateIntegration: (service: ConnectedService) => void;
}

export const useUserSessionStore = create<UserSessionStore>((set) => ({
    session: null,
    integrations: null,
    setSession: (session) => set({ session }),
    setIntegrations: (integrations) => set({ integrations }),
    updateIntegration: (service) =>
        set((state) => {
            const existing = state.integrations ?? [];
            const index = existing.findIndex((s) => s.service === service.service);
            if (index !== -1) {
                const updated = [...existing];
                updated[index] = service;
                return { integrations: updated };
            }
            return { integrations: [...existing, service] };
        }),
}));
