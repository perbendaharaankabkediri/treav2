import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaCheckbox from '@/components/ui/TreaCheckbox';
import TreaDatePicker from '@/components/ui/TreaDatePicker';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaEmptyState from '@/components/ui/TreaEmptyState';
import TreaInput from '@/components/ui/TreaInput';
import TreaLoadingOverlay from '@/components/ui/TreaLoadingOverlay';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { TreaSkeletonTable } from '@/components/ui/TreaSkeleton';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownLeft,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    Link2,
    Link2Off,
    ListChecks,
    RefreshCw,
    Search,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const formatIDR = (value) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

function Metric({ label, value, tone = 'slate' }) {
    const toneClass = {
        slate: 'text-slate-800',
        indigo: 'text-indigo-600',
        emerald: 'text-emerald-600',
        amber: 'text-amber-600',
    }[tone];

    return (
        <TreaCard variant="transparent" padding="none" className="min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
            <p className={`mt-1 truncate text-base font-bold ${toneClass}`}>{value}</p>
        </TreaCard>
    );
}

function WorkflowGuide({ tanggal, isProcessed, totalUnmatched }) {
    const isComplete = isProcessed && totalUnmatched === 0;
    const activeStep = !tanggal ? 1 : !isProcessed ? 2 : totalUnmatched > 0 ? 3 : 4;
    const steps = [
        {
            number: 1,
            label: 'Pilih Tanggal',
            description: 'Tentukan hari yang akan diperiksa.',
            icon: CalendarDays,
        },
        {
            number: 2,
            label: 'Proses Otomatis',
            description: 'Cocokkan transaksi BKU dan Bank.',
            icon: Sparkles,
        },
        {
            number: 3,
            label: 'Selesaikan Belum Cocok',
            description: 'Tinjau dan cocokkan transaksi tersisa.',
            icon: ListChecks,
        },
        {
            number: 4,
            label: 'Pastikan Selesai',
            description: 'Pastikan tidak ada transaksi tersisa.',
            icon: ClipboardCheck,
        },
    ];

    const activeDescription = !tanggal
        ? 'Pilih tanggal untuk memulai pencocokan harian.'
        : !isProcessed
          ? `Jalankan pencocokan otomatis untuk ${tanggal}.`
          : totalUnmatched > 0
            ? `${totalUnmatched} transaksi masih perlu diselesaikan.`
            : `Pencocokan ${tanggal} sudah selesai.`;

    return (
        <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid md:grid-cols-4" aria-label="Panduan alur pencocokan harian">
                {steps.map((step, index) => {
                    const completed = step.number < activeStep || (step.number === 4 && isComplete);
                    const active = step.number === activeStep && !completed;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.number}
                            className={`relative flex gap-3 border-b px-4 py-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 ${
                                completed ? 'bg-emerald-50/70' : active ? 'bg-indigo-50/80' : 'bg-white'
                            }`}
                        >
                            {index < steps.length - 1 && <span className="absolute right-0 top-1/2 hidden h-px w-4 bg-slate-200 md:block" />}
                            <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                    completed
                                        ? 'border-emerald-200 bg-emerald-600 text-white'
                                        : active
                                          ? 'border-indigo-200 bg-indigo-600 text-white ring-4 ring-indigo-100'
                                          : 'border-slate-200 bg-slate-50 text-slate-400'
                                }`}
                            >
                                {completed ? <CheckCircle2 size={17} /> : <Icon size={16} />}
                            </span>
                            <span className="min-w-0">
                                <span
                                    className={`block text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-indigo-500' : completed ? 'text-emerald-600' : 'text-slate-400'}`}
                                >
                                    Langkah {step.number}
                                </span>
                                <span
                                    className={`mt-0.5 block text-xs font-bold ${active ? 'text-indigo-900' : completed ? 'text-emerald-900' : 'text-slate-500'}`}
                                >
                                    {step.label}
                                </span>
                                <span className="mt-1 block text-[11px] leading-4 text-slate-500">{step.description}</span>
                            </span>
                        </div>
                    );
                })}
            </div>
            <div
                className={`border-t px-4 py-2.5 text-xs font-medium ${isComplete ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-indigo-100 bg-indigo-50/60 text-indigo-700'}`}
                role="status"
            >
                {activeDescription}
            </div>
        </TreaCard>
    );
}

