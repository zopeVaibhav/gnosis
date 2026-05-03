'use client';

import ChatInputComponent from '@/src/components/ChatInputComponent';
import NavbarComponent from '@/src/components/NavbarComponent';

export default function Page() {
    return (
        <div className="flex flex-col h-screen">
            <NavbarComponent />
            <ChatInputComponent />
        </div>
    );
}
