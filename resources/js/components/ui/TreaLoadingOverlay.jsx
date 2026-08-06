import { Loader2 } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

export default function TreaLoadingOverlay({ open = false, title = 'Memproses...', description, compact = false, className = '' }) {
    const titleId = useId();
    const descriptionId = useId();
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;
        const appRoot = document.getElementById('app');
        const previousAriaHidden = appRoot?.getAttribute('aria-hidden');
        const previouslyFocused = document.activeElement;

        document.body.style.overflow = 'hidden';
        overlayRef.current?.focus();
        if (appRoot) {
            appRoot.inert = true;
            appRoot.setAttribute('aria-hidden', 'true');
        }

        return () => {
            document.body.style.overflow = previousOverflow;
            if (appRoot) {
                appRoot.inert = false;
                if (previousAriaHidden === null) appRoot.removeAttribute('aria-hidden');
                else appRoot.setAttribute('aria-hidden', previousAriaHidden);
            }
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div
            ref={overlayRef}
            className={joinClasses(
                'fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]',
                className,
            )}
            role="alertdialog"
            aria-modal="true"
            aria-busy="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
        >
            <div
                className={joinClasses(
                    'rounded-2xl border border-slate-200 bg-white text-center shadow-2xl',
                    compact ? 'inline-flex max-w-sm items-center gap-3 px-4 py-3' : 'w-full max-w-sm px-8 py-7',
                )}
            >
                <Loader2 className="shrink-0 animate-spin text-trea-primary" size={compact ? 16 : 34} aria-hidden="true" />
                <div className={compact ? 'text-left' : ''}>
                    <p id={titleId} className="text-sm font-semibold text-trea-heading">{title}</p>
                    {description && <p id={descriptionId} className={joinClasses('text-xs leading-5 text-trea-muted', compact ? 'mt-0.5' : 'mt-1')}>{description}</p>}
                </div>
            </div>
        </div>,
        document.body,
    );
}
