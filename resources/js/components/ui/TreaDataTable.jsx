import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { forwardRef } from 'react';
import TreaEmptyState from './TreaEmptyState';
import { TreaSkeletonTable } from './TreaSkeleton';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const variantMap = {
    standalone:
        'overflow-hidden rounded-2xl border border-trea-border bg-trea-card shadow-trea-card',
    embedded: 'overflow-hidden bg-trea-card',
    plain: '',
};

const TreaDataTable = forwardRef(function TreaDataTable(
    {
        data,
        value,
        columns = [],
        dataKey = 'id',
        variant = 'standalone',
        loading = false,
        skeletonRows = 6,
        emptyIcon,
        emptyTitle = 'Belum ada data',
        emptyDescription = 'Data akan ditampilkan ketika sudah tersedia.',
        emptyAction,
        emptyMessage,
        paginator = false,
        rows = 10,
        rowsPerPageOptions = [10, 25, 50],
        scrollable = false,
        scrollHeight,
        stripedRows = false,
        showGridlines = false,
        size = 'small',
        tableStyle,
        className = '',
        tableClassName = '',
        ...props
    },
    ref,
) {
    const resolvedData = value ?? data ?? [];

    if (loading) {
        return (
            <TreaSkeletonTable
                rows={skeletonRows}
                columns={Math.max(columns.length, 1)}
                className={className}
            />
        );
    }

    const resolvedEmptyMessage =
        emptyMessage ?? (
            <TreaEmptyState
                size="sm"
                icon={emptyIcon}
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
            />
        );

    return (
        <div
            className={joinClasses(
                'trea-datatable',
                variantMap[variant] || variantMap.standalone,
                className,
            )}
        >
            <DataTable
                ref={ref}
                value={resolvedData}
                dataKey={dataKey}
                emptyMessage={resolvedEmptyMessage}
                paginator={
                    paginator && resolvedData.length > rows
                }
                rows={rows}
                rowsPerPageOptions={rowsPerPageOptions}
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first}–{last} dari {totalRecords}"
                scrollable={scrollable}
                scrollHeight={scrollHeight}
                stripedRows={stripedRows}
                showGridlines={showGridlines}
                size={size}
                tableStyle={{ minWidth: '100%', ...tableStyle }}
                className={tableClassName}
                {...props}
            >
                {columns.map((column, index) => {
                    const {
                        key,
                        type,
                        headerClassName,
                        bodyClassName,
                        ...columnProps
                    } = column;
                    const alignment =
                        type === 'numeric'
                            ? 'right'
                            : columnProps.align;

                    return (
                        <Column
                            key={
                                key ??
                                columnProps.field ??
                                columnProps.header ??
                                index
                            }
                            {...columnProps}
                            align={alignment}
                            alignHeader={
                                columnProps.alignHeader ??
                                alignment
                            }
                            headerClassName={joinClasses(
                                type === 'numeric'
                                    ? 'trea-datatable-numeric'
                                    : '',
                                headerClassName,
                            )}
                            bodyClassName={joinClasses(
                                type === 'numeric'
                                    ? 'trea-datatable-numeric'
                                    : '',
                                bodyClassName,
                            )}
                        />
                    );
                })}
            </DataTable>
        </div>
    );
});

TreaDataTable.displayName = 'TreaDataTable';

export { Column as TreaDataTableColumn };
export default TreaDataTable;
