'use client';

import AppLogoComponent from '@/src/components/AppLogo';
import ChatInputComponent from '@/src/components/ChatInputComponent';
import IconButton from '@/src/components/shared/IconButton';
import { useKeyboardShortcut } from '@/src/hooks/useKeyboardShortcut';
import { motion } from 'framer-motion';
import {
    LucideIcon,
    MessageCircle,
    PanelLeftClose,
    PanelRightOpen,
    Search,
    SquarePen,
} from 'lucide-react';
import { useState } from 'react';

interface IsiderMenu {
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    onClick: () => void;
}

const sidebarMenu: IsiderMenu[] = [
    {
        icon: SquarePen,
        label: 'New Chat',
        shortcut: '⌘N',
        onClick: () => console.log('NEW CHAT'),
    },
    {
        icon: Search,
        label: 'Search Chats',
        onClick: () => console.log('SEARCH CHATS'),
    },
];

export default function NewPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useKeyboardShortcut('b', () => setSidebarOpen((v) => !v), { meta: true });
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
                        <div className="pl-2">
                            <AppLogoComponent textOnly={true} />
                        </div>
                    </motion.div>
                    <IconButton
                        size="md"
                        className="shrink-0"
                        icon={sidebarOpen ? PanelLeftClose : PanelRightOpen}
                        onClick={() => setSidebarOpen((v) => !v)}
                    />
                </div>

                {/* MENU SECTION */}
                <div className="flex flex-col mt-4">
                    {sidebarMenu.map((menu, idx) => (
                        <div
                            key={idx}
                            className="group flex items-center justify-between cursor-pointer hover:bg-surface-faded transition-colors rounded-lg"
                            onClick={() => menu.onClick()}
                        >
                            <div className="flex items-center gap-1">
                                <IconButton icon={menu.icon} />
                                {sidebarOpen && (
                                    <span className="text-sm whitespace-nowrap">{menu.label} </span>
                                )}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 text-xs text-muted transition-opacity pr-2">
                                {menu.shortcut}
                            </div>
                        </div>
                    ))}
                </div>

                {/* RECENT CHATS */}
                <div className="">
                    {sidebarOpen ? (
                        <span className="p-2 text-sm font-semibold">Recents</span>
                    ) : (
                        <IconButton icon={MessageCircle} />
                    )}
                </div>
            </motion.div>
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
