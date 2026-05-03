import { LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    label: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'ghost' | 'surface' | 'primary';
}

export default function IconButton({
    icon: Icon,
    label,
    size = 'md',
    variant = 'ghost',
    className = '',
    disabled,
    ...rest
}: IconButtonProps) {
    const base =
        'inline-flex items-center justify-center rounded-full cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.92]';

    const sizes = {
        sm: 'w-7 h-7 [&>svg]:w-3.5 [&>svg]:h-3.5',
        md: 'w-8 h-8 [&>svg]:w-4 [&>svg]:h-4',
        lg: 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5',
    };

    const variants = {
        ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-surface-raised',
        surface: 'bg-surface-raised text-muted hover:text-foreground border border-border',
        primary:
            'bg-primary text-white hover:bg-primary-hover shadow-[0_0_16px_var(--primary-dim)]',
    };

    return (
        <button
            aria-label={label}
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={disabled}
            {...rest}
        >
            <Icon />
        </button>
    );
}
