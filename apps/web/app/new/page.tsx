'use client';

import AppLogoComponent from '@/src/components/AppLogo';
import ChatInputComponent from '@/src/components/ChatInputComponent';
import ChatsSidebar from '@/src/components/ChatsSidebar';

export default function NewPage() {
    return (
        <div className="h-screen w-screen flex">
            <ChatsSidebar />
            <div className="flex flex-col w-full h-full items-center justify-center">
                <div>
                    <div className="flex gap-4 text-3xl w-full justify-center items-center mb-8">
                        <AppLogoComponent iconOnly={true} />
                        <p>What&apos;s on your mind today?</p>
                    </div>
                    <ChatInputComponent />
                </div>
            </div>
        </div>
    );
}
