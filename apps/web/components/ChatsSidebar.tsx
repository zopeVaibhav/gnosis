"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SquarePen, Search, PanelLeftClose, PanelRightOpen, LogOut } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Chat } from "@gnosis/types";
import AppLogo from "./AppLogo";
import IconButton from "./shared/IconButton";
import Skeleton from "./shared/Skeleton";
import LogoutModal from "./LogoutModal";
import SidebarRow from "./sidebar/SidebarRow";
import SidebarSection from "./sidebar/SidebarSection";
import ResizeHandle, { clampWidth, SIDEBAR_DEFAULT_WIDTH } from "./sidebar/ResizeHandle";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useChats } from "@/hooks/chat/useChats";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";
import { useTypedReveal } from "@/lib/typed-reveal";
import { EASE_OUT, ENTRANCE_SECONDS } from "@/lib/motion";

const COLLAPSED_WIDTH = 52;
// past this many rows, animating reorders costs more than it shows
const MAX_ANIMATED_ROWS = 60;

// shaped like the rows that are coming, on the same 28px pitch so nothing jumps when they land
const SKELETON_WIDTHS = ["w-3/4", "w-2/3", "w-5/6", "w-1/2", "w-3/4", "w-2/3", "w-4/5", "w-1/2"];

const ChatRow = memo(function ChatRow({
    chat,
    active,
    animateOrder,
}: {
    chat: Chat;
    active: boolean;
    animateOrder: boolean;
}) {
    const shouldReduceMotion = useReducedMotion();
    // types in only when the title first arrives mid-stream
    const title = useTypedReveal(chat.title);

    return (
        <motion.div
            initial={{
                opacity: 0,
                transform: shouldReduceMotion ? "none" : "translateY(-8px)",
            }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0 }}
            layout={animateOrder && !shouldReduceMotion ? "position" : false}
            transition={{ duration: ENTRANCE_SECONDS, ease: EASE_OUT }}
        >
            <SidebarRow href={`/chat/${chat.id}`} label={title || "New chat"} active={active} />
        </motion.div>
    );
});

function ChatsSkeleton() {
    return (
        <div aria-label="Loading chats" role="status" className="flex flex-col gap-px">
            {SKELETON_WIDTHS.map((width, idx) => (
                <div key={idx} aria-hidden className="flex h-7 items-center px-2">
                    <Skeleton className={`h-3 ${width}`} />
                </div>
            ))}
        </div>
    );
}

export default function ChatsSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [recentsOpen, setRecentsOpen] = useState(true);
    const [width, setWidthState] = useState(SIDEBAR_DEFAULT_WIDTH);
    const [dragging, setDragging] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const { data: session, status } = useSession();
    const accessToken = useUserSessionStore((s) => s.accessToken);
    const { data: chatList = [], isLoading } = useChats();
    // the store gets its token one effect after the session, so keep the skeleton until then
    const loadingChats = isLoading || (status !== "unauthenticated" && !accessToken);
    const router = useRouter();
    const { id: activeChatId } = useParams<{ id?: string }>();

    const setWidth = useCallback((next: number) => setWidthState(clampWidth(next)), []);
    const collapse = useCallback(() => setSidebarOpen(false), []);

    useKeyboardShortcut("b", () => setSidebarOpen((v) => !v), { meta: true });
    useKeyboardShortcut("n", () => router.push("/chat"), { meta: true });

    const animateOrder = chatList.length <= MAX_ANIMATED_ROWS;

    return (
        <motion.div
            className="relative border-r border-border h-full shrink-0 overflow-hidden flex flex-col"
            initial={false}
            animate={{ width: sidebarOpen ? width : COLLAPSED_WIDTH }}
            transition={dragging ? { duration: 0 } : { duration: 0.25, ease: EASE_OUT }}
        >
            <div className="flex h-12 shrink-0 items-center justify-between gap-1 px-2">
                {sidebarOpen && (
                    <div className="min-w-0 truncate pl-2">
                        <AppLogo textOnly={true} />
                    </div>
                )}
                <IconButton
                    size="sm"
                    className={`shrink-0 ${sidebarOpen ? "" : "mx-auto"}`}
                    icon={sidebarOpen ? PanelLeftClose : PanelRightOpen}
                    label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    onClick={() => setSidebarOpen((v) => !v)}
                />
            </div>

            <nav className="flex min-h-0 flex-1 flex-col gap-4 px-2 pb-2">
                <div className="flex shrink-0 flex-col gap-px">
                    <SidebarRow
                        icon={SquarePen}
                        label="New chat"
                        collapsed={!sidebarOpen}
                        onClick={() => router.push("/chat")}
                        trailing={
                            <span className="text-xs text-muted opacity-0 transition-opacity group-hover/row:opacity-100">
                                ⌘N
                            </span>
                        }
                    />
                    <SidebarRow
                        icon={Search}
                        label="Search chats"
                        collapsed={!sidebarOpen}
                        onClick={() => console.log("SEARCH CHATS")}
                    />
                </div>

                {sidebarOpen && (
                    <SidebarSection
                        label="Recents"
                        open={recentsOpen}
                        onToggle={() => setRecentsOpen((v) => !v)}
                    >
                        {loadingChats ? (
                            <ChatsSkeleton />
                        ) : chatList.length === 0 ? (
                            <p className="px-2 py-1 text-sm text-muted">No chats yet</p>
                        ) : (
                            <AnimatePresence initial={false}>
                                {chatList.map((chat) => (
                                    <ChatRow
                                        key={chat.id}
                                        chat={chat}
                                        active={chat.id === activeChatId}
                                        animateOrder={animateOrder}
                                    />
                                ))}
                            </AnimatePresence>
                        )}
                    </SidebarSection>
                )}
            </nav>

            <div className="shrink-0 px-2 pt-1 pb-2">
                <div
                    className={`flex h-9 w-full items-center gap-2 rounded-md px-2 text-sm ${sidebarOpen ? "" : "justify-center px-0"}`}
                >
                    <Image
                        src={session?.user?.image || "/logo-filled.png"}
                        alt="Profile"
                        width={24}
                        height={24}
                        className="size-6 rounded-full shrink-0"
                    />
                    {sidebarOpen && (
                        <>
                            <span className="min-w-0 flex-1 truncate text-foreground/80">
                                {session?.user?.name || session?.user?.email}
                            </span>
                            <IconButton
                                size="sm"
                                icon={LogOut}
                                label="Log out"
                                onClick={() => setLogoutOpen(true)}
                            />
                        </>
                    )}
                </div>
            </div>

            {sidebarOpen && (
                <ResizeHandle
                    width={width}
                    dragging={dragging}
                    setWidth={setWidth}
                    setDragging={setDragging}
                    onCollapse={collapse}
                />
            )}

            <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
        </motion.div>
    );
}
