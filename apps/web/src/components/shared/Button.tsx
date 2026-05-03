import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
    loading?: boolean;
}

export default function Button({
    label,
    variant = 'primary',
    className = '',
    loading = false,
    disabled,
    ...rest
}: ButtonProps) {
    const base =
        'px-4 py-1.5 text-sm relative inline-flex item-center justify-center font-medium rounded-full cursor-pointer transition-all duration-150 select-none disabled:opacity-40 disabled: cursor-not-allowed';

    const variants = {
        primary:
            'bg-primary text-white hover:bg-primary-hover active:scale-[0.97] shadow-[0_0_16px_var(--primary-dim)]',
        secondary:
            'bg-surface-raised text-foreground border border-[var(--border-strong)] hover:border-[var(--primary)] hover:text-white active:scale-[0.97]',
        ghost: 'bg-transparent text-muted hover:text-foreground active:scale-[0.97]',
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${className}`}
            disabled={disabled || loading}
            {...rest}
        >
            {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </span>
            )}
            <span className={loading ? 'opacity-0' : undefined}>{label}</span>
        </button>
    );
}