function SourceBadge({ source }) {
    const isBku = source === 'bku';

    return (
        <TreaBadge tone={isBku ? 'neutral' : 'primary'} size="xs">
            {source?.toUpperCase()}
        </TreaBadge>
    );
}

const jenisConfig = {
    masuk: {
        label: 'Penerimaan',
        description: 'Transaksi dana masuk yang dibandingkan antara BKU dan Bank.',
        icon: ArrowDownLeft,
        frame: 'border-emerald-200',
        header: 'border-emerald-100 bg-emerald-50/80',
        iconBox: 'bg-emerald-100 text-emerald-700',
        title: 'text-emerald-900',
    },
    keluar: {
        label: 'Pengeluaran',
        description: 'Transaksi dana keluar yang dibandingkan antara BKU dan Bank.',
        icon: ArrowUpRight,
        frame: 'border-amber-200',
        header: 'border-amber-100 bg-amber-50/80',
        iconBox: 'bg-amber-100 text-amber-700',
        title: 'text-amber-900',
    },
};

function JenisSectionHeader({ jenis, count, open, onToggle, suffix = 'transaksi' }) {
    const config = jenisConfig[jenis];
    const Icon = config.icon;

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex w-full items-center gap-3 border-b px-4 py-4 text-left transition hover:brightness-[0.98] ${config.header}`}
            aria-expanded={open}
        >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBox}`}>
                <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block text-sm font-bold ${config.title}`}>{config.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{config.description}</span>
            </span>
            <TreaBadge tone={jenis === 'masuk' ? 'success' : 'warning'}>
                {count} {suffix}
            </TreaBadge>
            <ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
        </button>
    );
}

function ConfirmModal({ modal, onClose }) {
    return (
        <TreaDialog
            open={modal.isOpen}
            onClose={onClose}
            title="Konfirmasi tindakan"
            size="sm"
            footer={
                <div className="flex justify-end gap-2">
                    <TreaButton type="button" onClick={onClose} variant="secondary" size="sm">
                        Batal
                    </TreaButton>
                    <TreaButton type="button" onClick={modal.onConfirm} variant={modal.confirmVariant} size="sm">
                        {modal.confirmText}
                    </TreaButton>
                </div>
            }
        >
            <p className="text-sm font-semibold text-trea-heading">{modal.title}</p>
            <p className="mt-2 text-xs leading-5 text-trea-muted">{modal.desc}</p>
        </TreaDialog>
    );
}

function EmptyState({ title, description }) {
    return <TreaEmptyState icon={AlertCircle} title={title} description={description} />;
}

function SelectionBar({ summary, onMatchManual, onClear, loading = false }) {
    if (summary.count === 0) return null;

    return (
        <div className="flex flex-col gap-3 border-b border-indigo-100 bg-indigo-50 px-4 py-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                <span>
                    <strong className="text-slate-800">{summary.count}</strong> dipilih
                </span>
                <span>
                    BKU: <strong className="text-slate-800">{formatIDR(summary.bkuTotal)}</strong>
                </span>
                <span>
                    Bank: <strong className="text-slate-800">{formatIDR(summary.bankTotal)}</strong>
                </span>

                {summary.isBalanced ? (
                    <TreaBadge tone="success">
                        <CheckCircle2 size={11} />
                        Balance
                    </TreaBadge>
                ) : (
                    <TreaBadge tone="warning">
                        <AlertCircle size={11} />
                        Selisih {formatIDR(Math.abs(summary.selisih))}
                    </TreaBadge>
                )}
            </div>

            <div className="flex items-center gap-2 lg:ml-auto">
                <TreaButton type="button" onClick={onClear} variant="secondary" size="xs" disabled={loading}>
                    Batal pilih
                </TreaButton>
                <TreaButton
                    type="button"
                    onClick={onMatchManual}
                    disabled={summary.count < 2 || !summary.isBalanced || summary.bkuTotal === 0 || summary.bankTotal === 0}
                    variant="success"
                    loading={loading}
                    loadingLabel="Menjodohkan..."
                    size="xs"
                    icon={Link2}
                >
                    Cocokkan manual
                </TreaButton>
            </div>
        </div>
    );
}

function TransactionList({ rows, selectedIds = [], onCheckboxChange }) {
    if (rows.length === 0) {
        return <p className="px-4 py-6 text-center text-xs text-slate-400">Tidak ada transaksi.</p>;
    }

    return (
        <div className="divide-y divide-slate-100">
            {rows.map((row) => {
                const rowId = row.id || row.unique_id;
                const checked = selectedIds.includes(rowId);
                const selectable = Boolean(onCheckboxChange);

                return (
                    <div
                        key={rowId}
                        onClick={selectable ? () => onCheckboxChange(rowId) : undefined}
                        className={`flex items-start gap-3 px-4 py-3 transition ${
                            selectable ? 'cursor-pointer' : ''
                        } ${checked ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                    >
                        {selectable && (
                            <div onClick={(event) => event.stopPropagation()}>
                                <TreaCheckbox
                                    aria-label={`Pilih transaksi ${rowId}`}
                                    checked={checked}
                                    onCheckedChange={() => onCheckboxChange(rowId)}
                                    className="mt-0.5 size-4"
                                />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs text-slate-600" title={row.keterangan}>
                                {row.keterangan || '-'}
                            </p>
                            <p className="mt-1 font-mono text-[10px] text-slate-400">ID #{row.source_id}</p>
                        </div>
                        <p className="shrink-0 font-mono text-xs font-semibold text-slate-800">{formatIDR(row.nominal)}</p>
                    </div>
                );
            })}
        </div>
    );
}

