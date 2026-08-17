import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    label?: string;
    size?: "sm" | "md" | "lg";
    variant?: "ghost" | "surface" | "primary";
}

export default forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
    { icon: Icon, label, size = "md", variant = "ghost", className = "", disabled, ...rest },
    ref,
) {
    const base =
        "inline-flex items-center justify-center rounded-full cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.92]";

    const sizes = {
        sm: "w-7 h-7 [&>svg]:w-3.5 [&>svg]:h-3.5",
        md: "w-9 h-9 [&>svg]:w-4.5 [&>svg]:h-4.5",
        lg: "w-10 h-10 [&>svg]:w-5 [&>svg]:h-5",
    };

    const variants = {
        ghost: "bg-transparent text-white hover:text-foreground hover:bg-surface-raised",
        surface: "bg-surface-raised text-muted hover:text-foreground border border-border",
        primary:
            "bg-primary text-white hover:bg-primary-hover shadow-[0_0_16px_var(--primary-dim)]",
    };

    return (
        <button
            ref={ref}
            type="button"
            aria-label={label}
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={disabled}
            {...rest}
        >
            <Icon />
        </button>
    );
});
