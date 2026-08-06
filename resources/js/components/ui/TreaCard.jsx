import React, { forwardRef } from 'react';
import TreaSkeleton from './TreaSkeleton';

const joinClasses = (...classes) =>
    classes.filter(Boolean).join(' ');

const paddingMap = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    xl: 'p-6',
};

const radiusMap = {
    none: 'rounded-none',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
};

const shadowMap = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    trea: 'shadow-trea-card',
};

const toneMap = {
    default: {
        card: '',
        icon: 'bg-slate-100 text-slate-500',
        eyebrow: 'text-slate-400',
    },
    primary: {
        card: 'border-indigo-200 bg-indigo-50/30',
        icon: 'bg-indigo-100 text-indigo-600',
        eyebrow: 'text-indigo-500',
    },
    success: {
        card: 'border-emerald-200 bg-emerald-50/30',
        icon: 'bg-emerald-100 text-emerald-600',
        eyebrow: 'text-emerald-500',
    },
    warning: {
        card: 'border-amber-200 bg-amber-50/30',
        icon: 'bg-amber-100 text-amber-600',
        eyebrow: 'text-amber-500',
    },
    danger: {
        card: 'border-rose-200 bg-rose-50/30',
        icon: 'bg-rose-100 text-rose-600',
        eyebrow: 'text-rose-500',
    },
    info: {
        card: 'border-sky-200 bg-sky-50/30',
        icon: 'bg-sky-100 text-sky-600',
        eyebrow: 'text-sky-500',
    },
};

const variantMap = {
    default: {
        card: 'border border-trea-border bg-trea-card',
        bodyPadding: 'md',
        headerPadding: 'md',
        footerPadding: 'md',
        overflow: 'visible',
        shadow: 'trea',
    },
    toolbar: {
        card: 'border border-slate-200 bg-white',
        bodyPadding: 'sm',
        headerPadding: 'sm',
        footerPadding: 'sm',
        overflow: 'visible',
        shadow: 'none',
    },
    table: {
        card: 'border border-trea-border bg-trea-card',
        bodyPadding: 'none',
        headerPadding: 'md',
        footerPadding: 'md',
        overflow: 'hidden',
        shadow: 'trea',
    },
    form: {
        card: 'border border-trea-border bg-trea-card',
        bodyPadding: 'lg',
        headerPadding: 'md',
        footerPadding: 'md',
        overflow: 'hidden',
        shadow: 'trea',
    },
    subtle: {
        card: 'border border-slate-100 bg-slate-50/70',
        bodyPadding: 'md',
        headerPadding: 'md',
        footerPadding: 'md',
        overflow: 'visible',
        shadow: 'none',
    },
    transparent: {
        card: 'border border-transparent bg-transparent',
        bodyPadding: 'none',
        headerPadding: 'none',
        footerPadding: 'none',
        overflow: 'visible',
        shadow: 'none',
    },
};

const overflowMap = {
    visible: 'overflow-visible',
    hidden: 'overflow-hidden',
    auto: 'overflow-auto',
};

const alignMap = {
    start: 'justify-start',
    center: 'justify-center',
    between: 'justify-between',
    end: 'justify-end',
};

function resolvePadding(value, fallback = 'md') {
    return paddingMap[value] ?? paddingMap[fallback];
}

