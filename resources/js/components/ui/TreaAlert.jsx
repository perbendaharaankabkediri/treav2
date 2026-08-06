import {
    AlertCircle,
    CheckCircle2,
    Info,
    TriangleAlert,
    X,
} from 'lucide-react';
import React, { forwardRef, useState } from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const toneMap = {
    neutral: {
        soft: 'border-slate-200 bg-slate-50 text-slate-700',
        outline: 'border-slate-200 bg-white text-slate-700',
        icon: 'text-slate-500',
        close: 'hover:bg-slate-200/70',
        defaultIcon: Info,
    },
    primary: {
        soft: 'border-indigo-100 bg-[var(--trea-primary-soft)] text-indigo-900',
        outline: 'border-indigo-200 bg-white text-indigo-900',
        icon: 'text-trea-primary',
        close: 'hover:bg-indigo-100',
        defaultIcon: Info,
    },
    success: {
        soft: 'border-emerald-100 bg-[var(--trea-success-soft)] text-emerald-900',
        outline: 'border-emerald-200 bg-white text-emerald-900',
        icon: 'text-trea-success',
        close: 'hover:bg-emerald-100',
        defaultIcon: CheckCircle2,
    },
    warning: {
        soft: 'border-amber-100 bg-[var(--trea-warning-soft)] text-amber-900',
        outline: 'border-amber-200 bg-white text-amber-900',
        icon: 'text-trea-warning',
        close: 'hover:bg-amber-100',
        defaultIcon: TriangleAlert,
    },
    danger: {
        soft: 'border-rose-100 bg-[var(--trea-danger-soft)] text-rose-900',
        outline: 'border-rose-200 bg-white text-rose-900',
        icon: 'text-trea-danger',
        close: 'hover:bg-rose-100',
        defaultIcon: AlertCircle,
    },
    info: {
        soft: 'border-sky-100 bg-[var(--trea-info-soft)] text-sky-900',
        outline: 'border-sky-200 bg-white text-sky-900',
        icon: 'text-trea-info',
        close: 'hover:bg-sky-100',
        defaultIcon: Info,
    },
};

const TreaAlert = forwardRef(function TreaAlert(
    {
        tone = 'info',
        variant = 'soft',
        title,
        icon: Icon,
        hideIcon = false,
        dismissible = false,
        onDismiss,
        actions,
        compact = false,
        className = '',
        children,
        ...props
    },
    ref,
) {
    const [visible, setVisible] = useState(true);
    const resolvedTone = toneMap[tone] || toneMap.info;
    const ResolvedIcon = Icon || resolvedTone.defaultIcon;

    if (!visible) return null;

    const dismiss = () => {
        setVisible(false);
        onDismiss?.();
    };

    return (
        <div
            ref={ref}
            role={tone === 'danger' ? 'alert' : 'status'}
            className={joinClasses(
                'flex items-start border text-xs',
                compact
                    ? 'gap-2 rounded-lg px-3 py-2.5'
                    : 'gap-3 rounded-xl px-4 py-3.5',
                resolvedTone[variant] || resolvedTone.soft,
                className,
            )}
            {...props}
        >
            {!hideIcon && (
                <ResolvedIcon
                    size={compact ? 14 : 16}
                    className={joinClasses(
                        'mt-0.5 shrink-0',
                        resolvedTone.icon,
                    )}
                    aria-hidden="true"
                />
            )}

            <div className="min-w-0 flex-1">
                {title && (
                    <p className="font-semibold leading-5">{title}</p>
                )}
                {children && (
                    <div
                        className={joinClasses(
                            'leading-5 opacity-85',
                            title ? 'mt-0.5' : '',
                        )}
                    >
                        {children}
                    </div>
                )}
                {actions && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {dismissible && (
                <button
                    type="button"
                    onClick={dismiss}
                    className={joinClasses(
                        '-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-60 transition hover:opacity-100',
                        resolvedTone.close,
                    )}
                    aria-label="Tutup pesan"
                >
                    <X size={13} />
                </button>
            )}
        </div>
    );
});

TreaAlert.displayName = 'TreaAlert';

export default TreaAlert;
