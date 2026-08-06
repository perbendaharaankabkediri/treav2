import React, { forwardRef } from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const variantMap = {
    surface:
        'rounded-2xl border border-trea-border bg-trea-card px-5 py-4 shadow-trea-card',
    embedded: 'border-b border-slate-100 bg-white px-5 py-4',
    plain: '',
};

const TreaPageHeader = forwardRef(function TreaPageHeader(
    {
        as: Component = 'header',
        variant = 'surface',
        title,
        subtitle,
        description,
        eyebrow,
        icon: Icon,
        badge,
        meta,
        actions,
        compact = false,
        className = '',
        titleClassName = '',
        actionsClassName = '',
        children,
        ...props
    },
    ref,
) {
    return (
        <Component
            ref={ref}
            className={joinClasses(
                'flex min-w-0 flex-col gap-4',
                'lg:flex-row lg:items-center lg:justify-between',
                variantMap[variant] || variantMap.surface,
                className,
            )}
            {...props}
        >
            <div className="flex min-w-0 flex-1 items-start gap-3">
                {Icon && (
                    <div
                        className={joinClasses(
                            'flex shrink-0 items-center justify-center rounded-xl bg-[var(--trea-primary-soft)] text-trea-primary',
                            compact ? 'h-9 w-9' : 'h-10 w-10',
                        )}
                    >
                        <Icon
                            size={compact ? 17 : 18}
                            aria-hidden="true"
                        />
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    {(eyebrow || badge) && (
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            {eyebrow && (
                                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-trea-primary">
                                    {eyebrow}
                                </span>
                            )}
                            {badge}
                        </div>
                    )}

                    {title && (
                        <h1
                            className={joinClasses(
                                compact ? 'text-sm' : 'text-base',
                                'font-semibold tracking-tight text-trea-heading',
                                titleClassName,
                            )}
                        >
                            {title}
                        </h1>
                    )}

                    {(subtitle || description) && (
                        <p className="mt-1 max-w-3xl text-xs leading-5 text-trea-muted">
                            {subtitle || description}
                        </p>
                    )}

                    {meta && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-trea-muted">
                            {meta}
                        </div>
                    )}

                    {children}
                </div>
            </div>

            {actions && (
                <div
                    className={joinClasses(
                        'flex w-full shrink-0 flex-wrap items-center gap-2 lg:w-auto lg:justify-end',
                        actionsClassName,
                    )}
                >
                    {actions}
                </div>
            )}
        </Component>
    );
});

TreaPageHeader.displayName = 'TreaPageHeader';

export default TreaPageHeader;
