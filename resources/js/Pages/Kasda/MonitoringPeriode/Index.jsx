import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDatePicker from '@/components/ui/TreaDatePicker';
import TreaEmptyState from '@/components/ui/TreaEmptyState';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { useTreaToast } from '@/components/ui/TreaToast';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowRight, CalendarRange, CheckCircle2, Loader2, Search } from 'lucide-react';

const formatNumber = (num) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(num ?? 0));

const isBalanced = (value) => Math.abs(Number(value ?? 0)) < 0.001;

function StatusBadge({ balanced, compact = false }) {
    return (
        <TreaBadge tone={balanced ? 'success' : 'warning'} size={compact ? 'xs' : 'sm'} icon={balanced ? CheckCircle2 : AlertCircle}>
            {balanced ? 'Balance' : 'Ada selisih'}
        </TreaBadge>
    );
}

function EmptyState({ filtered = false }) {
    return (
        <TreaEmptyState
            variant="surface"
            size="lg"
            icon={CalendarRange}
            title={filtered ? 'Tidak ada data pada periode ini' : 'Pilih periode monitoring'}
            description={
                filtered
                    ? 'Coba pilih rentang tanggal lain atau pastikan data Bank dan BKU sudah tersedia.'
                    : 'Gunakan filter periode di atas untuk melihat perbandingan mutasi Bank dan BKU.'
            }
        />
    );
}

