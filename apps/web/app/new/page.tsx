'use client';

import AppLogoComponent from '@/src/components/AppLogo';
import ChatInputComponent from '@/src/components/ChatInputComponent';
import IconButton from '@/src/components/shared/IconButton';
import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';

export default function NewPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="h-screen w-screen flex">
            <motion.div
                className="border-r border-border h-full overflow-hidden p-2 py-3"
                initial={false}
                animate={{
                    width: sidebarOpen ? 280 : 55,
                }}
                transition={{ ease: 'easeOut' }}
            >
                <div className="flex items-center h-8">
                    <motion.div
                        className="flex-1 min-w-0 overflow-hidden whitespace-nowrap"
                        animate={{ opacity: sidebarOpen ? 1 : 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="pl-1">
                            <AppLogoComponent />
                        </div>
                    </motion.div>
                    <IconButton
                        size="md"
                        className="shrink-0"
                        icon={sidebarOpen ? PanelLeftOpen : PanelLeftClose}
                        onClick={() => setSidebarOpen((v) => !v)}
                    />
                </div>
            </motion.div>
            <div className="flex flex-col w-full h-full items-center justify-center">
                <div>
                    <div className="text-3xl w-full text-center mb-8">
                        <p>What&apos;s on your mind today?</p>
                    </div>
                    <ChatInputComponent />
                </div>
            </div>
        </div>
    );
}
