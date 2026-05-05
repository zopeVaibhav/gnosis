'use client';

import ChatsSidebar from '@/src/components/ChatsSidebar';

export default function NewLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-screen flex">
            <ChatsSidebar />
            <div className="flex flex-col h-full w-full">{children}</div>
        </div>
    );
}