export default function MonitoringPeriode({
    tgl_awal,
    tgl_akhir,
    rows = [],
    isFiltered,
    totalBankPenerimaan,
    totalBkuPenerimaan,
    totalSelisihPenerimaan,
    totalBankPengeluaran,
    totalBkuPengeluaran,
    totalSelisihPengeluaran,
    saldoAkhirBank,
    saldoAkhirBku,
    saldoAkhirSelisih,
    title,
}) {
    const toast = useTreaToast();

    const { data, setData, get, processing, clearErrors } = useForm({
        tgl_awal: tgl_awal || '',
        tgl_akhir: tgl_akhir || '',
    });

    const handleFilterSubmit = (event) => {
        event.preventDefault();

        if (!data.tgl_awal || !data.tgl_akhir) {
            toast.warning('Pilih rentang tanggal terlebih dahulu.');
            return;
        }

        clearErrors('periode');
        get(route('kasda.monitoring-periode.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hariSelisih = rows.filter(
        (row) => !isBalanced(row.selisih_penerimaan) || !isBalanced(row.selisih_pengeluaran) || !isBalanced(row.selisih_saldo),
    ).length;

    return (
        <>
            <Head title={title} />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Monitoring Periode"
                    subtitle="Bandingkan penerimaan, pengeluaran, dan saldo Bank dengan BKU untuk setiap tanggal."
                />
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-end">
                        <div className="flex-1">
                            <TreaDatePicker
                                id="periode-monitoring"
                                label="Periode monitoring"
                                selectionMode="range"
                                value={{
                                    start: data.tgl_awal,
                                    end: data.tgl_akhir,
                                }}
                                onChange={({ start, end }) => {
                                    clearErrors('periode');
                                    setData((current) => ({
                                        ...current,
                                        tgl_awal: start,
                                        tgl_akhir: end,
                                    }));
                                }}
                                placeholder="Pilih rentang tanggal"
                                size="sm"
                                showIcon
                                showButtonBar
                                clearable
                                floatLabel
                            />
                        </div>

                        <TreaButton type="submit" disabled={processing || !data.tgl_awal || !data.tgl_akhir} size="sm" className="lg:w-auto">
                            {processing ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    Memuat...
                                </>
                            ) : (
                                <>
                                    <Search size={13} />
                                    Tampilkan
                                </>
                            )}
                        </TreaButton>
                    </form>
                </TreaCard>

                {!isFiltered && <EmptyState />}

                {isFiltered && rows.length === 0 && <EmptyState filtered />}

                {isFiltered && rows.length > 0 && (
                    <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-800">Perbandingan per tanggal</h2>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Klik tanggal untuk memeriksa dan memproses transaksi pada hari tersebut.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <TreaBadge tone="neutral">{rows.length} hari</TreaBadge>
                                <TreaBadge tone={hariSelisih === 0 ? 'success' : 'warning'}>
                                    {hariSelisih === 0 ? 'Semua balance' : `${hariSelisih} hari berselisih`}
                                </TreaBadge>
                            </div>
                        </div>

                        <div className="max-h-[620px] overflow-auto">
                            <table className="w-full min-w-[1180px] whitespace-nowrap text-xs">
                                <thead className="sticky top-0 z-20">
                                    <tr>
                                        <th
                                            rowSpan={2}
                                            className="border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-500"
                                        >
                                            Tanggal
                                        </th>
                                        <th
                                            colSpan={3}
                                            className="border-b border-r border-slate-200 bg-indigo-50 px-4 py-2.5 text-center font-semibold uppercase tracking-wider text-indigo-600"
                                        >
                                            Penerimaan
                                        </th>
                                        <th
                                            colSpan={3}
                                            className="border-b border-r border-slate-200 bg-slate-100 px-4 py-2.5 text-center font-semibold uppercase tracking-wider text-slate-600"
                                        >
                                            Pengeluaran
                                        </th>
                                        <th
                                            colSpan={3}
                                            className="border-b border-slate-200 bg-emerald-50 px-4 py-2.5 text-center font-semibold uppercase tracking-wider text-emerald-600"
                                        >
                                            Saldo Rekonsiliasi
                                        </th>
                                    </tr>

                                    <tr className="bg-slate-50">
                                        {['Bank', 'BKU', 'Selisih', 'Bank', 'BKU', 'Selisih', 'Bank', 'BKU', 'Selisih'].map((header, index) => (
                                            <th
                                                key={`${header}-${index}`}
                                                className={`border-b border-slate-200 px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-slate-400 ${
                                                    index === 2 || index === 5 ? 'border-r' : ''
                                                }`}
                                            >
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {rows.map((row, index) => {
                                        const warning =
                                            !isBalanced(row.selisih_penerimaan) ||
                                            !isBalanced(row.selisih_pengeluaran) ||
                                            !isBalanced(row.selisih_saldo);

                                        return (
                                            <tr
                                                key={`${row.tanggal}-${index}`}
                                                className={`transition hover:bg-slate-50 ${
                                                    warning ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-emerald-400'
                                                }`}
                                            >
                                                <td className="border-r border-slate-100 px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={route('kasda.pencocokan-harian.index', {
                                                                tanggal: row.tanggal,
                                                            })}
                                                            className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline"
                                                        >
                                                            {row.tanggal}
                                                            <ArrowRight size={11} aria-hidden="true" />
                                                        </Link>
                                                        <StatusBadge balanced={!warning} compact />
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{formatNumber(row.bank_penerimaan)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{formatNumber(row.bku_penerimaan)}</td>
                                                <td
                                                    className={`border-r border-slate-100 px-4 py-3 text-right font-mono font-bold ${
                                                        isBalanced(row.selisih_penerimaan) ? 'text-emerald-600' : 'text-amber-600'
                                                    }`}
                                                >
                                                    {formatNumber(row.selisih_penerimaan)}
                                                </td>

                                                <td className="px-4 py-3 text-right font-mono text-slate-600">
                                                    {formatNumber(row.bank_pengeluaran)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{formatNumber(row.bku_pengeluaran)}</td>
                                                <td
                                                    className={`border-r border-slate-100 px-4 py-3 text-right font-mono font-bold ${
                                                        isBalanced(row.selisih_pengeluaran) ? 'text-emerald-600' : 'text-amber-600'
                                                    }`}
                                                >
                                                    {formatNumber(row.selisih_pengeluaran)}
                                                </td>

                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{formatNumber(row.saldo_bank)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{formatNumber(row.saldo_bku)}</td>
                                                <td
                                                    className={`px-4 py-3 text-right font-mono font-bold ${
                                                        isBalanced(row.selisih_saldo) ? 'text-emerald-600' : 'text-amber-600'
                                                    }`}
                                                >
                                                    {formatNumber(row.selisih_saldo)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                <tfoot className="sticky bottom-0 z-10 border-t border-slate-200 bg-slate-100">
                                    <tr>
                                        <td className="border-r border-slate-200 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                            Total periode
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                                            {formatNumber(totalBankPenerimaan)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                                            {formatNumber(totalBkuPenerimaan)}
                                        </td>
                                        <td
                                            className={`border-r border-slate-200 px-4 py-3 text-right font-mono font-bold ${
                                                isBalanced(totalSelisihPenerimaan) ? 'text-emerald-600' : 'text-amber-600'
                                            }`}
                                        >
                                            {formatNumber(totalSelisihPenerimaan)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                                            {formatNumber(totalBankPengeluaran)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                                            {formatNumber(totalBkuPengeluaran)}
                                        </td>
                                        <td
                                            className={`border-r border-slate-200 px-4 py-3 text-right font-mono font-bold ${
                                                isBalanced(totalSelisihPengeluaran) ? 'text-emerald-600' : 'text-amber-600'
                                            }`}
                                        >
                                            {formatNumber(totalSelisihPengeluaran)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">{formatNumber(saldoAkhirBank)}</td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">{formatNumber(saldoAkhirBku)}</td>
                                        <td
                                            className={`px-4 py-3 text-right font-mono font-bold ${
                                                isBalanced(saldoAkhirSelisih) ? 'text-emerald-600' : 'text-amber-600'
                                            }`}
                                        >
                                            {formatNumber(saldoAkhirSelisih)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </TreaCard>
                )}
            </TreaPage>
        </>
    );
}
