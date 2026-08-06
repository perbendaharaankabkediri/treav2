import React, {
    forwardRef,
    useId,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { Loader2, X } from 'lucide-react';

/**
 * Mengubah teks nominal dari berbagai sumber menjadi number.
 *
 * Contoh yang didukung:
 * - Rp10.000.000.000,00
 * - Rp 10.000.000.000,00
 * - 10.000.000.000,00
 * - 10,000,000,000.00
 * - 10000000000
 * - (1.250.000,50) -> -1250000.5
 *
 * @param {unknown} value
 * @returns {number | null}
 */
export function parseTreaMoney(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    let raw = String(value)
        .replace(/\u00A0/g, ' ')
        .trim();

    if (!raw) {
        return null;
    }

    const isParenthesesNegative =
        raw.startsWith('(') && raw.endsWith(')');

    raw = raw.replace(/[^0-9.,-]/g, '');

    if (!raw || !/[0-9]/.test(raw)) {
        return null;
    }

    const hasMinus = raw.includes('-') || isParenthesesNegative;
    raw = raw.replace(/-/g, '');

    const lastComma = raw.lastIndexOf(',');
    const lastDot = raw.lastIndexOf('.');

    let normalized = raw;

    if (lastComma !== -1 && lastDot !== -1) {
        const decimalSeparator = lastComma > lastDot ? ',' : '.';
        const groupingSeparator =
            decimalSeparator === ',' ? '.' : ',';

        normalized = normalized
            .replace(
                new RegExp(`\\${groupingSeparator}`, 'g'),
                '',
            )
            .replace(decimalSeparator, '.');
    } else if (lastComma !== -1) {
        const commaCount =
            (normalized.match(/,/g) || []).length;
        const decimalLength =
            normalized.length - lastComma - 1;

        if (commaCount > 1) {
            if (
                decimalLength > 0 &&
                decimalLength <= 2
            ) {
                const integerPart = normalized
                    .slice(0, lastComma)
                    .replace(/,/g, '');

                const decimalPart =
                    normalized.slice(lastComma + 1);

                normalized = `${integerPart}.${decimalPart}`;
            } else {
                normalized = normalized.replace(/,/g, '');
            }
        } else if (decimalLength === 3) {
            normalized = normalized.replace(',', '');
        } else {
            normalized = normalized.replace(',', '.');
        }
    } else if (lastDot !== -1) {
        const dotCount =
            (normalized.match(/\./g) || []).length;
        const decimalLength =
            normalized.length - lastDot - 1;

        if (dotCount > 1) {
            if (
                decimalLength > 0 &&
                decimalLength <= 2
            ) {
                const integerPart = normalized
                    .slice(0, lastDot)
                    .replace(/\./g, '');

                const decimalPart =
                    normalized.slice(lastDot + 1);

                normalized = `${integerPart}.${decimalPart}`;
            } else {
                normalized = normalized.replace(/\./g, '');
            }
        } else if (decimalLength === 3) {
            normalized = normalized.replace('.', '');
        }
    }

    const firstDecimalPoint = normalized.indexOf('.');

    if (firstDecimalPoint !== -1) {
        normalized =
            normalized.slice(0, firstDecimalPoint + 1) +
            normalized
                .slice(firstDecimalPoint + 1)
                .replace(/\./g, '');
    }

    const parsed = Number.parseFloat(normalized);

    if (!Number.isFinite(parsed)) {
        return null;
    }

    return hasMinus
        ? -Math.abs(parsed)
        : parsed;
}

/**
 * Formatter nominal untuk teks non-input seperti subtotal atau notifikasi.
 *
 * @param {unknown} value
 * @param {object} options
 * @returns {string}
 */
export function formatTreaMoney(
    value,
    {
        locale = 'id-ID',
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
    } = {},
) {
    const parsed = parseTreaMoney(value) ?? 0;

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(parsed);
}

const SIZE_CLASSES = {
    sm: 'h-9 px-2.5 text-xs',
    md: 'h-10 px-3 text-xs',
    lg: 'h-11 px-3.5 text-sm',
};

const FLOATING_LABEL_SIZE_CLASSES = {
    sm: 'text-[11px]',
    md: 'text-[11px]',
    lg: 'text-[11px]',
};

const TreaMoneyInput = forwardRef(
    function TreaMoneyInput(
        {
            id,
            name,
            label,
            value = null,
            onChange,
            onBlur,
            onFocus,
            onPaste,
            placeholder = '0,00',
            helperText,
            error,
            required = false,
            disabled = false,
            readOnly = false,
            loading = false,
            clearable = false,
            floatLabel = false,
            selectOnFocus = true,
            allowNegative = true,
            clampOnPaste = true,
            locale = 'id-ID',
            minFractionDigits = 2,
            maxFractionDigits = 2,
            useGrouping = true,
            min,
            max,
            step = 1,
            prefix,
            suffix,
            mode = 'decimal',
            currency,
            currencyDisplay,
            showButtons = false,
            buttonLayout = 'stacked',
            incrementButtonIcon,
            decrementButtonIcon,
            size = 'md',
            autoFocus = false,
            tabIndex,
            ariaLabel,
            ariaDescribedBy,
            className = '',
            inputClassName = '',
            labelClassName = '',
            helperClassName = '',
            errorClassName = '',
            ...rest
        },
        forwardedRef,
    ) {
        const generatedId = useId();
        const inputId =
            id || name || `trea-money-${generatedId}`;

        const internalRef = useRef(null);
        const [isFocused, setIsFocused] =
            useState(false);

        const normalizedValue = useMemo(() => {
            const parsed = parseTreaMoney(value);

            if (parsed === null) {
                return null;
            }

            if (!allowNegative && parsed < 0) {
                return Math.abs(parsed);
            }

            return parsed;
        }, [allowNegative, value]);

        const hasValue = normalizedValue !== null;
        const hasError = Boolean(error);

        const shouldFloat =
            floatLabel &&
            Boolean(label) &&
            (isFocused || hasValue);

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

        const getNativeInput = () => {
            const instance = internalRef.current;

            if (!instance) {
                return null;
            }

            if (
                typeof instance.getInput === 'function'
            ) {
                return instance.getInput();
            }

            return (
                instance.input ||
                instance.element?.querySelector?.(
                    'input',
                ) ||
                null
            );
        };

        useImperativeHandle(
            forwardedRef,
            () => ({
                focus() {
                    getNativeInput()?.focus();
                },
                blur() {
                    getNativeInput()?.blur();
                },
                select() {
                    getNativeInput()?.select();
                },
                getInput() {
                    return getNativeInput();
                },
                getValue() {
                    return normalizedValue;
                },
            }),
            [normalizedValue],
        );

        const emitChange = (nextValue, event) => {
            if (typeof onChange === 'function') {
                onChange(nextValue, event);
            }
        };

        const normalizeByConstraint = (nextValue) => {
            if (nextValue === null) {
                return null;
            }

            let result = nextValue;

            if (!allowNegative && result < 0) {
                result = Math.abs(result);
            }

            if (clampOnPaste) {
                if (
                    typeof min === 'number' &&
                    result < min
                ) {
                    result = min;
                }

                if (
                    typeof max === 'number' &&
                    result > max
                ) {
                    result = max;
                }
            }

            return result;
        };

        const handleValueChange = (event) => {
            const nextValue =
                event.value === null ||
                event.value === undefined
                    ? null
                    : normalizeByConstraint(
                          event.value,
                      );

            emitChange(nextValue, event);
        };

        const handleFocus = (event) => {
            setIsFocused(true);

            if (
                selectOnFocus &&
                !readOnly &&
                !disabled
            ) {
                const target = event.target;

                window.setTimeout(() => {
                    target?.select?.();
                }, 0);
            }

            if (typeof onFocus === 'function') {
                onFocus(event);
            }
        };

        const handleBlur = (event) => {
            setIsFocused(false);

            if (typeof onBlur === 'function') {
                onBlur(event);
            }
        };

        const handlePasteCapture = (event) => {
            if (disabled || readOnly || loading) {
                return;
            }

            const clipboardText =
                event.clipboardData?.getData(
                    'text/plain',
                ) ??
                window.clipboardData?.getData(
                    'Text',
                ) ??
                '';

            const parsed =
                parseTreaMoney(clipboardText);

            if (parsed === null) {
                if (typeof onPaste === 'function') {
                    onPaste(event, null);
                }

                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const nextValue =
                normalizeByConstraint(parsed);

            emitChange(nextValue, {
                originalEvent: event,
                value: nextValue,
                pastedText: clipboardText,
                type: 'paste',
            });

            if (typeof onPaste === 'function') {
                onPaste(event, nextValue);
            }

            window.setTimeout(() => {
                getNativeInput()?.select?.();
            }, 0);
        };

        const handleClear = () => {
            if (disabled || readOnly || loading) {
                return;
            }

            emitChange(null, {
                originalEvent: null,
                value: null,
                type: 'clear',
            });

            window.setTimeout(() => {
                getNativeInput()?.focus?.();
            }, 0);
        };

        const showTrailingAction =
            loading ||
            (clearable &&
                normalizedValue !== null &&
                !disabled &&
                !readOnly);

        const resolvedInputClassName = [
            'w-full rounded-lg border bg-white text-right font-semibold tabular-nums text-slate-700 outline-none transition',
            'placeholder:font-sans placeholder:font-normal placeholder:text-slate-300',
            'focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
            readOnly
                ? 'cursor-default bg-slate-50'
                : '',
            hasError
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200',
            SIZE_CLASSES[size] || SIZE_CLASSES.md,
            showTrailingAction ? 'pr-9' : '',
            inputClassName,
        ]
            .filter(Boolean)
            .join(' ');

        const describedBy =
            ariaDescribedBy ||
            [
                helperText
                    ? `${inputId}-helper`
                    : null,
                hasError
                    ? `${inputId}-error`
                    : null,
            ]
                .filter(Boolean)
                .join(' ') ||
            undefined;

        return (
            <div
                className={[
                    'w-full',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {!floatLabel && label && (
                    <label
                        htmlFor={inputId}
                        className={[
                            'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400',
                            disabled
                                ? 'opacity-60'
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

                <div
                    className="relative w-full"
                    onPasteCapture={handlePasteCapture}
                >
                    <InputNumber
                        ref={internalRef}
                        inputId={inputId}
                        name={name}
                        value={normalizedValue}
                        onValueChange={handleValueChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={resolvedPlaceholder}
                        disabled={disabled || loading}
                        readOnly={readOnly}
                        required={required}
                        locale={locale}
                        mode={mode}
                        currency={currency}
                        currencyDisplay={currencyDisplay}
                        prefix={prefix}
                        suffix={suffix}
                        minFractionDigits={minFractionDigits}
                        maxFractionDigits={maxFractionDigits}
                        useGrouping={useGrouping}
                        min={
                            allowNegative
                                ? min
                                : typeof min === 'number'
                                  ? Math.max(0, min)
                                  : 0
                        }
                        max={max}
                        step={step}
                        showButtons={showButtons}
                        buttonLayout={buttonLayout}
                        incrementButtonIcon={incrementButtonIcon}
                        decrementButtonIcon={decrementButtonIcon}
                        autoFocus={autoFocus}
                        tabIndex={tabIndex}
                        aria-label={
                            ariaLabel ||
                            label ||
                            name ||
                            'Input nominal'
                        }
                        aria-describedby={describedBy}
                        aria-invalid={hasError}
                        className="w-full"
                        inputClassName={resolvedInputClassName}
                        {...rest}
                    />

                    {floatLabel && label && (
                        <label
                            htmlFor={inputId}
                            className={[
                                'pointer-events-none absolute z-20 whitespace-nowrap transition-all duration-200 ease-out',
                                shouldFloat
                                    ? [
                                          '-top-2 left-2.5 px-1 font-semibold normal-case leading-4',
                                          FLOATING_LABEL_SIZE_CLASSES[
                                              size
                                          ] ||
                                              FLOATING_LABEL_SIZE_CLASSES.md,
                                          floatingLabelBackground,
                                          hasError
                                              ? 'text-red-500'
                                              : isFocused
                                                ? 'text-indigo-600'
                                                : 'text-slate-500',
                                      ].join(' ')
                                    : 'left-3 top-1/2 -translate-y-1/2 text-xs font-medium normal-case text-slate-400',
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

                    {loading && (
                        <span
                            className="pointer-events-none absolute right-3 top-1/2 z-20 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                        >
                            <Loader2
                                size={14}
                                className="animate-spin"
                            />
                        </span>
                    )}

                    {!loading &&
                        clearable &&
                        normalizedValue !== null &&
                        !disabled &&
                        !readOnly && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute right-2.5 top-1/2 z-20 inline-flex -translate-y-1/2 items-center justify-center rounded text-slate-300 transition hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                aria-label={`Hapus ${
                                    label ||
                                    ariaLabel ||
                                    'nilai'
                                }`}
                                tabIndex={-1}
                            >
                                <X size={14} />
                            </button>
                        )}
                </div>

                {hasError ? (
                    <p
                        id={`${inputId}-error`}
                        className={[
                            'mt-1.5 text-xs text-red-500',
                            errorClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        role="alert"
                    >
                        {error}
                    </p>
                ) : helperText ? (
                    <p
                        id={`${inputId}-helper`}
                        className={[
                            'mt-1.5 text-xs text-slate-400',
                            helperClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {helperText}
                    </p>
                ) : null}
            </div>
        );
    },
);

TreaMoneyInput.displayName = 'TreaMoneyInput';

export default TreaMoneyInput;
