"use client";

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";
import RollingLabel from "./RollingLabel";

const ROW =
    "group/row flex h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-sm outline-none transition-colors hover:bg-surface-faded hover:text-foreground focus-visible:ring-1 focus-visible:ring-border focus-visible:ring-inset";

export default function SidebarRow({
    icon: Icon,
    label,
    href,
    onClick,
    active = false,
    collapsed = false,
    trailing,
    labelClassName,
    title,
}: {
    icon?: LucideIcon;
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    collapsed?: boolean;
    trailing?: ReactNode;
    labelClassName?: string;
    title?: string;
}) {
    const [hovered, setHovered] = useState(false);

    const hoverProps = {
        onPointerEnter: () => setHovered(true),
        onPointerLeave: () => setHovered(false),
        onFocus: () => setHovered(true),
        onBlur: () => setHovered(false),
    };

    const className = `${ROW} ${active ? "bg-surface-raised text-foreground" : "text-foreground/80"} ${collapsed ? "justify-center px-0" : ""}`;

    const content = (
        <>
            {Icon && (
                <span className="flex size-4 shrink-0 items-center justify-center">
                    <Icon className="size-4" aria-hidden />
                </span>
            )}
            {!collapsed && (
                <RollingLabel className={labelClassName} rolling={hovered} text={label} />
            )}
            {!collapsed && trailing}
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={className}
                onClick={onClick}
                title={title ?? label}
                aria-current={active ? "page" : undefined}
                {...hoverProps}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={className}
            onClick={onClick}
            title={title ?? label}
            {...hoverProps}
        >
            {content}
        </button>
    );
}
