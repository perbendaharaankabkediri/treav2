import React, { forwardRef } from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const sizeMap = {
    full: 'max-w-none',
    wide: 'max-w-screen-2xl',
    medium: 'max-w-5xl',
    form: 'max-w-3xl',
};

const spacingMap = {
    none: '',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
};

const TreaPage = forwardRef(function TreaPage(
    {
        as: Component = 'div',
        size = 'wide',
        spacing = 'md',
        className = '',
        children,
        ...props
    },
    ref,
) {
    return (
        <Component
            ref={ref}
            className={joinClasses(
                'mx-auto min-w-0 w-full',
                sizeMap[size] || sizeMap.wide,
                spacingMap[spacing] || spacingMap.md,
                className,
            )}
            {...props}
        >
            {children}
        </Component>
    );
});

TreaPage.displayName = 'TreaPage';

export default TreaPage;
