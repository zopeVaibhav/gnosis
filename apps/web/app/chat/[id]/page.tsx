'use client';

import ChatInputComponent from '@/src/components/ChatInputComponent';

export default function ChatPage() {
    return (
        <div className="flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto p-4">{/* messages render here */}</div>
            <div className="p-4">
                <ChatInputComponent />
            </div>
        </div>
    );
}
