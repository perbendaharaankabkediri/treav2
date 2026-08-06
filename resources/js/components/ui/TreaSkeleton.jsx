import { Skeleton } from 'primereact/skeleton';
import React, { forwardRef } from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const presetMap = {
    text: { width: '100%', height: '0.75rem', borderRadius: '6px' },
    title: { width: '55%', height: '1rem', borderRadius: '7px' },
    avatar: { width: '2.5rem', height: '2.5rem', shape: 'circle' },
    icon: { width: '2.25rem', height: '2.25rem', borderRadius: '10px' },
    button: { width: '6.5rem', height: '2.5rem', borderRadius: '8px' },
    stat: { width: '5rem', height: '1.75rem', borderRadius: '8px' },
    block: { width: '100%', height: '7rem', borderRadius: '14px' },
};

const TreaSkeleton = forwardRef(function TreaSkeleton(
    {
        preset = 'text',
        width,
        height,
        shape,
        borderRadius,
        animation = 'wave',
        lines = 1,
        lastLineWidth = '72%',
        gap = '0.5rem',
        className = '',
        ...props
    },
    ref,
) {
    const resolved = presetMap[preset] || presetMap.text;
    const skeletonProps = {
        width: width ?? resolved.width,
        height: height ?? resolved.height,
        shape: shape ?? resolved.shape,
        borderRadius: borderRadius ?? resolved.borderRadius,
        animation,
        ...props,
    };

    if (lines <= 1) {
        return (
            <Skeleton
                ref={ref}
                className={joinClasses('trea-skeleton', className)}
                {...skeletonProps}
            />
        );
    }

    return (
        <div
            ref={ref}
            className={joinClasses(
                'flex w-full flex-col',
                className,
            )}
            style={{ gap }}
            aria-hidden="true"
        >
            {Array.from({ length: lines }, (_, index) => (
                <Skeleton
                    key={index}
                    className="trea-skeleton"
                    {...skeletonProps}
                    width={
                        index === lines - 1
                            ? lastLineWidth
                            : skeletonProps.width
                    }
                />
            ))}
        </div>
    );
});

TreaSkeleton.displayName = 'TreaSkeleton';

export function TreaSkeletonCard({ className = '' }) {
    return (
        <div
            className={joinClasses(
                'rounded-2xl border border-trea-border bg-trea-card p-5 shadow-trea-card',
                className,
            )}
            aria-hidden="true"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <TreaSkeleton preset="title" />
                    <TreaSkeleton
                        preset="text"
                        width="85%"
                        className="mt-3"
                    />
                </div>
                <TreaSkeleton preset="icon" />
            </div>
            <TreaSkeleton preset="stat" className="mt-5" />
        </div>
    );
}

export function TreaSkeletonCardGrid({
    cards = 4,
    columns = 'sm:grid-cols-2 xl:grid-cols-4',
    className = '',
}) {
    return (
        <div
            className={joinClasses('grid gap-4', columns, className)}
            aria-label="Memuat ringkasan"
            role="status"
        >
            {Array.from({ length: cards }, (_, index) => (
                <TreaSkeletonCard key={index} />
            ))}
            <span className="sr-only">Memuat ringkasan halaman...</span>
        </div>
    );
}

export function TreaSkeletonTable({
    rows = 5,
    columns = 4,
    announce = true,
    className = '',
}) {
    return (
        <div
            className={joinClasses(
                'overflow-hidden rounded-2xl border border-trea-border bg-trea-card',
                className,
            )}
            role={announce ? 'status' : undefined}
            aria-live={announce ? 'polite' : undefined}
            aria-busy={announce ? 'true' : undefined}
            aria-label={announce ? 'Memuat data tabel' : undefined}
            aria-hidden={announce ? undefined : true}
        >
            <div
                className="grid gap-4 border-b border-trea-border bg-trea-section px-4 py-3"
                style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: columns }, (_, index) => (
                    <TreaSkeleton
                        key={index}
                        preset="text"
                        width={index === 0 ? '45%' : '65%'}
                    />
                ))}
            </div>

            {Array.from({ length: rows }, (_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="grid gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
                    style={{
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from({ length: columns }, (_, columnIndex) => (
                        <TreaSkeleton
                            key={columnIndex}
                            preset="text"
                            width={
                                columnIndex === 0
                                    ? '35%'
                                    : `${65 + ((rowIndex + columnIndex) % 3) * 10}%`
                            }
                        />
                    ))}
                </div>
            ))}
            {announce && <span className="sr-only">Memuat data tabel...</span>}
        </div>
    );
}

export function TreaSkeletonPage({
    variant = 'dashboard',
    className = '',
}) {
    const isDashboard = variant === 'dashboard';

    return (
        <div
            className={joinClasses('space-y-5', className)}
            aria-busy="true"
            aria-live="polite"
            role="status"
        >
            <div className="flex flex-col gap-4 rounded-2xl border border-trea-border bg-trea-card p-5 shadow-trea-card lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                    <TreaSkeleton preset="title" width="11rem" height="1.25rem" />
                    <TreaSkeleton preset="text" width="min(100%, 32rem)" className="mt-3" />
                    <TreaSkeleton preset="text" width="14rem" className="mt-2" />
                </div>
                <TreaSkeleton preset="button" width="9rem" />
            </div>

            {isDashboard && <TreaSkeletonCardGrid />}

            <div className={joinClasses('grid gap-4', isDashboard && 'lg:grid-cols-[1.35fr_1fr]')}>
                <TreaSkeletonTable rows={6} columns={isDashboard ? 4 : 5} announce={false} />
                {isDashboard && (
                    <div className="rounded-2xl border border-trea-border bg-trea-card p-5 shadow-trea-card">
                        <TreaSkeleton preset="title" />
                        <TreaSkeleton preset="text" width="80%" className="mt-3" />
                        <TreaSkeleton preset="block" height="13rem" className="mt-5" />
                    </div>
                )}
            </div>

            <span className="sr-only">Memuat halaman...</span>
        </div>
    );
}

export default TreaSkeleton;
