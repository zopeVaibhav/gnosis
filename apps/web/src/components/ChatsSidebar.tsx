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
import { useParams, useRouter } from 'next/navigation';
import AppLogoComponent from './AppLogo';
import IconButton from './shared/IconButton';
import LogoutModal from './LogoutModal';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import Image from 'next/image';
import { useUserSessionStore } from '../store/user/useUserSessionStore';
import { GET_CHATS } from '@/routes/api-routes';
import { useChatListStore } from '../store/chat/useChatListStore';
import { Chat } from '@gnosis/types';
import { useChatStore } from '../store/chat/useChatStore';

interface IsiderMenu {
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    onClick: () => void;
}

export default function ChatsSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const { chatList, setChatList } = useChatListStore();
    const { reset } = useChatStore();
    const [loadingChats, setLoadingChats] = useState(true);
    const { session } = useUserSessionStore();
    const router = useRouter();
    const { id: activeChatId } = useParams<{ id?: string }>();

    const sidebarMenu: IsiderMenu[] = [
        {
            icon: SquarePen,
            label: 'New Chat',
            shortcut: '⌘N',
            onClick: () => router.push('/chat'),
        },
        {
            icon: Search,
            label: 'Search Chats',
            onClick: () => console.log('SEARCH CHATS'),
        },
    ];

    useKeyboardShortcut('b', () => setSidebarOpen((v) => !v), { meta: true });
    useKeyboardShortcut('n', () => router.push('/'), { meta: true });

    useEffect(() => {
        axios
            .get<Chat[]>(GET_CHATS)
            .then((res) => setChatList([...(res.data ?? []), ...(res.data ?? [])]))
            .catch(() => {})
            .finally(() => setLoadingChats(false));
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
                        className={`group flex items-center justify-between cursor-pointer hover:bg-surface-faded transition-colors rounded-full ${sidebarOpen ? 'rounded-lg' : ''}`}
                        onClick={() => menu.onClick()}
                    >
                        <div className="flex items-center gap-1">
                            <IconButton icon={menu.icon} />
                            {sidebarOpen && (
                                <span className="text-sm whitespace-nowrap">{menu.label} </span>
                            )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 text-xs text-muted transition-opacity pr-2">
                            {sidebarOpen && menu.shortcut}
                        </div>
                    </div>
                ))}
            </div>

            {/* RECENT CHATS */}
            {sidebarOpen ? (
                <>
                    <div className="p-2 mt-5 text-xs font-light text-muted">Recents</div>
                    <div className="overflow-y-auto -mr-2 pr-2">
                        {loadingChats
                            ? Array.from({ length: 15 }).map((_, idx) => (
                                  <div key={idx} className="p-2">
                                      <div
                                          className="h-4 rounded bg-surface-faded animate-pulse"
                                          style={{ width: `${60 + ((idx * 13) % 35)}%` }}
                                      />
                                  </div>
                              ))
                            : chatList.map((chat, index) => (
                                  <div
                                      key={index}
                                      className={`p-2 text-sm truncate mb-0.5 cursor-pointer hover:bg-surface-faded rounded-lg ${chat.id === activeChatId ? 'bg-surface-faded' : ''}`}
                                      onClick={() => router.push(`/chat/${chat.id}`)}
                                  >
                                      {chat.title || 'New chat'}
                                  </div>
                              ))}
                    </div>
                </>
            ) : (
                <IconButton icon={MessageCircle} />
            )}

            <div className="mt-auto flex gap-2 items-center p-2 bg-surface-faded rounded-lg">
                <Image
                    src={session?.user?.image || '/logo-filled.png'}
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
