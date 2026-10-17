import { createCodePlugin } from "@streamdown/code";
import { File, FileText, Presentation, Table } from "lucide-react";
import type { ComponentProps } from "react";

/**
 * Shared markdown rendering for assistant replies.
 *
 * Links open in a new tab with `noreferrer` because the content comes from a model.
 */

const DRIVE_KINDS = [
    { match: "/document/", icon: FileText, label: "Doc" },
    { match: "/spreadsheets/", icon: Table, label: "Sheet" },
    { match: "/presentation/", icon: Presentation, label: "Slides" },
] as const;

/**
 * A document from a connected source, drawn as a chip rather than underlined text, so "this is the
 * file it came from" reads differently from "more about this". Matched on exact hosts only: a chip
 * claims the link is a real file in a connected system, and a suffix test would dress up
 * `docs.google.com.evil.test` as one.
 */
export function documentChipKind(href: string | undefined) {
    if (!href) return null;

    let url: URL;
    try {
        url = new URL(href);
    } catch {
        return null;
    }

    if (url.protocol !== "https:") return null;
    if (url.hostname === "docs.google.com") {
        const kind = DRIVE_KINDS.find((entry) => url.pathname.includes(entry.match));
        return kind ?? { match: "", icon: File, label: "Drive" };
    }
    if (url.hostname === "drive.google.com") {
        return { match: "", icon: File, label: "Drive" };
    }
    if (url.hostname === "mail.google.com") {
        return { match: "", icon: FileText, label: "Gmail" };
    }
    return null;
}

export const markdownComponents = {
    a: ({ href, children, ...rest }: ComponentProps<"a">) => {
        const kind = documentChipKind(href);

        if (kind) {
            const Icon = kind.icon;
            return (
                <a
                    {...rest}
                    // align-middle and a tight line height keep a chip from making its line taller than the rest
                    className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-surface-faded px-1.5 py-0.5 align-middle text-xs leading-tight no-underline transition-colors hover:bg-surface-raised"
                    href={href}
                    rel="noreferrer noopener"
                    target="_blank"
                >
                    <Icon className="size-3.5 shrink-0 text-muted" />
                    <span className="truncate">{children}</span>
                    <span className="shrink-0 text-muted">{kind.label}</span>
                </a>
            );
        }

        return (
            <a
                {...rest}
                className="underline underline-offset-2 hover:no-underline"
                href={href}
                rel="noreferrer noopener"
                target="_blank"
            >
                {children}
            </a>
        );
    },
};

/**
 * Syntax highlighting for fenced code blocks. Shiki loads as a plugin, so grammars only arrive once
 * a reply actually contains code. The app is always dark, so both slots get the dark theme rather
 * than following the OS setting.
 */
export const markdownPlugins = {
    code: createCodePlugin({
        themes: ["material-theme-darker", "material-theme-darker"],
    }),
};
