import { HTMLAttributes } from "react";

export default function Skeleton({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-md bg-surface-faded motion-reduce:animate-none ${className}`}
            {...rest}
        />
    );
}
