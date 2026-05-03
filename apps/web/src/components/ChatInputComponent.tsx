'use client';
import { Plus, SendIcon, Upload, LucideIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import IconButton from './shared/IconButton';
import Popover from './shared/Popover';

interface addSource {
    label: string;
    icon?: LucideIcon;
    img?: string;
    shortcut?: string;
    onClick: () => void;
}
const addSourceOptions: addSource[] = [
    {
        label: 'Upload File',
        icon: Upload,
        shortcut: '⌘U',
        onClick: () => console.log('Upload File'),
    },
    {
        label: 'Google Drive',
        img: '/icons/gdrive.svg',
        onClick: () => console.log('Google Drive'),
    },
    {
        label: 'Gmail with Calendar',
        img: '/icons/gcalendar.svg',
        onClick: () => console.log('Gmail'),
    },
    {
        label: 'Github',
        img: '/icons/github.svg',
        onClick: () => console.log('Github'),
    },
];

export default function ChatInputComponent() {
    const ref = useRef<HTMLTextAreaElement>(null);
    const plusRef = useRef<HTMLButtonElement>(null);

    const [addSourcesPopover, setAddSourcesPopover] = useState(false);

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
                            {addSourceOptions.map((item, key) => (
                                <div
                                    key={key}
                                    className="group flex items-center gap-2 hover:bg-surface-faded p-2 rounded-lg cursor-pointer"
                                    onClick={item.onClick}
                                >
                                    {item.icon && <item.icon size={16} />}
                                    {item.img && (
                                        <img src={item.img} width={16} height={16} alt="" />
                                    )}
                                    <span className="flex-1">{item.label}</span>
                                    {item.shortcut && (
                                        <span className="opacity-0 group-hover:opacity-100 text-xs text-muted transition-opacity">
                                            {item.shortcut}
                                        </span>
                                    )}
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
