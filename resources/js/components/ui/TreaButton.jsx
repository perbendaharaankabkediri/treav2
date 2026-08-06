import { Loader2 } from 'lucide-react';
import React, { forwardRef } from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const variantMap = {
    primary:
        'border-transparent bg-trea-primary text-white shadow-sm hover:bg-trea-primary-hover focus-visible:ring-indigo-200',
    secondary:
        'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 focus-visible:ring-slate-200',
    success:
        'border-transparent bg-trea-success text-white shadow-sm hover:bg-trea-success-hover focus-visible:ring-emerald-200',
    warning:
        'border-transparent bg-trea-warning text-white shadow-sm hover:bg-trea-warning-hover focus-visible:ring-amber-200',
    danger:
        'border-transparent bg-trea-danger text-white shadow-sm hover:bg-trea-danger-hover focus-visible:ring-rose-200',
    ghost:
        'border-transparent bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-slate-200',
};

const sizeMap = {
    xs: 'h-7 gap-1 rounded-md px-2 text-[11px]',
    sm: 'h-9 gap-1.5 rounded-lg px-3.5 text-xs',
    md: 'h-10 gap-2 rounded-lg px-4 text-xs',
    lg: 'h-11 gap-2 rounded-xl px-5 text-sm',
};

const iconSizeMap = {
    xs: 'h-7 w-7 rounded-md',
    sm: 'h-9 w-9 rounded-lg',
    md: 'h-10 w-10 rounded-lg',
    lg: 'h-11 w-11 rounded-xl',
};

const spinnerSizeMap = {
    xs: 11,
    sm: 13,
    md: 14,
    lg: 16,
};

const TreaButton = forwardRef(function TreaButton(
    {
        as: Component = 'button',
        variant = 'primary',
        size = 'md',
        icon: Icon,
        iconPosition = 'start',
        iconOnly = false,
        loading = false,
        loadingLabel,
        disabled = false,
        fullWidth = false,
        className = '',
        children,
        onClick,
        ...props
    },
    ref,
) {
    const isDisabled = disabled || loading;
    const isNativeButton = Component === 'button';
    const iconSize = spinnerSizeMap[size] || spinnerSizeMap.md;

    const handleClick = (event) => {
        if (isDisabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        onClick?.(event);
    };

    const componentProps = {
        ref,
        className: joinClasses(
            'inline-flex shrink-0 items-center justify-center border font-semibold outline-none transition',
            'focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            variantMap[variant] || variantMap.primary,
            iconOnly
                ? iconSizeMap[size] || iconSizeMap.md
                : sizeMap[size] || sizeMap.md,
            fullWidth ? 'w-full' : '',
            isDisabled
                ? 'pointer-events-none cursor-not-allowed opacity-50'
                : '',
            className,
        ),
        onClick: handleClick,
        'aria-busy': loading || undefined,
        'aria-disabled': !isNativeButton && isDisabled ? true : undefined,
        ...props,
    };

    if (isNativeButton) {
        componentProps.type = componentProps.type || 'button';
        componentProps.disabled = isDisabled;
    } else if (isDisabled) {
        componentProps.tabIndex = -1;
    }

    const renderedIcon = loading ? (
        <Loader2
            size={iconSize}
            className="shrink-0 animate-spin"
            aria-hidden="true"
        />
    ) : Icon ? (
        <Icon size={iconSize} className="shrink-0" aria-hidden="true" />
    ) : null;

    return (
        <Component {...componentProps}>
            {iconPosition === 'start' && renderedIcon}
            {!iconOnly && (loading && loadingLabel ? loadingLabel : children)}
            {iconPosition === 'end' && renderedIcon}
        </Component>
    );
});

TreaButton.displayName = 'TreaButton';

export default TreaButton;