function SourceColumn({ source, rows, selectedIds, onCheckboxChange }) {
    const total = rows.reduce((sum, row) => sum + Number(row.nominal ?? 0), 0);

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
                <SourceBadge source={source} />
                <span className="font-mono text-[11px] font-semibold text-slate-600">{formatIDR(total)}</span>
            </div>
            <TransactionList rows={rows} selectedIds={selectedIds} onCheckboxChange={onCheckboxChange} />
        </div>
    );
}

function UnmatchedSection({ rows, selectedIds, onCheckboxChange, onSelectAll, selectionSummary, onMatchManual, matching = false }) {
    const [expanded, setExpanded] = useState({ masuk: false, keluar: false });
    const sections = ['masuk', 'keluar']
        .map((jenis) => ({
            jenis,
            bku: rows.filter((row) => row.jenis === jenis && row.source === 'bku'),
            bank: rows.filter((row) => row.jenis === jenis && row.source === 'bank'),
        }))
        .filter((section) => section.bku.length > 0 || section.bank.length > 0);

    return (
        <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <AlertCircle size={17} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-800">Belum Cocok</h2>
                        <p className="mt-0.5 text-xs text-slate-400">Transaksi yang masih membutuhkan pencocokan.</p>
                    </div>
                </div>

                <TreaBadge tone="warning">{rows.length} transaksi</TreaBadge>
            </div>

            {rows.length === 0 ? (
                <EmptyState title="Semua transaksi sudah cocok" description="Tidak ada transaksi belum cocok pada tampilan ini." />
            ) : (
                <div className="space-y-4 bg-slate-50/40 p-4">
                    {sections.map((section) => {
                        const allIds = [...section.bku, ...section.bank].map((row) => row.id || row.unique_id);
                        const allChecked = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
                        const isOpen = expanded[section.jenis];
                        const hasSelection = allIds.some((id) => selectedIds.includes(id));
                        const config = jenisConfig[section.jenis];

                        return (
                            <section key={section.jenis} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${config.frame}`}>
                                <JenisSectionHeader
                                    jenis={section.jenis}
                                    count={allIds.length}
                                    open={isOpen}
                                    onToggle={() => setExpanded((current) => ({ ...current, [section.jenis]: !current[section.jenis] }))}
                                />

                                {isOpen && (
                                    <div>
                                        {hasSelection && (
                                            <SelectionBar
                                                summary={selectionSummary}
                                                onMatchManual={onMatchManual}
                                                onClear={() => onCheckboxChange(null, true)}
                                                loading={matching}
                                            />
                                        )}
                                        <div className="p-4">
                                            <label className="mb-3 inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-500">
                                                <TreaCheckbox
                                                    aria-label={`Pilih semua transaksi ${jenisConfig[section.jenis].label.toLowerCase()}`}
                                                    checked={allChecked}
                                                    onCheckedChange={(checked) => onSelectAll(checked === true, allIds)}
                                                />
                                                Pilih semua transaksi {jenisConfig[section.jenis].label.toLowerCase()}
                                            </label>
                                            <div className="grid gap-3 lg:grid-cols-2">
                                                <SourceColumn
                                                    source="bku"
                                                    rows={section.bku}
                                                    selectedIds={selectedIds}
                                                    onCheckboxChange={onCheckboxChange}
                                                />
                                                <SourceColumn
                                                    source="bank"
                                                    rows={section.bank}
                                                    selectedIds={selectedIds}
                                                    onCheckboxChange={onCheckboxChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}
        </TreaCard>
    );
}

function MatchedSection({ groups, onUnmatch, unmatchingGroupId = null }) {
    const entries = Object.entries(groups);
    const totalTransactions = entries.reduce((total, [, rows]) => total + rows.length, 0);
    const [expanded, setExpanded] = useState({ masuk: false, keluar: false });
    const sections = ['masuk', 'keluar']
        .map((jenis) => ({
            jenis,
            entries: entries.filter(([, rows]) => rows[0]?.jenis === jenis),
        }))
        .filter((section) => section.entries.length > 0);

    return (
        <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={17} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-slate-800">Sudah Cocok</h2>
                        <p className="mt-0.5 text-xs text-slate-400">Kelompok transaksi yang berhasil dicocokkan.</p>
                    </div>
                </div>

                <TreaBadge tone="success">
                    {totalTransactions} transaksi / {entries.length} kelompok
                </TreaBadge>
            </div>

            {entries.length === 0 ? (
                <EmptyState title="Belum ada transaksi yang cocok" description="Jalankan pencocokan otomatis atau lakukan pencocokan manual." />
            ) : (
                <div className="space-y-4 bg-slate-50/40 p-4">
                    {sections.map((section) => {
                        const isOpen = expanded[section.jenis];
                        const transactionCount = section.entries.reduce((total, [, rows]) => total + rows.length, 0);
                        const config = jenisConfig[section.jenis];

                        return (
                            <section key={section.jenis} className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${config.frame}`}>
                                <JenisSectionHeader
                                    jenis={section.jenis}
                                    count={transactionCount}
                                    open={isOpen}
                                    onToggle={() => setExpanded((current) => ({ ...current, [section.jenis]: !current[section.jenis] }))}
                                />

                                {isOpen && (
                                    <div className="divide-y divide-slate-100">
                                        {section.entries.map(([groupId, rows]) => {
                                            const bkuRows = rows.filter((row) => row.source === 'bku');
                                            const bankRows = rows.filter((row) => row.source === 'bank');
                                            const bkuTotal = bkuRows.reduce((sum, row) => sum + Number(row.nominal ?? 0), 0);
                                            const bankTotal = bankRows.reduce((sum, row) => sum + Number(row.nominal ?? 0), 0);
                                            const isBalanced = Math.abs(bkuTotal - bankTotal) < 0.001;

                                            return (
                                                <div key={groupId} className="px-4 py-4">
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-semibold text-slate-500">
                                                                KELOMPOK #{groupId}
                                                            </span>
                                                            <TreaBadge tone={isBalanced ? 'success' : 'danger'} size="xs">
                                                                {isBalanced ? 'Balance' : `Selisih ${formatIDR(Math.abs(bkuTotal - bankTotal))}`}
                                                            </TreaBadge>
                                                        </div>

                                                        <TreaButton
                                                            type="button"
                                                            onClick={() => onUnmatch(groupId)}
                                                            variant="warning"
                                                            size="xs"
                                                            icon={Link2Off}
                                                            loading={String(unmatchingGroupId) === String(groupId)}
                                                            loadingLabel="Melepaskan..."
                                                            disabled={unmatchingGroupId !== null && String(unmatchingGroupId) !== String(groupId)}
                                                        >
                                                            Lepas kelompok
                                                        </TreaButton>
                                                    </div>

                                                    <div className="grid gap-3 lg:grid-cols-2">
                                                        <SourceColumn source="bku" rows={bkuRows} />
                                                        <SourceColumn source="bank" rows={bankRows} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}
        </TreaCard>
    );
}

export default function PencocokanHarian({
    flash = {},
    tanggal = '',
    status = '',
    search = '',
    data = [],
    total = 0,
    totalMatched = 0,
    totalUnmatched = 0,
    totalNominalMatched = 0,
    totalNominalUnmatched = 0,
    isProcessed = false,
}) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeStatus, setActiveStatus] = useState(['matched', 'unmatched'].includes(status) ? status : '');
    const [activeAction, setActiveAction] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        desc: '',
        onConfirm: () => {},
        confirmText: 'Ya, lanjutkan',
        confirmVariant: 'primary',
    });

    const [filters, setFilters] = useState({
        tanggal: tanggal || '',
        search: search || '',
    });

    const unmatchedData = useMemo(() => (activeStatus === 'matched' ? [] : data.filter((row) => row.status === 'unmatched')), [data, activeStatus]);

    const matchedGroups = useMemo(() => {
        if (activeStatus === 'unmatched') return {};

        return data
            .filter((row) => row.status !== 'unmatched' && row.group_id)
            .reduce((groups, row) => {
                if (!groups[row.group_id]) groups[row.group_id] = [];
                groups[row.group_id].push(row);
                return groups;
            }, {});
    }, [data, activeStatus]);

    const selectionSummary = useMemo(() => {
        let bkuTotal = 0;
        let bankTotal = 0;

        selectedIds.forEach((id) => {
            const item = data.find((row) => row.id === id || row.unique_id === id);

            if (!item) return;

            const nominal = Number(item.nominal ?? 0);

            if (item.source === 'bku') bkuTotal += nominal;
            if (item.source === 'bank') bankTotal += nominal;
        });

        const selisih = bkuTotal - bankTotal;

        return {
            count: selectedIds.length,
            bkuTotal,
            bankTotal,
            selisih,
            isBalanced: Math.abs(selisih) < 0.001,
        };
    }, [selectedIds, data]);

    const handleDateSubmit = (event) => {
        event.preventDefault();
        if (activeAction) return;

        setSelectedIds([]);
        setActiveAction({
            key: 'filter',
            title: 'Memuat transaksi',
            desc: 'Sedang menerapkan tanggal dan filter pencarian.',
        });

        router.get(
            route('kasda.pencocokan-harian.index'),
            { tanggal: filters.tanggal },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setActiveAction(null),
            },
        );
    };

    const handleSearch = (event) => {
        event.preventDefault();
        if (activeAction || !tanggal) return;

        setSelectedIds([]);
        setActiveAction({
            key: 'filter',
            title: 'Mencari transaksi',
            desc: 'Sedang mencari uraian atau ID transaksi.',
        });

        router.get(
            route('kasda.pencocokan-harian.index'),
            { tanggal, search: filters.search },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setActiveAction(null),
            },
        );
    };

    const closeConfirmModal = () => {
        setConfirmModal((current) => ({ ...current, isOpen: false }));
    };

    const handleCheckboxChange = (id, clearAll = false) => {
        if (clearAll) {
            setSelectedIds([]);
            return;
        }

        setSelectedIds((current) => {
            if (current.includes(id)) return current.filter((selectedId) => selectedId !== id);

            const selectedRow = data.find((row) => row.id === id || row.unique_id === id);
            const currentRows = data.filter((row) => current.includes(row.id) || current.includes(row.unique_id));
            const sameJenis = currentRows.every((row) => row.jenis === selectedRow?.jenis);

            // Memulai pilihan baru ketika pengguna berpindah antara Penerimaan dan Pengeluaran.
            return sameJenis ? [...current, id] : [id];
        });
    };

    const handleSelectAll = (checked, ids) => {
        setSelectedIds(checked ? ids : []);
    };

    const handleMatchManual = () => {
        if (selectedIds.length < 2 || activeAction) return;

        setConfirmModal({
            isOpen: true,
            title: 'Hubungkan transaksi secara manual?',
            desc: `${selectedIds.length} transaksi terpilih akan dijadikan satu kelompok pencocokan. Pastikan transaksi BKU dan Bank sudah sesuai.`,
            confirmText: 'Ya, jodohkan',
            confirmVariant: 'primary',
            onConfirm: () => {
                closeConfirmModal();
                setActiveAction({
                    key: 'manual-match',
                    title: 'Menjodohkan transaksi',
                    desc: 'Sedang membuat kelompok pencocokan manual.',
                });

                router.post(
                    route('kasda.pencocokan-harian.manual'),
                    {
                        selected: selectedIds,
                        tanggal,
                        search: filters.search,
                    },
                    {
                        onSuccess: () => setSelectedIds([]),
                        onFinish: () => setActiveAction(null),
                    },
                );
            },
        });
    };

    const handleProsesOtomatis = () => {
        if (activeAction) return;

        setConfirmModal({
            isOpen: true,
            title: 'Jalankan pencocokan otomatis?',
            desc: 'Data pencocokan pada tanggal ini akan diproses ulang berdasarkan transaksi BKU dan Bank.',
            confirmText: 'Ya, proses',
            confirmVariant: 'primary',
            onConfirm: () => {
                closeConfirmModal();
                setActiveAction({
                    key: 'automatic-match',
                    title: 'Memproses rekonsiliasi',
                    desc: 'Sedang mencocokkan transaksi BKU dan Bank.',
                });

                router.post(route('kasda.pencocokan-harian.proses'), { tanggal }, { onFinish: () => setActiveAction(null) });
            },
        });
    };

    const handleResetPencocokan = () => {
        if (activeAction) return;

        setConfirmModal({
            isOpen: true,
            title: 'Hapus rekonsiliasi hari ini?',
            desc: 'Seluruh hasil pencocokan pada tanggal ini akan dihapus.',
            confirmText: 'Ya, hapus',
            confirmVariant: 'danger',
            onConfirm: () => {
                closeConfirmModal();
                setActiveAction({
                    key: 'delete-matches',
                    title: 'Menghapus rekonsiliasi',
                    desc: 'Sedang mengembalikan status transaksi.',
                });

                router.post(
                    route('kasda.pencocokan-harian.delete'),
                    { tanggal },
                    {
                        onSuccess: () => setSelectedIds([]),
                        onFinish: () => setActiveAction(null),
                    },
                );
            },
        });
    };

    const handleUnmatchGroup = (groupId) => {
        if (activeAction) return;

        setConfirmModal({
            isOpen: true,
            title: `Lepas kelompok #${groupId}?`,
            desc: 'Semua transaksi dalam kelompok ini akan dipisahkan dan dikembalikan menjadi belum cocok.',
            confirmText: 'Ya, lepaskan',
            confirmVariant: 'warning',
            onConfirm: () => {
                closeConfirmModal();
                setActiveAction({
                    key: 'unmatch',
                    groupId,
                    title: `Melepas kelompok #${groupId}`,
                    desc: 'Sedang mengembalikan transaksi menjadi belum cocok.',
                });

                router.post(
                    route('kasda.pencocokan-harian.unmatch'),
                    {
                        group_id: groupId,
                        tanggal,
                    },
                    { onFinish: () => setActiveAction(null) },
                );
            },
        });
    };

    return (
        <>
            <Head title="Pencocokan Harian" />

            <ConfirmModal modal={confirmModal} onClose={closeConfirmModal} />
            <TreaLoadingOverlay
                open={Boolean(activeAction && activeAction.key !== 'filter')}
                title={activeAction?.title}
                description={activeAction?.desc}
            />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Pencocokan Harian"
                    subtitle="Cocokkan transaksi BKU dengan mutasi rekening berdasarkan tanggal dan jenis transaksi."
                />
                <WorkflowGuide tanggal={tanggal} isProcessed={isProcessed} totalUnmatched={totalUnmatched} />
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <form onSubmit={handleDateSubmit}>
                        <div className="flex flex-col gap-3 px-5 py-4 xl:flex-row xl:items-end">
                            <div className="w-full xl:w-64">
                                <TreaDatePicker
                                    id="tanggal"
                                    name="tanggal"
                                    label="Tanggal"
                                    value={filters.tanggal}
                                    onChange={(value) =>
                                        setFilters((current) => ({
                                            ...current,
                                            tanggal: value,
                                        }))
                                    }
                                    size="sm"
                                    showIcon
                                    showButtonBar
                                    clearable
                                    floatLabel
                                />
                            </div>

                            <TreaButton
                                type="submit"
                                size="sm"
                                loading={activeAction?.key === 'filter'}
                                loadingLabel="Memuat..."
                                disabled={Boolean(activeAction) || !filters.tanggal}
                            >
                                Tampilkan
                            </TreaButton>

                            {tanggal && (
                                <div className="flex items-center gap-2 xl:ml-auto">
                                    <TreaButton
                                        type="button"
                                        onClick={handleProsesOtomatis}
                                        icon={RefreshCw}
                                        variant="success"
                                        size="sm"
                                        loading={activeAction?.key === 'automatic-match'}
                                        loadingLabel="Memproses..."
                                        disabled={Boolean(activeAction)}
                                    >
                                        Proses Otomatis
                                    </TreaButton>

                                    <TreaButton
                                        type="button"
                                        onClick={handleResetPencocokan}
                                        variant="danger"
                                        size="sm"
                                        icon={Trash2}
                                        loading={activeAction?.key === 'delete-matches'}
                                        loadingLabel="Menghapus..."
                                        disabled={Boolean(activeAction)}
                                    >
                                        Hapus
                                    </TreaButton>
                                </div>
                            )}
                        </div>
                    </form>

                    {tanggal && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex w-full border-b border-slate-200 sm:w-auto" role="tablist" aria-label="Status pencocokan">
                                {[
                                    { value: '', label: 'Semua', count: total },
                                    { value: 'unmatched', label: 'Belum Cocok', count: totalUnmatched },
                                    { value: 'matched', label: 'Sudah Cocok', count: totalMatched },
                                ].map((tab) => (
                                    <button
                                        key={tab.value || 'all'}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeStatus === tab.value}
                                        onClick={() => {
                                            setActiveStatus(tab.value);
                                            setSelectedIds([]);
                                        }}
                                        className={`relative flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition sm:flex-none ${
                                            activeStatus === tab.value
                                                ? 'border-slate-800 text-slate-900'
                                                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                    >
                                        {tab.label}
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                                tab.value === 'unmatched'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : tab.value === 'matched'
                                                      ? 'bg-emerald-100 text-emerald-700'
                                                      : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSearch} className="flex w-full items-start gap-2 xl:max-w-md">
                                <div className="min-w-0 flex-1">
                                    <TreaInput
                                        id="search"
                                        name="search"
                                        label="Cari uraian atau ID transaksi"
                                        value={filters.search}
                                        onChange={(value) => setFilters((current) => ({ ...current, search: value }))}
                                        placeholder="Contoh: pajak atau 1024"
                                        icon={Search}
                                        clearable
                                        floatLabel
                                    />
                                </div>
                                <TreaButton
                                    type="submit"
                                    size="sm"
                                    icon={Search}
                                    variant="secondary"
                                    loading={activeAction?.key === 'filter'}
                                    loadingLabel="Mencari..."
                                    disabled={Boolean(activeAction)}
                                >
                                    Cari
                                </TreaButton>
                            </form>
                        </div>
                    )}
                </TreaCard>

                {activeAction?.key === 'filter' && (
                    <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <TreaSkeletonTable rows={8} columns={4} />
                    </TreaCard>
                )}

                {activeAction?.key !== 'filter' && tanggal && data.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <Metric label="Total transaksi" value={total} tone="slate" />
                        <Metric label="Sudah cocok" value={totalMatched} tone="emerald" />
                        <Metric label="Belum cocok" value={totalUnmatched} tone="amber" />
                        <Metric label="Nominal sudah cocok" value={formatIDR(totalNominalMatched)} tone="indigo" />
                        <Metric label="Nominal belum cocok" value={formatIDR(totalNominalUnmatched)} tone="slate" />
                    </div>
                )}

                {activeAction?.key !== 'filter' &&
                    tanggal &&
                    (data.length === 0 ? (
                        <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white">
                            <EmptyState
                                title={total > 0 ? 'Transaksi tidak ditemukan' : 'Tidak ada data pada tanggal ini'}
                                description={
                                    total > 0
                                        ? `Tidak ada uraian atau ID yang sesuai dengan “${search}”. Coba gunakan kata kunci lain.`
                                        : `Pastikan data BKU dan Bank tanggal ${tanggal} sudah diimpor, lalu jalankan proses rekonsiliasi.`
                                }
                            />
                        </TreaCard>
                    ) : (
                        <div className="space-y-4">
                            {activeStatus !== 'matched' && (
                                <UnmatchedSection
                                    rows={unmatchedData}
                                    selectedIds={selectedIds}
                                    onCheckboxChange={handleCheckboxChange}
                                    onSelectAll={handleSelectAll}
                                    selectionSummary={selectionSummary}
                                    onMatchManual={handleMatchManual}
                                    matching={activeAction?.key === 'manual-match'}
                                />
                            )}

                            {activeStatus !== 'unmatched' && (
                                <MatchedSection
                                    groups={matchedGroups}
                                    onUnmatch={handleUnmatchGroup}
                                    unmatchingGroupId={activeAction?.key === 'unmatch' ? activeAction.groupId : null}
                                />
                            )}
                        </div>
                    ))}
            </TreaPage>
        </>
    );
}
