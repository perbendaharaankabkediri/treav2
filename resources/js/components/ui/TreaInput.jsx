import {
    Eye,
    EyeOff,
    Loader2,
    X,
} from 'lucide-react';
import {
    forwardRef,
    useId,
    useState,
} from 'react';

/**
 * TreaInput
 *
 * Input umum untuk text, search, email, password, tel, url, dan angka sederhana.
 * Untuk nominal uang/rupiah, gunakan komponen terpisah: TreaMoneyInput.
 *
 * Mode label:
 * - Default: label berada di atas input.
 * - floatLabel: label berada di dalam input saat kosong, lalu naik ketika
 *   input fokus atau sudah memiliki nilai.
 */
const TreaInput = forwardRef(function TreaInput(
    {
        id,
        name,
        label,
        value = '',
        onChange,
        onBlur,
        onFocus,
        type = 'text',
        placeholder = '',
        icon: Icon,
        prefix,
        suffix,
        helperText,
        error,
        required = false,
        disabled = false,
        readOnly = false,
        loading = false,
        clearable = false,
        floatLabel = false,
        size = 'md',
        className = '',
        inputClassName = '',
        labelClassName = '',
        autoComplete,
        maxLength,
        minLength,
        min,
        max,
        step,
        inputMode,
        pattern,
        autoFocus = false,
        spellCheck,
        ariaLabel,
        ...rest
    },
    ref,
) {
    const generatedId = useId();
    const inputId = id || name || generatedId;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const resolvedType =
        isPassword && showPassword ? 'text' : type;

    const hasValue =
        value !== null &&
        value !== undefined &&
        String(value).length > 0;

    const canClear =
        clearable &&
        hasValue &&
        !disabled &&
        !readOnly &&
        !loading;

    const shouldFloat =
        floatLabel &&
        Boolean(label) &&
        (isFocused || hasValue);

    const sizeClasses = {
        sm: {
            input: 'h-9 text-xs',
            icon: 14,
            horizontal: 'px-3',
            floatingText: 'text-[11px]',
        },
        md: {
            input: 'h-10 text-sm',
            icon: 15,
            horizontal: 'px-3',
            floatingText: 'text-[11px]',
        },
        lg: {
            input: 'h-11 text-sm',
            icon: 16,
            horizontal: 'px-3.5',
            floatingText: 'text-[11px]',
        },
    };

    const resolvedSize =
        sizeClasses[size] || sizeClasses.md;

    const hasLeftAdornment = Boolean(Icon || prefix);
    const hasRightAdornment = Boolean(
        suffix ||
        loading ||
        canClear ||
        isPassword,
    );

    const handleChange = (event) => {
        onChange?.(event.target.value, event);
    };

    const handleFocus = (event) => {
        setIsFocused(true);
        onFocus?.(event);
    };

    const handleBlur = (event) => {
        setIsFocused(false);
        onBlur?.(event);
    };

    const handleClear = () => {
        onChange?.('', null);
    };

    const resolvedPlaceholder =
        floatLabel && label && !shouldFloat
            ? ''
            : placeholder;

    const floatingLabelBackground =
        disabled || loading
            ? 'bg-slate-100'
            : readOnly
              ? 'bg-slate-50'
              : 'bg-white';

    return (
        <div className={`w-full ${className}`}>
            {!floatLabel && label && (
                <label
                    htmlFor={inputId}
                    className={[
                        'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600',
                        labelClassName,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {label}

                    {required && (
                        <span
                            className="ml-1 text-red-500"
                            aria-hidden="true"
                        >
                            *
                        </span>
                    )}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <span
                        className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400"
                        aria-hidden="true"
                    >
                        <Icon size={resolvedSize.icon} />
                    </span>
                )}

                {!Icon && prefix && (
                    <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-xs font-medium text-slate-400">
                        {prefix}
                    </span>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    name={name}
                    type={resolvedType}
                    value={value ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    placeholder={resolvedPlaceholder}
                    required={required}
                    disabled={disabled || loading}
                    readOnly={readOnly}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    minLength={minLength}
                    min={min}
                    max={max}
                    step={step}
                    inputMode={inputMode}
                    pattern={pattern}
                    autoFocus={autoFocus}
                    spellCheck={spellCheck}
                    aria-label={ariaLabel || label}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                        errorId || helperId || undefined
                    }
                    className={[
                        'peer w-full rounded-lg border bg-white outline-none transition',
                        'placeholder:text-slate-300',
                        'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
                        'read-only:cursor-default read-only:bg-slate-50',
                        resolvedSize.input,
                        resolvedSize.horizontal,
                        hasLeftAdornment ? 'pl-9' : '',
                        hasRightAdornment ? 'pr-10' : '',
                        error
                            ? 'border-red-400 text-slate-700 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
                        inputClassName,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    {...rest}
                />

                {floatLabel && label && (
                    <label
                        htmlFor={inputId}
                        className={[
                            'pointer-events-none absolute z-20 whitespace-nowrap transition-all duration-200 ease-out',
                            shouldFloat
                                ? [
                                      '-top-2 left-2.5 px-1 font-semibold leading-4',
                                      resolvedSize.floatingText,
                                      floatingLabelBackground,
                                      error
                                          ? 'text-red-500'
                                          : isFocused
                                            ? 'text-indigo-600'
                                            : 'text-slate-500',
                                  ].join(' ')
                                : [
                                      'top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400',
                                      hasLeftAdornment
                                          ? 'left-9'
                                          : 'left-3',
                                  ].join(' '),
                            disabled || loading
                                ? 'opacity-70'
                                : '',
                            labelClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {label}

                        {required && (
                            <span
                                className="ml-1 text-red-500"
                                aria-hidden="true"
                            >
                                *
                            </span>
                        )}
                    </label>
                )}

                <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-2">
                    {loading && (
                        <Loader2
                            size={resolvedSize.icon}
                            className="animate-spin text-indigo-500"
                            aria-label="Memuat"
                        />
                    )}

                    {!loading && canClear && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            aria-label={`Bersihkan ${label || 'input'}`}
                            tabIndex={-1}
                        >
                            <X size={13} />
                        </button>
                    )}

                    {!loading &&
                        !canClear &&
                        isPassword && (
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (current) => !current,
                                    )
                                }
                                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                aria-label={
                                    showPassword
                                        ? 'Sembunyikan kata sandi'
                                        : 'Tampilkan kata sandi'
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={14} />
                                ) : (
                                    <Eye size={14} />
                                )}
                            </button>
                        )}

                    {!loading &&
                        !canClear &&
                        !isPassword &&
                        suffix && (
                            <span className="pointer-events-none text-xs font-medium text-slate-400">
                                {suffix}
                            </span>
                        )}
                </div>
            </div>

            {helperText && !error && (
                <p
                    id={helperId}
                    className="mt-1.5 text-[11px] leading-4 text-slate-400"
                >
                    {helperText}
                </p>
            )}

            {error && (
                <p
                    id={errorId}
                    className="mt-1.5 text-xs leading-4 text-red-500"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
});

TreaInput.displayName = 'TreaInput';

export default TreaInput;
