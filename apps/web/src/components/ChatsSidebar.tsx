'use client';

import { motion } from 'framer-motion';
import {
    LucideIcon,
    SquarePen,
    Search,
    PanelLeftClose,
    PanelRightOpen,
    MessageCircle,
    LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import AppLogoComponent from './AppLogo';
import IconButton from './shared/IconButton';
import LogoutModal from './LogoutModal';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import Image from 'next/image';
import { useUserSessionStore } from '../store/user/useUserSessionStore';
import { GET_CHATS } from '@/routes/api-routes';

interface ChatItem {
    id: string;
    title: string | null;
}

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
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [chats, setChats] = useState<ChatItem[]>([]);
    const { session } = useUserSessionStore();
    const router = useRouter();

    useKeyboardShortcut('b', () => setSidebarOpen((v) => !v), { meta: true });

    useEffect(() => {
        axios
            .get(GET_CHATS)
            .then((res) => setChats(res.data ?? []))
            .catch(() => {});
    }, []);

    return (
        <motion.div
            className="border-r border-border h-full overflow-hidden p-2 py-3 flex flex-col"
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
                <div className="flex flex-col mt-5 min-h-0 flex-1 overflow-y-auto">
                    <div className="p-2 text-xs font-light text-muted">Recents</div>
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            className="p-2 text-sm truncate cursor-pointer hover:bg-surface-faded rounded-lg"
                            onClick={() => router.push(`/chat/${chat.id}`)}
                        >
                            {chat.title || 'New chat'}
                        </div>
                    ))}
                </div>
            ) : (
                <IconButton icon={MessageCircle} />
            )}

            <div className="mt-auto flex gap-2 items-center p-2 bg-surface-faded rounded-lg">
                <Image
                    src={session?.user?.image || '/logo-filled.svg'}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full shrink-0"
                />
                {sidebarOpen && (
                    <>
                        <span className="text-sm truncate min-w-0 flex-1">
                            {session?.user.name}
                        </span>
                        <IconButton
                            icon={LogOut}
                            label="Logout"
                            onClick={() => setLogoutOpen(true)}
                        />
                    </>
                )}
            </div>

            <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
        </motion.div>
    );
}
