'use client';

import AppLogoComponent from '@/src/components/AppLogo';
import ChatInputComponent from '@/src/components/ChatInputComponent';
import { useChatStore } from '@/src/store/chat/useChatStore';
import { useEffect } from 'react';

export default function NewPage() {
    const { reset } = useChatStore();
    useEffect(() => reset(), []);
    return (
        <div className="flex flex-col flex-1 items-center justify-center gap-8">
            <div className="flex gap-4 text-3xl items-center">
                <AppLogoComponent iconOnly={true} />
                <p>What&apos;s on your mind today?</p>
            </div>
            <div className="w-2xl">
                <ChatInputComponent />
            </div>
        </div>
    );
}
