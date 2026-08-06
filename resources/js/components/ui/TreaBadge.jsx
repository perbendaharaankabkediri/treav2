import React, { forwardRef } from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const toneMap = {
    neutral: {
        soft: 'border-transparent bg-slate-100 text-slate-600',
        outline: 'border-slate-200 bg-white text-slate-600',
        solid: 'border-slate-700 bg-slate-700 text-white',
        dot: 'bg-slate-400',
    },
    primary: {
        soft: 'border-transparent bg-[var(--trea-primary-soft)] text-trea-primary',
        outline:
            'border-indigo-200 bg-white text-trea-primary',
        solid: 'border-trea-primary bg-trea-primary text-white',
        dot: 'bg-trea-primary',
    },
    success: {
        soft: 'border-transparent bg-[var(--trea-success-soft)] text-trea-success',
        outline:
            'border-emerald-200 bg-white text-trea-success',
        solid: 'border-trea-success bg-trea-success text-white',
        dot: 'bg-trea-success',
    },
    warning: {
        soft: 'border-transparent bg-[var(--trea-warning-soft)] text-trea-warning',
        outline:
            'border-amber-200 bg-white text-trea-warning',
        solid: 'border-trea-warning bg-trea-warning text-white',
        dot: 'bg-trea-warning',
    },
    danger: {
        soft: 'border-transparent bg-[var(--trea-danger-soft)] text-trea-danger',
        outline:
            'border-rose-200 bg-white text-trea-danger',
        solid: 'border-trea-danger bg-trea-danger text-white',
        dot: 'bg-trea-danger',
    },
    info: {
        soft: 'border-transparent bg-[var(--trea-info-soft)] text-trea-info',
        outline: 'border-sky-200 bg-white text-trea-info',
        solid: 'border-trea-info bg-trea-info text-white',
        dot: 'bg-trea-info',
    },
    violet: {
        soft: 'border-transparent bg-violet-50 text-violet-700',
        outline: 'border-violet-200 bg-white text-violet-700',
        solid: 'border-violet-600 bg-violet-600 text-white',
        dot: 'bg-violet-500',
    },
};

const sizeMap = {
    xs: 'min-h-5 gap-1 px-2 py-0.5 text-[11px]',
    sm: 'min-h-6 gap-1.5 px-2.5 py-0.5 text-[11px]',
    md: 'min-h-7 gap-1.5 px-3 py-1 text-xs',
};

const iconSizeMap = {
    xs: 10,
    sm: 11,
    md: 13,
};

const TreaBadge = forwardRef(function TreaBadge(
    {
        as: Component = 'span',
        tone = 'neutral',
        variant = 'soft',
        size = 'sm',
        icon: Icon,
        dot = false,
        uppercase = false,
        className = '',
        children,
        ...props
    },
    ref,
) {
    const resolvedTone = toneMap[tone] || toneMap.neutral;
    const iconSize = iconSizeMap[size] || iconSizeMap.sm;

    return (
        <Component
            ref={ref}
            className={joinClasses(
                'inline-flex w-fit shrink-0 items-center justify-center rounded-full border font-semibold leading-none',
                resolvedTone[variant] || resolvedTone.soft,
                sizeMap[size] || sizeMap.sm,
                uppercase
                    ? 'uppercase tracking-[0.08em]'
                    : '',
                className,
            )}
            {...props}
        >
            {dot && (
                <span
                    className={joinClasses(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        resolvedTone.dot,
                    )}
                    aria-hidden="true"
                />
            )}

            {Icon && (
                <Icon
                    size={iconSize}
                    className="shrink-0"
                    aria-hidden="true"
                />
            )}

            {children}
        </Component>
    );
});

TreaBadge.displayName = 'TreaBadge';

export default TreaBadge;
