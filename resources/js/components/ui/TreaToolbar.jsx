import React, { forwardRef } from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const variantMap = {
    surface:
        'rounded-2xl border border-trea-border bg-trea-card px-4 py-3 shadow-trea-card',
    embedded:
        'border-b border-slate-100 bg-trea-section px-5 py-3',
    plain: '',
};

const TreaToolbar = forwardRef(function TreaToolbar(
    {
        as,
        variant = 'surface',
        search,
        filters,
        actions,
        result,
        left,
        right,
        children,
        onSubmit,
        compact = false,
        className = '',
        leftClassName = '',
        rightClassName = '',
        ...props
    },
    ref,
) {
    const Component = as || (onSubmit ? 'form' : 'div');
    const leftContent = left ?? (
        <>
            {search}
            {filters}
            {children}
        </>
    );
    const rightContent = right ?? actions;

    return (
        <Component
            ref={ref}
            onSubmit={onSubmit}
            className={joinClasses(
                'flex min-w-0 flex-col gap-3',
                'lg:flex-row lg:items-end lg:justify-between',
                compact ? 'text-[11px]' : 'text-xs',
                variantMap[variant] || variantMap.surface,
                className,
            )}
            {...props}
        >
            <div
                className={joinClasses(
                    'flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end',
                    leftClassName,
                )}
            >
                {leftContent}
                {result && (
                    <div className="self-center text-[11px] text-trea-muted">
                        {result}
                    </div>
                )}
            </div>

            {rightContent && (
                <div
                    className={joinClasses(
                        'flex w-full shrink-0 flex-wrap items-center gap-2 lg:w-auto lg:justify-end',
                        rightClassName,
                    )}
                >
                    {rightContent}
                </div>
            )}
        </Component>
    );
});

TreaToolbar.displayName = 'TreaToolbar';

export default TreaToolbar;
