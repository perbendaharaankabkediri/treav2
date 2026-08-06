import { Check } from 'lucide-react';
import { forwardRef } from 'react';

const TreaCheckbox = forwardRef(function TreaCheckbox(
    {
        checked = false,
        disabled = false,
        onCheckedChange,
        className = '',
        ...props
    },
    ref,
) {
    return (
        <button
            ref={ref}
            type="button"
            role="checkbox"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
            className={[
                'inline-flex size-4 shrink-0 items-center justify-center rounded border outline-none transition',
                'focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-1',
                'disabled:pointer-events-none disabled:opacity-50',
                checked
                    ? 'border-trea-primary bg-trea-primary text-white'
                    : 'border-slate-300 bg-white text-transparent hover:border-slate-400',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...props}
        >
            <Check size={11} strokeWidth={3} aria-hidden="true" />
        </button>
    );
});

TreaCheckbox.displayName = 'TreaCheckbox';

export default TreaCheckbox;
