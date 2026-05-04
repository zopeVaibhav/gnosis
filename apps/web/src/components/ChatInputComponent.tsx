'use client';
import { Plus, SendIcon, Upload, LucideIcon } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import IconButton from './shared/IconButton';
import Popover from './shared/Popover';
import { signIn } from 'next-auth/react';
import { GoogleAuth } from '@gnosis/types';
import { useUserSessionStore } from '../store/user/useUserSessionStore';
import Image from 'next/image';

interface AddSource {
    label: string;
    key?: string;
    connected?: boolean;
    icon?: LucideIcon;
    img?: string;
    shortcut?: string;
    onClick: () => void;
}

const addSourceOptions: AddSource[] = [
    {
        label: 'Upload File',
        icon: Upload,
        shortcut: '⌘U',
        onClick: () => console.log('Upload File'),
    },
    {
        label: 'Gmail',
        key: 'gmail',
        connected: false,
        img: '/icons/gmail.svg',
        onClick: () => signIn('google', { callbackUrl: '/' }, GoogleAuth.gmail),
    },
    {
        label: 'Google Drive',
        key: 'drive',
        connected: false,
        img: '/icons/gdrive.svg',
        onClick: () => signIn('google', { callbackUrl: '/' }, GoogleAuth.drive),
    },
    {
        label: 'Google Calendar',
        key: 'calendar',
        connected: false,
        img: '/icons/gcalendar.svg',
        onClick: () => signIn('google', { callbackUrl: '/' }, GoogleAuth.calendar),
    },
    {
        label: 'Github',
        key: 'github',
        connected: false,
        img: '/icons/github.svg',
        onClick: () => signIn('github', { callbackUrl: '/' }),
    },
];

export default function ChatInputComponent() {
    const ref = useRef<HTMLTextAreaElement>(null);
    const plusRef = useRef<HTMLButtonElement>(null);

    const [addSourcesPopover, setAddSourcesPopover] = useState(false);
    const { integrations } = useUserSessionStore();

    const sources = useMemo(
        () =>
            addSourceOptions.map((source) =>
                integrations?.find((value) => value.service === source.key)
                    ? { ...source, connected: true }
                    : source,
            ),
        [integrations],
    );

    useKeyboardShortcut('u', () => addSourceOptions[0]?.onClick(), { meta: true });

    const handleInput = () => {
        const el = ref.current;
        if (!el) return;
        const lineHeight = parseInt(getComputedStyle(el).lineHeight);
        const maxHeight = lineHeight * 6;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
        el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    return (
        <div className="flex items-center justify-center flex-1">
            <div className="border border-border p-4 pb-2 rounded-xl w-2xl shadow-sm shadow-primary">
                <textarea
                    ref={ref}
                    rows={1}
                    onInput={handleInput}
                    className="border-none outline-none appearance-none p-0 m-0 mb-4 w-full bg-transparent resize-none overflow-y-hidden"
                    placeholder=" Ask anything..."
                />
                <div className="flex items-center justify-between">
                    <div className="relative">
                        <IconButton
                            icon={Plus}
                            label="Plus"
                            id="add-sources"
                            ref={plusRef}
                            onClick={() => setAddSourcesPopover((v) => !v)}
                        />
                        <Popover
                            anchorRef={plusRef}
                            open={addSourcesPopover}
                            onClose={() => setAddSourcesPopover(false)}
                            className="text-sm p-2"
                        >
                            {sources.map((item, key) => (
                                <div
                                    key={key}
                                    className="group flex items-center gap-2 hover:bg-surface-faded p-2 rounded-lg cursor-pointer"
                                    onClick={item.onClick}
                                >
                                    {item.icon && <item.icon size={16} />}
                                    {item.img && (
                                        <Image src={item.img} width={16} height={16} alt="" />
                                    )}
                                    <span className="flex-1">{item.label}</span>
                                    {item.shortcut && (
                                        <span className="opacity-0 group-hover:opacity-100 text-xs text-muted transition-opacity">
                                            {item.shortcut}
                                        </span>
                                    )}
                                    {item.key &&
                                        (item.connected ? (
                                            <span className="bg-green-500 h-2 w-2 rounded-full animate-pulse"></span>
                                        ) : (
                                            <span className="bg-red-500 h-2 w-2 rounded-full animate-pulse"></span>
                                        ))}
                                </div>
                            ))}
                        </Popover>
                    </div>
                    <IconButton icon={SendIcon} label="Send Icon" />
                </div>
            </div>
        </div>
    );
}
