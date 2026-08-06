import { Dialog } from 'primereact/dialog';
import { Loader2 } from 'lucide-react';
import React, { forwardRef } from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const sizeMap = {
    sm: 'trea-dialog-sm',
    md: 'trea-dialog-md',
    lg: 'trea-dialog-lg',
    xl: 'trea-dialog-xl',
    '2xl': 'trea-dialog-2xl',
    full: 'trea-dialog-full',
};

const toneMap = {
    primary:
        'bg-[var(--trea-primary-soft)] text-trea-primary',
    success:
        'bg-[var(--trea-success-soft)] text-trea-success',
    warning:
        'bg-[var(--trea-warning-soft)] text-trea-warning',
    danger:
        'bg-[var(--trea-danger-soft)] text-trea-danger',
    info: 'bg-[var(--trea-info-soft)] text-trea-info',
};

const TreaDialog = forwardRef(function TreaDialog(
    {
        open,
        visible,
        onClose,
        onHide,
        title,
        subtitle,
        icon: Icon,
        badge,
        footer,
        tone = 'primary',
        size = 'md',
        modal = true,
        closeable = true,
        dismissible = true,
        closeOnEscape = true,
        draggable = false,
        resizable = false,
        blockScroll = true,
        scrollable = false,
        loading = false,
        loadingLabel = 'Memuat...',
        className = '',
        headerClassName = '',
        contentClassName = '',
        children,
        ...props
    },
    ref,
) {
    const isVisible = visible ?? open ?? false;
    const canClose = closeable && !loading;

    const handleHide = () => {
        if (!canClose) return;
        onHide?.();
        onClose?.();
    };

    const header =
        title || subtitle || Icon || badge ? (
            <div
                className={joinClasses(
                    'flex min-w-0 items-start gap-3',
                    headerClassName,
                )}
            >
                {Icon && (
                    <div
                        className={joinClasses(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                            toneMap[tone] || toneMap.primary,
                        )}
                    >
                        <Icon size={17} aria-hidden="true" />
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        {title && (
                            <h2 className="text-sm font-semibold text-trea-heading">
                                {title}
                            </h2>
                        )}
                        {badge}
                    </div>
                    {subtitle && (
                        <p className="mt-1 text-xs leading-5 text-trea-muted">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        ) : null;

    return (
        <Dialog
            ref={ref}
            visible={isVisible}
            onHide={handleHide}
            header={header}
            footer={footer}
            modal={modal}
            closable={canClose}
            dismissableMask={dismissible && canClose}
            closeOnEscape={closeOnEscape && canClose}
            draggable={draggable}
            resizable={resizable}
            blockScroll={blockScroll}
            aria-busy={loading || undefined}
            className={joinClasses(
                'trea-dialog',
                sizeMap[size] || sizeMap.md,
                scrollable ? 'trea-dialog-scrollable' : '',
                className,
            )}
            contentClassName={joinClasses(
                'trea-dialog-content',
                contentClassName,
            )}
            breakpoints={{
                '960px': 'calc(100vw - 3rem)',
                '640px': 'calc(100vw - 2rem)',
            }}
            {...props}
        >
            <div className="relative">
                {children}

                {loading && (
                    <div
                        className="absolute inset-0 z-10 flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl bg-white/80 text-xs font-medium text-trea-muted backdrop-blur-[2px]"
                        role="status"
                        aria-live="polite"
                    >
                        <Loader2
                            size={20}
                            className="animate-spin text-trea-primary"
                            aria-hidden="true"
                        />
                        {loadingLabel}
                    </div>
                )}
            </div>
        </Dialog>
    );
});

TreaDialog.displayName = 'TreaDialog';

export default TreaDialog;
