export function merge_scopes(
    existing: string | null | undefined,
    incoming: string | null | undefined,
): string | null {
    const merged = new Set(
        [...(existing ?? "").split(" "), ...(incoming ?? "").split(" ")].filter(Boolean),
    );
    return merged.size > 0 ? [...merged].join(" ") : null;
}
