import { addLocale } from 'primereact/api';
import { Calendar } from 'primereact/calendar';
import { Loader2, X, CalendarDays } from 'lucide-react';
import {
    forwardRef,
    useId,
    useMemo,
    useState,
} from 'react';

addLocale('id', {
    firstDayOfWeek: 1,
    dayNames: [
        'Minggu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
    ],
    dayNamesShort: [
        'Min',
        'Sen',
        'Sel',
        'Rab',
        'Kam',
        'Jum',
        'Sab',
    ],
    dayNamesMin: [
        'Mg',
        'Sn',
        'Sl',
        'Rb',
        'Km',
        'Jm',
        'Sb',
    ],
    monthNames: [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ],
    monthNamesShort: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'Mei',
        'Jun',
        'Jul',
        'Agu',
        'Sep',
        'Okt',
        'Nov',
        'Des',
    ],
    today: 'Hari ini',
    clear: 'Bersihkan',
});

function parseDate(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime())
            ? null
            : value;
    }

    if (typeof value !== 'string') {
        return null;
    }

    const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})$/,
    );

    if (!match) {
        return null;
    }

    const [, year, month, day] = match;

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
    );

    return Number.isNaN(date.getTime())
        ? null
        : date;
}

function formatDate(value) {
    if (
        !(value instanceof Date) ||
        Number.isNaN(value.getTime())
    ) {
        return '';
    }

    const year = value.getFullYear();
    const month = String(
        value.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
        value.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const SIZE_CLASSES = {
    sm: {
        input: 'h-9 text-xs',
        icon: 14,
    },
    md: {
        input: 'h-10 text-sm',
        icon: 15,
    },
    lg: {
        input: 'h-11 text-sm',
        icon: 16,
    },
};

const FLOATING_LABEL_SIZE_CLASSES = {
    sm: 'text-[11px]',
    md: 'text-[11px]',
    lg: 'text-[11px]',
};

/**
 * TreaDatePicker
 *
 * Single:
 * value="2026-07-18"
 *
 * Range:
 * selectionMode="range"
 * value={{
 *     start: '2026-07-01',
 *     end: '2026-07-18',
 * }}
 *
 * onChange selalu mengembalikan string YYYY-MM-DD
 * agar cocok dengan filter Inertia dan backend Laravel.
 */
const TreaDatePicker = forwardRef(
    function TreaDatePicker(
        {
            id,
            name,
            label,
            value = '',
            onChange,
            onBlur,
            onFocus,
            selectionMode = 'single',
            placeholder,
            helperText,
            error,
            required = false,
            disabled = false,
            readOnly = false,
            loading = false,
            clearable = false,
            showClear,
            showIcon = true,
            icon: Icon = CalendarDays,
            showButtonBar = true,
            floatLabel = false,
            size = 'md',
            className = '',
            inputClassName = '',
            labelClassName = '',
            helperClassName = '',
            errorClassName = '',
            calendarClassName = '',
            panelClassName = '',
            locale = 'id',
            dateFormat = 'dd/mm/yy',
            minDate,
            maxDate,
            numberOfMonths = 1,
            touchUI = false,
            appendTo,
            autoFocus = false,
            ariaLabel,
            ariaDescribedBy,
            ...rest
        },
        ref,
    ) {
        const generatedId = useId();
        const inputId =
            id ||
            name ||
            `trea-date-${generatedId}`;

        const [isFocused, setIsFocused] =
            useState(false);

        const helperId = helperText
            ? `${inputId}-helper`
            : undefined;

        const errorId = error
            ? `${inputId}-error`
            : undefined;

        const isRange =
            selectionMode === 'range';

        const hasError = Boolean(error);

        const canClear =
            Boolean(
                showClear ?? clearable,
            ) &&
            !disabled &&
            !readOnly &&
            !loading;

        const resolvedSize =
            SIZE_CLASSES[size] ||
            SIZE_CLASSES.md;

        const calendarValue = useMemo(() => {
            if (!isRange) {
                return parseDate(value);
            }

            const startDate = parseDate(
                value?.start,
            );

            const endDate = parseDate(
                value?.end,
            );

            if (!startDate) {
                return null;
            }

            if (!endDate) {
                return [startDate];
            }

            return [
                startDate,
                endDate,
            ];
        }, [isRange, value]);

        const hasValue = isRange
            ? Boolean(
                  value?.start ||
                      value?.end,
              )
            : Boolean(value);

        const shouldFloat =
            floatLabel &&
            Boolean(label) &&
            (isFocused || hasValue);

        const defaultPlaceholder =
            isRange
                ? 'Pilih rentang tanggal'
                : 'Pilih tanggal';

        const resolvedPlaceholder =
            floatLabel &&
            label &&
            !shouldFloat
                ? ''
                : placeholder ||
                  defaultPlaceholder;

        const floatingLabelBackground =
            disabled || loading
                ? 'bg-slate-100'
                : readOnly
                  ? 'bg-slate-50'
                  : 'bg-white';

        const handleChange = (
            event,
        ) => {
            if (isRange) {
                const dates =
                    Array.isArray(
                        event.value,
                    )
                        ? event.value
                        : [];

                const start =
                    dates[0] ?? null;

                const end =
                    dates[1] ?? null;

                onChange?.(
                    {
                        start: formatDate(
                            start,
                        ),
                        end: formatDate(
                            end,
                        ),
                    },
                    event,
                );

                return;
            }

            onChange?.(
                formatDate(
                    event.value,
                ),
                event,
            );
        };

        const handleFocus = (
            event,
        ) => {
            setIsFocused(true);
            onFocus?.(event);
        };

        const handleBlur = (
            event,
        ) => {
            setIsFocused(false);
            onBlur?.(event);
        };

        const handleClear = () => {
            if (isRange) {
                onChange?.(
                    {
                        start: '',
                        end: '',
                    },
                    null,
                );

                return;
            }

            onChange?.('', null);
        };

        const leftPaddingClass =
            showIcon && Icon
                ? 'pl-9'
                : '';

        const rightPaddingClass =
            canClear && hasValue
                ? 'pr-10'
                : '';

        const panelWidthClass =
            '!w-[23rem] !min-w-0 max-w-[calc(100vw-2rem)]';

        const describedBy =
            ariaDescribedBy ||
            errorId ||
            helperId ||
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
                            'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600',
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

                <div className="relative">
                    {showIcon &&
                        Icon && (
                            <span
                                className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400"
                                aria-hidden="true"
                            >
                                <Icon
                                    size={
                                        resolvedSize.icon
                                    }
                                />
                            </span>
                        )}

                    <Calendar
                        ref={ref}
                        inputId={inputId}
                        name={name}
                        value={
                            calendarValue
                        }
                        onChange={
                            handleChange
                        }
                        onBlur={
                            handleBlur
                        }
                        onFocus={
                            handleFocus
                        }
                        selectionMode={
                            isRange
                                ? 'range'
                                : 'single'
                        }
                        placeholder={
                            resolvedPlaceholder
                        }
                        required={
                            required
                        }
                        disabled={
                            disabled ||
                            loading
                        }
                        readOnlyInput={
                            readOnly
                        }
                        showIcon={false}
                        showButtonBar={
                            showButtonBar
                        }
                        locale={locale}
                        dateFormat={
                            dateFormat
                        }
                        minDate={
                            parseDate(
                                minDate,
                            )
                        }
                        maxDate={
                            parseDate(
                                maxDate,
                            )
                        }
                        numberOfMonths={
                            numberOfMonths
                        }
                        touchUI={
                            touchUI
                        }
                        appendTo={
                            appendTo
                        }
                        autoFocus={
                            autoFocus
                        }
                        ariaLabel={
                            ariaLabel ||
                            label ||
                            name ||
                            'Pilih tanggal'
                        }
                        ariaDescribedBy={
                            describedBy
                        }
                        className={[
                            'w-full',
                            calendarClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        inputClassName={[
                            'w-full rounded-lg border bg-white px-3 outline-none transition',
                            'placeholder:text-slate-300',
                            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
                            'read-only:cursor-default read-only:bg-slate-50',
                            resolvedSize.input,
                            leftPaddingClass,
                            rightPaddingClass,
                            hasError
                                ? 'border-red-400 text-slate-700 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-slate-200 text-slate-700 hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100',
                            inputClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        panelClassName={[
                            panelWidthClass,
                            'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl',
                            panelClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        pt={{
                            root: {
                                className:
                                    'w-full',
                            },

                            input: {
                                root: {
                                    'aria-invalid':
                                        hasError,
                                    'aria-describedby':
                                        describedBy,
                                },
                            },

                            panel: {
                                className: [
                                    panelWidthClass,
                                    'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl',
                                ].join(' '),
                            },

                            header: {
                                className:
                                    'border-b border-slate-100 bg-white px-3 py-3',
                            },

                            title: {
                                className:
                                    'text-sm font-semibold text-slate-700',
                            },

                            previousButton: {
                                className:
                                    'h-8 w-8 rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700',
                            },

                            nextButton: {
                                className:
                                    'h-8 w-8 rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700',
                            },

                            tableHeaderCell: {
                                className:
                                    'w-[14.285%] px-0 py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400',
                            },

                            table: {
                                className:
                                    'w-full table-fixed border-collapse',
                            },

                            day: {
                                className:
                                    'h-8 w-8 rounded-lg text-xs text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700',
                            },

                            buttonbar: {
                                className:
                                    'border-t border-slate-100 bg-slate-50 px-3 py-2',
                            },

                            todayButton: {
                                className:
                                    'rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50',
                            },

                            clearButton: {
                                className:
                                    'rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100',
                            },
                        }}
                        {...rest}
                    />

                    {floatLabel &&
                        label && (
                            <label
                                htmlFor={
                                    inputId
                                }
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
                                          ].join(
                                              ' ',
                                          )
                                        : [
                                              'top-1/2 -translate-y-1/2 text-xs font-medium normal-case text-slate-400',
                                              showIcon &&
                                              Icon
                                                  ? 'left-9'
                                                  : 'left-3',
                                          ].join(
                                              ' ',
                                          ),
                                    disabled ||
                                    loading
                                        ? 'opacity-70'
                                        : '',
                                    labelClassName,
                                ]
                                    .filter(
                                        Boolean,
                                    )
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
                        <div className="pointer-events-none absolute inset-y-0 right-3 z-20 flex items-center">
                            <Loader2
                                size={
                                    resolvedSize.icon
                                }
                                className="animate-spin text-indigo-500"
                                aria-label="Memuat"
                            />
                        </div>
                    )}

                    {!loading &&
                        canClear &&
                        hasValue && (
                            <button
                                type="button"
                                onClick={
                                    handleClear
                                }
                                className={[
                                    'absolute right-2 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md',
                                    'text-slate-400 transition hover:bg-slate-100 hover:text-slate-600',
                                    'focus:outline-none focus:ring-2 focus:ring-indigo-100',
                                ].join(' ')}
                                aria-label={`Bersihkan ${
                                    label ||
                                    'tanggal'
                                }`}
                                tabIndex={-1}
                            >
                                <X size={13} />
                            </button>
                        )}
                </div>

                {helperText &&
                    !hasError && (
                        <p
                            id={
                                helperId
                            }
                            className={[
                                'mt-1.5 text-[11px] leading-4 text-slate-400',
                                helperClassName,
                            ]
                                .filter(
                                    Boolean,
                                )
                                .join(' ')}
                        >
                            {helperText}
                        </p>
                    )}

                {hasError && (
                    <p
                        id={errorId}
                        className={[
                            'mt-1.5 text-xs leading-4 text-red-500',
                            errorClassName,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

TreaDatePicker.displayName =
    'TreaDatePicker';

export default TreaDatePicker;