export const TreaCardHeader = forwardRef(function TreaCardHeader(
    {
        title,
        subtitle,
        description,
        eyebrow,
        meta,
        badge,
        icon: Icon,
        iconNode,
        actions,
        loading = false,
        divider = true,
        padding = 'md',
        compact = false,
        tone = 'default',
        className = '',
        titleClassName = '',
        subtitleClassName = '',
        descriptionClassName = '',
        metaClassName = '',
        iconClassName = '',
        actionsClassName = '',
        children,
        ...props
    },
    ref,
) {
    const resolvedTone = toneMap[tone] || toneMap.default;
    const resolvedPadding = compact ? 'sm' : padding;

    const hasContent =
        title ||
        subtitle ||
        description ||
        eyebrow ||
        meta ||
        badge ||
        Icon ||
        iconNode ||
        actions ||
        children;

    if (!hasContent) {
        return null;
    }

    return (
        <div
            ref={ref}
            className={joinClasses(
                'flex min-w-0 flex-col gap-3',
                'lg:flex-row lg:items-start lg:justify-between',
                resolvePadding(resolvedPadding),
                divider ? 'border-b border-slate-100' : '',
                className,
            )}
            {...props}
        >
            <div className="flex min-w-0 flex-1 items-start gap-3">
                {(Icon || iconNode) && (
                    <div
                        className={joinClasses(
                            'mt-0.5 flex shrink-0 items-center justify-center rounded-xl',
                            compact ? 'h-8 w-8' : 'h-9 w-9',
                            resolvedTone.icon,
                            iconClassName,
                        )}
                        aria-hidden="true"
                    >
                        {Icon ? (
                            <Icon
                                size={compact ? 15 : 17}
                                strokeWidth={1.9}
                            />
                        ) : (
                            iconNode
                        )}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    {(eyebrow || badge) && (
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            {eyebrow && (
                                <span
                                    className={joinClasses(
                                        'text-[11px] font-semibold uppercase tracking-[0.12em]',
                                        resolvedTone.eyebrow,
                                    )}
                                >
                                    {eyebrow}
                                </span>
                            )}

                            {badge}
                        </div>
                    )}

                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {title && (
                            <h2
                                className={joinClasses(
                                    compact ? 'text-xs' : 'text-sm',
                                    'min-w-0 font-semibold text-slate-800',
                                    titleClassName,
                                )}
                            >
                                {title}
                            </h2>
                        )}

                        {loading && <TreaSkeleton preset="text" width="3rem" />}
                    </div>

                    {subtitle && (
                        <p
                            className={joinClasses(
                                compact
                                    ? 'mt-0.5 text-[11px]'
                                    : 'mt-1 text-xs',
                                'leading-5 text-slate-500',
                                subtitleClassName,
                            )}
                        >
                            {subtitle}
                        </p>
                    )}

                    {description && (
                        <p
                            className={joinClasses(
                                'mt-1.5 text-xs leading-5 text-slate-400',
                                descriptionClassName,
                            )}
                        >
                            {description}
                        </p>
                    )}

                    {meta && (
                        <div
                            className={joinClasses(
                                'mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400',
                                metaClassName,
                            )}
                        >
                            {meta}
                        </div>
                    )}

                    {children}
                </div>
            </div>

            {actions && (
                <div
                    className={joinClasses(
                        'flex shrink-0 flex-wrap items-center gap-2',
                        'lg:justify-end',
                        actionsClassName,
                    )}
                >
                    {actions}
                </div>
            )}
        </div>
    );
});

TreaCardHeader.displayName = 'TreaCardHeader';

export const TreaCardContent = forwardRef(function TreaCardContent(
    {
        padding = 'md',
        compact = false,
        className = '',
        children,
        ...props
    },
    ref,
) {
    return (
        <div
            ref={ref}
            className={joinClasses(
                resolvePadding(compact ? 'sm' : padding),
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
});

TreaCardContent.displayName = 'TreaCardContent';

export const TreaCardFooter = forwardRef(function TreaCardFooter(
    {
        padding = 'md',
        compact = false,
        divider = true,
        align = 'end',
        className = '',
        children,
        ...props
    },
    ref,
) {
    return (
        <div
            ref={ref}
            className={joinClasses(
                'flex flex-wrap items-center gap-2',
                resolvePadding(compact ? 'sm' : padding),
                divider ? 'border-t border-slate-100' : '',
                alignMap[align] || alignMap.end,
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
});

TreaCardFooter.displayName = 'TreaCardFooter';

export const TreaCardToolbar = forwardRef(function TreaCardToolbar(
    {
        left,
        right,
        padding = 'sm',
        compact = false,
        className = '',
        leftClassName = '',
        rightClassName = '',
        children,
        ...props
    },
    ref,
) {
    return (
        <div
            ref={ref}
            className={joinClasses(
                'flex flex-col gap-3',
                'lg:flex-row lg:items-end lg:justify-between',
                resolvePadding(compact ? 'xs' : padding),
                className,
            )}
            {...props}
        >
            <div
                className={joinClasses(
                    'min-w-0 flex-1',
                    leftClassName,
                )}
            >
                {left ?? children}
            </div>

            {right && (
                <div
                    className={joinClasses(
                        'flex shrink-0 flex-wrap items-center gap-2',
                        'lg:justify-end',
                        rightClassName,
                    )}
                >
                    {right}
                </div>
            )}
        </div>
    );
});

TreaCardToolbar.displayName = 'TreaCardToolbar';

const TreaCard = forwardRef(function TreaCard(
    {
        as: Component = 'section',
        variant = 'default',
        tone = 'default',
        title,
        subtitle,
        description,
        eyebrow,
        meta,
        badge,
        icon,
        iconNode,
        actions,
        left,
        right,
        footer,
        children,
        padding,
        headerPadding,
        footerPadding,
        compact = false,
        headerDivider,
        footerDivider = true,
        footerAlign = 'end',
        radius = 'lg',
        shadow,
        overflow,
        hoverable = false,
        clickable = false,
        selected = false,
        loading = false,
        disabled = false,
        className = '',
        headerClassName = '',
        contentClassName = '',
        footerClassName = '',
        toolbarClassName = '',
        rightClassName = '',
        onClick,
        ...props
    },
    ref,
) {
    const resolvedVariant =
        variantMap[variant] || variantMap.default;

    const resolvedTone =
        toneMap[tone] || toneMap.default;

    const isToolbar = variant === 'toolbar';

    const hasHeader =
        title ||
        subtitle ||
        description ||
        eyebrow ||
        meta ||
        badge ||
        icon ||
        iconNode ||
        actions;

    const bodyPadding =
        padding ??
        (compact ? 'sm' : resolvedVariant.bodyPadding);

    const finalHeaderPadding =
        headerPadding ??
        (compact ? 'sm' : resolvedVariant.headerPadding);

    const finalFooterPadding =
        footerPadding ??
        (compact ? 'sm' : resolvedVariant.footerPadding);

    const finalShadow =
        shadow ?? resolvedVariant.shadow;

    const finalOverflow =
        overflow ?? resolvedVariant.overflow;

    const finalHeaderDivider =
        headerDivider ??
        (variant !== 'toolbar' &&
            variant !== 'transparent');

    const isInteractive =
        clickable || typeof onClick === 'function';

    const handleClick = (event) => {
        if (disabled || loading) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        onClick?.(event);
    };

    const componentProps = {
        ref,
        className: joinClasses(
            'relative w-full transition',
            resolvedVariant.card,
            resolvedTone.card,
            radiusMap[radius] || radiusMap.lg,
            shadowMap[finalShadow] || shadowMap.sm,
            overflowMap[finalOverflow] ||
                overflowMap.visible,
            hoverable && !disabled
                ? 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
                : '',
            isInteractive && !disabled
                ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:ring-offset-2'
                : '',
            selected
                ? 'border-indigo-300 ring-2 ring-indigo-100'
                : '',
            disabled
                ? 'cursor-not-allowed opacity-60'
                : '',
            className,
        ),
        onClick: handleClick,
        'aria-busy': loading || undefined,
        'aria-disabled': disabled || undefined,
        ...props,
    };

    if (
        isInteractive &&
        Component !== 'button' &&
        componentProps.tabIndex === undefined
    ) {
        componentProps.tabIndex = disabled ? -1 : 0;
        componentProps.role =
            componentProps.role || 'button';

        const originalKeyDown =
            componentProps.onKeyDown;

        componentProps.onKeyDown = (event) => {
            originalKeyDown?.(event);

            if (
                event.defaultPrevented ||
                disabled ||
                loading
            ) {
                return;
            }

            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                event.preventDefault();
                onClick?.(event);
            }
        };
    }

    if (Component === 'button') {
        componentProps.type =
            componentProps.type || 'button';
        componentProps.disabled =
            disabled || loading;
    }

    return (
        <Component {...componentProps}>
            {isToolbar ? (
                <>
                    {hasHeader && (
                        <TreaCardHeader
                            title={title}
                            subtitle={subtitle}
                            description={description}
                            eyebrow={eyebrow}
                            meta={meta}
                            badge={badge}
                            icon={icon}
                            iconNode={iconNode}
                            actions={actions}
                            loading={loading}
                            divider
                            padding={finalHeaderPadding}
                            compact={compact}
                            tone={tone}
                            className={headerClassName}
                        />
                    )}

                    <TreaCardToolbar
                        left={left}
                        right={right}
                        padding={bodyPadding}
                        compact={compact}
                        className={toolbarClassName}
                        rightClassName={rightClassName}
                    >
                        {children}
                    </TreaCardToolbar>
                </>
            ) : (
                <>
                    {hasHeader && (
                        <TreaCardHeader
                            title={title}
                            subtitle={subtitle}
                            description={description}
                            eyebrow={eyebrow}
                            meta={meta}
                            badge={badge}
                            icon={icon}
                            iconNode={iconNode}
                            actions={actions}
                            loading={loading}
                            divider={finalHeaderDivider}
                            padding={finalHeaderPadding}
                            compact={compact}
                            tone={tone}
                            className={headerClassName}
                        />
                    )}

                    {loading && (
                        <TreaCardContent
                            padding={bodyPadding}
                            compact={false}
                            className={contentClassName}
                        >
                            <TreaSkeleton lines={3} lastLineWidth="58%" />
                        </TreaCardContent>
                    )}

                    {!loading && children !== undefined &&
                        children !== null && (
                            <TreaCardContent
                                padding={bodyPadding}
                                compact={false}
                                className={contentClassName}
                            >
                                {children}
                            </TreaCardContent>
                        )}

                    {footer !== undefined &&
                        footer !== null && (
                            <TreaCardFooter
                                padding={finalFooterPadding}
                                compact={false}
                                divider={footerDivider}
                                align={footerAlign}
                                className={footerClassName}
                            >
                                {footer}
                            </TreaCardFooter>
                        )}
                </>
            )}

            {loading && !hasHeader && !isToolbar && (
                <div className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-white/90 p-4">
                    <TreaSkeleton lines={3} lastLineWidth="58%" />
                </div>
            )}
        </Component>
    );
});

TreaCard.displayName = 'TreaCard';

TreaCard.Header = TreaCardHeader;
TreaCard.Content = TreaCardContent;
TreaCard.Footer = TreaCardFooter;
TreaCard.Toolbar = TreaCardToolbar;

export default TreaCard;
