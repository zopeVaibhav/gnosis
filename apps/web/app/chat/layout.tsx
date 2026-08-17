"use client";

import ChatsSidebar from "@/components/ChatsSidebar";

export default function NewLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-screen flex">
            <ChatsSidebar />
            <div className="flex flex-col h-full w-full items-center overflow-y-auto min-h-0">
                {children}
            </div>
        </div>
    );
}
