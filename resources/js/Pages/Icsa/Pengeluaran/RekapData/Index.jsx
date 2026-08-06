import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import TreaToolbar from '@/components/ui/TreaToolbar';
import { Head, router } from '@inertiajs/react';
import { BarChart3, CalendarDaysIcon, FileSpreadsheet, Search } from 'lucide-react';
import { useState } from 'react';

const fmt = (value) => {
    if (!value || value === 0) return null;
    return new Intl.NumberFormat('id-ID').format(value);
};

function Num({ value, bold = false }) {
    const str = fmt(value);
    if (!str) return <span className="font-mono text-slate-300">-</span>;
    return <span className={`font-mono tabular-nums ${bold ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{str}</span>;
}

/* Empat kelompok kolom — tetap dibedakan via posisi/border, bukan hue lain */
const GROUPS = [
    { label: 'Realisasi SP2D', span: 5 },
    { label: 'Total SPJ', span: 5 },
    { label: 'STS', span: 1 },
    { label: 'Posisi Kas & Selisih', span: 4 },
];

const SUBCOLS = ['LS', 'UP/GU', 'TU', 'KKPD', 'Total', 'LS', 'UP/GU', 'TU', 'KKPD', 'Total', 'Total', 'Kas SIPD', 'Kas Bank', 'Kas Tunai', 'Selisih'];
const TOTAL_COLS_IDX = [4, 5, 10, 11, 15]; // kolom subtotal yang ditekankan

export default function RekapData({ title, dataRealisasi, grandTotal, bulanNama, filters }) {
    const [selectedBulan, setSelectedBulan] = useState(filters.bulan || '');

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(route('icsa.pengeluaran.rekap-data.index'), { bulan: selectedBulan }, { preserveState: true });
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="wide" spacing="sm">
                <TreaPageHeader title="Rekap Data ICSA" subtitle="Ringkasan SP2D, SPJ, STS, dan posisi kas seluruh SKPD." />
                <TreaToolbar
                    compact
                    className="px-3 py-2"
                    left={
                        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end">
                            <div className="w-full sm:w-56">
                                <TreaDropdown
                                    floatLabel
                                    id="selected_bulan"
                                    label="Bulan Periode"
                                    value={selectedBulan}
                                    options={Object.entries(bulanNama).map(([value, label]) => ({
                                        value,
                                        label,
                                    }))}
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Pilih Bulan Periode"
                                    icon={CalendarDaysIcon}
                                    onChange={(value) => setSelectedBulan(value ?? '')}
                                    showClear
                                    size="sm"
                                />
                            </div>

                            <TreaButton type="button" size="sm" icon={Search} onClick={handleFilterSubmit}>
                                Tampilkan Data
                            </TreaButton>

                            {/* {filters.bulan && (
                                <div className="flex h-9 items-center gap-2 text-[11px] text-slate-500">
                                    <span>{bulanNama[filters.bulan]}</span>
                                    {grandTotal && (
                                        <span
                                            className={
                                                Number(grandTotal.selisih || 0) === 0
                                                    ? 'font-semibold text-emerald-600'
                                                    : 'font-semibold text-amber-600'
                                            }
                                        >
                                            {Number(grandTotal.selisih || 0) === 0
                                                ? 'Balance'
                                                : `Selisih Rp ${new Intl.NumberFormat('id-ID').format(grandTotal.selisih)}`}
                                        </span>
                                    )}
                                </div>
                            )} */}
                        </div>
                    }
                    right={
                        filters.bulan && (
                            <TreaButton
                                as="a"
                                href={route('icsa.pengeluaran.rekap-data.export', {
                                    bulan: filters.bulan,
                                })}
                                variant="success"
                                size="sm"
                                icon={FileSpreadsheet}
                            >
                                Export Excel
                            </TreaButton>
                        )
                    }
                />

                <TreaCard variant="table" contentClassName="p-0">
                    <div className="max-h-[calc(100vh-190px)] overflow-auto">
                        <table className="w-full border-collapse text-[11px]" style={{ minWidth: '1450px' }}>
                            <thead className="sticky top-0 z-20 shadow-sm">
                                <tr className="border-b border-slate-200 bg-slate-100">
                                    <th
                                        rowSpan={2}
                                        className="sticky left-0 z-30 w-[45px] border-b border-slate-200 bg-slate-100 px-3 py-3 text-center font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        No
                                    </th>

                                    <th
                                        rowSpan={2}
                                        className="sticky left-[45px] z-30 min-w-[260px] border-b border-r border-slate-200 bg-slate-100 px-4 py-3 text-left font-bold uppercase tracking-wider text-slate-700"
                                    >
                                        Satuan Kerja (SKPD)
                                    </th>

                                    {GROUPS.map(({ label, span }) => (
                                        <th
                                            key={label}
                                            colSpan={span}
                                            className="border-b border-l border-slate-200 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-700"
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>

                                <tr className="border-b border-slate-200 bg-slate-50">
                                    {SUBCOLS.map((col, index) => (
                                        <th
                                            key={index}
                                            className={`whitespace-nowrap border-b border-slate-200 px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500 ${
                                                TOTAL_COLS_IDX.includes(index)
                                                    ? 'border-l border-slate-200 bg-slate-100/70 font-bold text-slate-700'
                                                    : 'border-l border-slate-100'
                                            }`}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 bg-white">
                                {dataRealisasi.length > 0 ? (
                                    dataRealisasi.map((row, index) => {
                                        const totalSp2d = (row.sp2d_ls || 0) + (row.sp2d_upgu || 0) + (row.sp2d_tu || 0) + (row.sp2d_gukkpd || 0);

                                        const totalSpj = (row.spj_ls || 0) + (row.spj_upgu || 0) + (row.spj_tu || 0) + (row.spj_gukkpd || 0);

                                        const selisih = row.selisih ?? 0;

                                        const isBalance = Number(selisih) === 0;

                                        return (
                                            <tr key={index} className="group transition-colors hover:bg-slate-50/60">
                                                <td className="sticky left-0 z-10 w-[45px] border-r border-slate-100 bg-white px-3 py-2.5 text-center font-medium text-slate-400 transition-colors group-hover:bg-slate-50/60">
                                                    {index + 1}
                                                </td>

                                                <td className="sticky left-[45px] z-10 border-r border-slate-200 bg-white px-4 py-2.5 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-slate-50/60">
                                                    <span className="mb-0.5 block font-mono text-[9px] tracking-tight text-slate-400">
                                                        {row.kode_skpd}
                                                    </span>

                                                    <span className="block font-semibold leading-tight text-slate-800">{row.nama_skpd}</span>
                                                </td>

                                                <td className="border-l border-slate-100 px-3 py-2.5 text-right">
                                                    <Num value={row.sp2d_ls} />
                                                </td>

                                                <td className="border-l border-slate-100 px-3 py-2.5 text-right">
                                                    <Num value={row.sp2d_upgu} />
                                                </td>

                                                <td className="border-l border-slate-100 px-3 py-2.5 text-right">
                                                    <Num value={row.sp2d_tu} />
                                                </td>

                                                <td className="border-l border-slate-100 px-3 py-2.5 text-right">
                                                    <Num value={row.sp2d_gukkpd} />
                                                </td>

                                                <td className="border-l border-slate-200 bg-slate-50/30 px-3 py-2.5 text-right group-hover:bg-transparent">
                                                    <Num value={totalSp2d} bold />
                                                </td>

                                                <td className="border-l border-slate-200 px-3 py-2.5 text-right">
                                                    <Num value={row.spj_ls} />
                                                </td>

                                                <td className="border-l border-slate-100 px-3 py-2.5 text-right">
                                                    <Num value={row.spj_upgu} />
                                                </td>

                                                <td className="border-l border-slate-100 px-3 py-2.5 text-right">
                                                    <Num value={row.spj_tu} />
                                                </td>

                                                <td className="border-l border-slate-100 px-3 py-2.5 text-right">
                                                    <Num value={row.spj_gukkpd} />
                                                </td>

                                                <td className="border-l border-slate-200 bg-slate-50/30 px-3 py-2.5 text-right group-hover:bg-transparent">
                                                    <Num value={totalSpj} bold />
                                                </td>

                                                <td className="border-l border-slate-200 bg-slate-50/30 px-3 py-2.5 text-right group-hover:bg-transparent">
                                                    <Num value={row.total_sts} bold />
                                                </td>

                                                <td className="border-l border-slate-200 px-3 py-2.5 text-right">
                                                    <Num value={row.kas_sipd} />
                                                </td>

                                                <td className="border-l border-slate-100 px-3 py-2.5 text-right">
                                                    <Num value={row.kas_bank} />
                                                </td>

                                                <td className="border-l border-slate-100 px-3 py-2.5 text-right">
                                                    <Num value={row.kas_tunai} />
                                                </td>

                                                <td
                                                    className={`border-l border-slate-200 px-3 py-2.5 text-right font-mono font-bold ${
                                                        isBalance ? 'bg-emerald-50/70 text-emerald-700' : 'bg-amber-50/70 text-amber-700'
                                                    }`}
                                                >
                                                    {isBalance ? '✓' : new Intl.NumberFormat('id-ID').format(selisih)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={17} className="bg-slate-50/30 py-20 text-center text-slate-400">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                                                <BarChart3 size={20} />
                                            </div>

                                            <p className="mt-3 text-xs font-semibold text-slate-500">
                                                {selectedBulan
                                                    ? 'Tidak terdapat data rekapitulasi realisasi pada bulan ini.'
                                                    : 'Pilih bulan periode untuk menampilkan rekap data.'}
                                            </p>

                                            <p className="mt-1 text-[11px] text-slate-400">Data akan ditampilkan per satuan kerja.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            {dataRealisasi.length > 0 && grandTotal && (
                                <tfoot>
                                    <tr className="sticky bottom-0 z-20 border-t border-slate-300 bg-slate-100 font-bold">
                                        <td
                                            colSpan={2}
                                            className="sticky left-0 z-30 border-r border-slate-200 bg-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                                        >
                                            Grand Total
                                        </td>

                                        {[0, 1, 2, 3].map((item) => (
                                            <td
                                                key={`sp2d-${item}`}
                                                className="border-l border-slate-200/60 px-3 py-3 text-right font-mono text-slate-400"
                                            >
                                                -
                                            </td>
                                        ))}

                                        <td className="border-l border-slate-300 bg-slate-200/50 px-3 py-3 text-right font-mono text-[11px] text-slate-900">
                                            {fmt(grandTotal.total_sp2d)}
                                        </td>

                                        {[0, 1, 2, 3].map((item) => (
                                            <td
                                                key={`spj-${item}`}
                                                className={`px-3 py-3 text-right font-mono text-slate-400 ${
                                                    item === 0 ? 'border-l border-slate-300' : 'border-l border-slate-200/60'
                                                }`}
                                            >
                                                -
                                            </td>
                                        ))}

                                        <td className="border-l border-slate-300 bg-slate-200/50 px-3 py-3 text-right font-mono text-[11px] text-slate-900">
                                            {fmt(grandTotal.total_spj)}
                                        </td>

                                        <td className="border-l border-slate-300 bg-slate-200/50 px-3 py-3 text-right font-mono text-[11px] text-slate-900">
                                            {fmt(grandTotal.total_sts)}
                                        </td>

                                        <td className="border-l border-slate-300 px-3 py-3 text-right font-mono text-slate-800">
                                            {fmt(grandTotal.kas_sipd)}
                                        </td>

                                        <td className="border-l border-slate-200/60 px-3 py-3 text-right font-mono text-slate-800">
                                            {fmt(grandTotal.kas_bank)}
                                        </td>

                                        <td className="border-l border-slate-200/60 px-3 py-3 text-right font-mono text-slate-800">
                                            {fmt(grandTotal.kas_tunai)}
                                        </td>

                                        <td
                                            className={`border-l border-slate-300 px-3 py-3 text-right font-mono text-[11px] font-bold ${
                                                Number(grandTotal.selisih || 0) === 0
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}
                                        >
                                            {Number(grandTotal.selisih || 0) !== 0
                                                ? new Intl.NumberFormat('id-ID').format(grandTotal.selisih)
                                                : '✓ Balance'}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </TreaCard>
            </TreaPage>
        </>
    );
}
