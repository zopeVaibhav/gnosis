'use client';

import { motion } from 'framer-motion';
import {
    LucideIcon,
    SquarePen,
    Search,
    PanelLeftClose,
    PanelRightOpen,
    MessageCircle,
} from 'lucide-react';
import { useState } from 'react';
import AppLogoComponent from './AppLogo';
import IconButton from './shared/IconButton';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

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
export default function ChatsSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    useKeyboardShortcut('b', () => setSidebarOpen((v) => !v), { meta: true });

    return (
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
            {sidebarOpen ? (
                <div className="p-2 text-xs font-light mt-5">Recents</div>
            ) : (
                <IconButton icon={MessageCircle} />
            )}
        </motion.div>
    );
}
