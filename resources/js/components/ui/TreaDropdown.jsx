import { useId, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';

const sizeClasses = {
    sm: 'trea-dropdown-sm',
    md: 'trea-dropdown-md',
    lg: 'trea-dropdown-lg',
};

const floatingLabelSizeClasses = {
    sm: 'text-[11px]',
    md: 'text-[11px]',
    lg: 'text-[11px]',
};

export default function TreaDropdown({
    id,
    name,
    label,
    required = false,
    value,
    options = [],
    optionLabel,
    optionValue,
    optionDescription,
    placeholder = 'Pilih data',
    filter = false,
    filterBy,
    filterPlaceholder = 'Cari data',
    emptyMessage = 'Data tidak tersedia',
    emptyFilterMessage = 'Data tidak ditemukan',
    showClear = false,
    resetFilterOnHide = true,
    loading = false,
    disabled = false,
    error,
    helperText,
    icon: Icon,
    floatLabel = false,
    size = 'md',
    scrollHeight = '280px',
    className = '',
    panelClassName = '',
    inputClassName = '',
    labelClassName = '',
    itemTemplate,
    valueTemplate,
    onChange,
    onFocus,
    onBlur,
    ...props
}) {
    const generatedId = useId();
    const fieldId = id || name || generatedId;

    const [isFocused, setIsFocused] = useState(false);

    const hasError = Boolean(error);

    const hasSelectedOption = options.some((option) => {
        const resolvedOptionValue = optionValue
            ? option?.[optionValue]
            : option;

        return resolvedOptionValue === value;
    });

    const hasValue =
        hasSelectedOption ||
        (value !== null &&
            value !== undefined &&
            value !== '');

    const shouldFloat =
        floatLabel &&
        Boolean(label) &&
        (isFocused || hasValue);

    const resolvedPlaceholder =
        floatLabel && label && !shouldFloat
            ? ''
            : placeholder;

    const floatingLabelBackground = disabled
        ? 'bg-slate-100'
        : 'bg-white';

    const handleFocus = (event) => {
        setIsFocused(true);
        onFocus?.(event);
    };

    const handleBlur = (event) => {
        setIsFocused(false);
        onBlur?.(event);
    };

    const defaultItemTemplate = (option) => {
        if (!option) {
            return null;
        }

        const primaryText = optionLabel
            ? option?.[optionLabel]
            : String(option);

        const description = optionDescription
            ? option?.[optionDescription]
            : null;

        return (
            <div className="trea-dropdown-option">
                <span className="trea-dropdown-option-label">
                    {primaryText}
                </span>

                {description !== undefined &&
                    description !== null &&
                    description !== '' && (
                        <span className="trea-dropdown-option-description">
                            {description}
                        </span>
                    )}
            </div>
        );
    };

    const defaultValueTemplate = (
        selectedOption,
        dropdownProps,
    ) => {
        if (!selectedOption) {
            return (
                <span className="trea-dropdown-placeholder">
                    {dropdownProps.placeholder}
                </span>
            );
        }

        const primaryText = optionLabel
            ? selectedOption?.[optionLabel]
            : String(selectedOption);

        return (
            <span className="trea-dropdown-selected-value">
                {primaryText}
            </span>
        );
    };

    const dropdownClassName = [
        'trea-dropdown',
        sizeClasses[size] || sizeClasses.md,
        Icon ? 'trea-dropdown-with-icon' : '',
        hasError ? 'p-invalid trea-dropdown-invalid' : '',
        hasValue ? 'p-inputwrapper-filled' : '',
        inputClassName,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={[
                'trea-dropdown-field',
                disabled
                    ? 'trea-dropdown-field-disabled'
                    : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {!floatLabel && label && (
                <label
                    htmlFor={fieldId}
                    className={[
                        'trea-field-label',
                        labelClassName,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {label}

                    {required && (
                        <span
                            className="trea-field-required"
                            aria-hidden="true"
                        >
                            *
                        </span>
                    )}
                </label>
            )}

            <div className="trea-dropdown-control relative">
                {Icon && (
                    <Icon
                        size={15}
                        strokeWidth={1.8}
                        className="trea-dropdown-leading-icon z-10"
                        aria-hidden="true"
                    />
                )}

                <Dropdown
                    inputId={fieldId}
                    name={name || fieldId}
                    value={value}
                    options={options}
                    optionLabel={optionLabel}
                    optionValue={optionValue}
                    placeholder={resolvedPlaceholder}
                    filter={filter}
                    filterBy={filterBy}
                    filterPlaceholder={filterPlaceholder}
                    emptyMessage={emptyMessage}
                    emptyFilterMessage={emptyFilterMessage}
                    showClear={showClear}
                    resetFilterOnHide={resetFilterOnHide}
                    loading={loading}
                    disabled={disabled}
                    required={required}
                    scrollHeight={scrollHeight}
                    className={dropdownClassName}
                    panelClassName={[
                        'trea-dropdown-panel',
                        panelClassName,
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    itemTemplate={
                        itemTemplate ||
                        (optionDescription
                            ? defaultItemTemplate
                            : undefined)
                    }
                    valueTemplate={
                        valueTemplate ||
                        (optionDescription
                            ? defaultValueTemplate
                            : undefined)
                    }
                    onChange={(event) =>
                        onChange?.(event.value, event)
                    }
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    aria-invalid={hasError}
                    aria-describedby={
                        hasError
                            ? `${fieldId}-error`
                            : helperText
                              ? `${fieldId}-helper`
                              : undefined
                    }
                    {...props}
                />

                {floatLabel && label && (
                    <label
                        htmlFor={fieldId}
                        className={[
                            'pointer-events-none absolute z-20 whitespace-nowrap transition-all duration-200 ease-out',
                            shouldFloat
                                ? [
                                      '-top-2 left-2.5 px-1 font-semibold leading-4',
                                      floatingLabelSizeClasses[
                                          size
                                      ] ||
                                          floatingLabelSizeClasses.md,
                                      floatingLabelBackground,
                                      hasError
                                          ? 'text-red-500'
                                          : isFocused
                                            ? 'text-indigo-600'
                                            : 'text-slate-500',
                                  ].join(' ')
                                : [
                                      'top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400',
                                      Icon
                                          ? 'left-9'
                                          : 'left-3',
                                  ].join(' '),
                            disabled ? 'opacity-70' : '',
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
            </div>

            {helperText && !hasError && (
                <p
                    id={`${fieldId}-helper`}
                    className="trea-field-helper"
                >
                    {helperText}
                </p>
            )}

            {hasError && (
                <p
                    id={`${fieldId}-error`}
                    className="trea-field-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
