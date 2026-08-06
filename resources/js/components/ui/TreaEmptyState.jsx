import { Inbox } from 'lucide-react';
import React, { forwardRef } from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const variantMap = {
    plain: '',
    surface:
        'rounded-2xl border border-trea-border bg-trea-card shadow-trea-card',
    dashed:
        'rounded-2xl border border-dashed border-slate-300 bg-trea-section',
};

const sizeMap = {
    sm: 'px-4 py-8',
    md: 'px-6 py-12',
    lg: 'px-8 py-16',
};

const iconSizeMap = {
    sm: 'h-10 w-10 rounded-xl',
    md: 'h-12 w-12 rounded-2xl',
    lg: 'h-14 w-14 rounded-2xl',
};

const TreaEmptyState = forwardRef(function TreaEmptyState(
    {
        as: Component = 'div',
        variant = 'plain',
        size = 'md',
        icon: Icon = Inbox,
        iconNode,
        title = 'Belum ada data',
        description,
        badge,
        action,
        actions,
        className = '',
        children,
        ...props
    },
    ref,
) {
    const resolvedActions = actions ?? action;

    return (
        <Component
            ref={ref}
            className={joinClasses(
                'flex w-full flex-col items-center justify-center text-center',
                variantMap[variant] || variantMap.plain,
                sizeMap[size] || sizeMap.md,
                className,
            )}
            {...props}
        >
            {(Icon || iconNode) && (
                <div
                    className={joinClasses(
                        'flex items-center justify-center bg-slate-100 text-slate-400',
                        iconSizeMap[size] || iconSizeMap.md,
                    )}
                    aria-hidden="true"
                >
                    {iconNode ||
                        (Icon && (
                            <Icon
                                size={
                                    size === 'lg'
                                        ? 24
                                        : size === 'sm'
                                          ? 18
                                          : 21
                                }
                            />
                        ))}
                </div>
            )}

            {badge && <div className="mt-3">{badge}</div>}

            {title && (
                <h3 className="mt-4 text-sm font-semibold text-trea-heading">
                    {title}
                </h3>
            )}

            {description && (
                <p className="mt-1 max-w-md text-xs leading-5 text-trea-muted">
                    {description}
                </p>
            )}

            {children}

            {resolvedActions && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    {resolvedActions}
                </div>
            )}
        </Component>
    );
});

TreaEmptyState.displayName = 'TreaEmptyState';

export default TreaEmptyState;
