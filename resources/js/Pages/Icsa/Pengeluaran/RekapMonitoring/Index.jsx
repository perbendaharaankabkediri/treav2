import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import TreaToolbar from '@/components/ui/TreaToolbar';
import { Head, useForm } from '@inertiajs/react';
import { BadgeCheck, Building2, CalendarDaysIcon, Scale, Search } from 'lucide-react';

const rupiah = (angka) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(angka);

function StatusBadge({ status }) {
    const map = {
        SUDAH: { tone: 'success', label: 'Sudah' },
        PROSES: { tone: 'warning', label: 'Proses' },
        BELUM: { tone: 'neutral', label: 'Belum' },
    };
    const s = map[status];
    if (!s) return null;
    return (
        <TreaBadge tone={s.tone} variant="outline" uppercase>
            {s.label}
        </TreaBadge>
    );
}

export default function RekapMonitoring({ title, dataRekap, listSkpd, bulanNama, summary, filters }) {
    const { data, setData, get, processing } = useForm({
        kode_skpd: filters.kode_skpd || 'all',
        bulan: filters.bulan || '',
        status: filters.status || 'all',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        get(route('icsa.pengeluaran.rekap-monitoring.index'), { preserveState: true });
    };

    const pctSudah = summary.total > 0 ? Math.round((summary.sudah / summary.total) * 100) : 0;
    const pctProses = summary.total > 0 ? Math.round((summary.proses / summary.total) * 100) : 0;
    const pctBelum = summary.total > 0 ? Math.round((summary.belum / summary.total) * 100) : 0;

    const totalKasSipd = dataRekap.reduce((sum, item) => sum + Number(item.kas_sipd), 0);
    const totalKasReal = dataRekap.reduce((sum, item) => sum + Number(item.kas_real), 0);
    const totalSelisih = dataRekap.reduce((sum, item) => sum + Number(item.selisih), 0);

    const cards = [
        { label: 'Total SKPD', value: summary.total, sub: null },
        { label: 'Sudah Rekon', value: summary.sudah, sub: `${pctSudah}%` },
        { label: 'Dalam Proses', value: summary.proses, sub: `${pctProses}%` },
        { label: 'Belum Rekon', value: summary.belum, sub: `${pctBelum}%` },
    ];

    return (
        <>
            <Head title={title} />

            <TreaPage size="wide" spacing="sm">
                <TreaPageHeader title="Monitoring Rekonsiliasi Kas" subtitle="Pantau progres dan kesesuaian saldo rekonsiliasi seluruh SKPD." />
                <TreaToolbar
                    as="form"
                    onSubmit={handleSubmit}
                    compact
                    className="px-3 py-2"
                    left={
                        <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_auto]">
                            <TreaDropdown
                                id="kode_skpd"
                                label="SKPD / Unit Kerja"
                                value={data.kode_skpd}
                                options={[{ kode_skpd: 'all', skpd: 'Semua SKPD' }, ...listSkpd]}
                                optionLabel="skpd"
                                optionValue="kode_skpd"
                                optionDescription="kode_skpd"
                                placeholder="Pilih SKPD"
                                icon={Building2}
                                onChange={(value) => setData('kode_skpd', value ?? 'all')}
                                filter
                                filterBy="kode_skpd,skpd"
                                filterPlaceholder="Cari kode atau nama SKPD"
                                emptyFilterMessage="SKPD tidak ditemukan"
                                showClear={false}
                                size="sm"
                                floatLabel
                            />
                            <TreaDropdown
                                id="bulan"
                                label="Bulan"
                                value={data.bulan}
                                options={Object.entries(bulanNama).map(([value, label]) => ({ value, label }))}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Pilih Bulan"
                                icon={CalendarDaysIcon}
                                onChange={(value) => setData('bulan', value ?? '')}
                                required
                                size="sm"
                                floatLabel
                            />
                            <TreaDropdown
                                id="status"
                                label="Status"
                                value={data.status}
                                options={[
                                    { value: 'all', label: 'Semua Status' },
                                    { value: 'sudah', label: 'Sudah Rekon' },
                                    { value: 'proses', label: 'Dalam Proses' },
                                    { value: 'belum', label: 'Belum Rekon' },
                                ]}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Pilih Status"
                                icon={BadgeCheck}
                                onChange={(value) => setData('status', value ?? 'all')}
                                size="sm"
                                floatLabel
                            />
                            <TreaButton type="submit" size="sm" icon={Search} loading={processing} loadingLabel="Memproses...">
                                Tampilkan Data
                            </TreaButton>
                        </div>
                    }
                />

                {/* ── Ringkasan ringkas ── */}
                {filters.bulan && (
                    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-4">
                        {cards.map(({ label, value, sub }, index) => (
                            <div
                                key={label}
                                className={`px-4 py-2.5 ${index < 2 ? 'border-b lg:border-b-0' : ''} ${
                                    index % 2 === 0 ? 'border-r' : index < 3 ? 'lg:border-r' : ''
                                } border-slate-100`}
                            >
                                <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</span>
                                <span className="mt-1 block font-mono text-sm font-semibold text-slate-700">
                                    {value}
                                    {sub && <span className="ml-1 text-[10px] font-normal text-slate-400">{sub}</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Table Card ── */}
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="max-h-[calc(100vh-225px)] overflow-auto">
                        <table className="w-full border-collapse text-xs">
                            <thead className="sticky top-0 z-20">
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="w-12 border-r border-slate-100 px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-500">
                                        No
                                    </th>
                                    <th className="border-r border-slate-100 px-5 py-3 text-left font-semibold uppercase tracking-wider text-slate-500">
                                        SKPD / Unit Kerja
                                    </th>
                                    <th className="border-r border-slate-100 px-5 py-3 text-right font-semibold uppercase tracking-wider text-slate-500">
                                        Saldo SIPD (A)
                                    </th>
                                    <th className="border-r border-slate-100 px-5 py-3 text-right font-semibold uppercase tracking-wider text-slate-500">
                                        Bank + Tunai (B)
                                    </th>
                                    <th className="w-40 border-r border-slate-100 px-5 py-3 text-right font-semibold uppercase tracking-wider text-slate-500">
                                        Selisih (A−B)
                                    </th>
                                    <th className="w-44 px-5 py-3 text-center font-semibold uppercase tracking-wider text-slate-500">Status Rekon</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dataRekap.length > 0 ? (
                                    dataRekap.map((row, index) => {
                                        const hasSelisih = row.selisih != 0;
                                        return (
                                            <tr key={row.kode_skpd} className="transition-colors hover:bg-slate-50/60">
                                                <td className="border-r border-slate-100 px-4 py-2.5 text-center text-slate-400">{index + 1}</td>
                                                <td className="border-r border-slate-100 px-5 py-2.5">
                                                    <span className="mb-0.5 block font-semibold leading-tight text-slate-700">{row.skpd}</span>
                                                    <span className="inline-block rounded border border-slate-200/60 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                                                        {row.kode_skpd}
                                                    </span>
                                                </td>
                                                <td className="border-r border-slate-100 px-5 py-2.5 text-right font-mono text-slate-600">
                                                    {rupiah(row.kas_sipd)}
                                                </td>
                                                <td className="border-r border-slate-100 px-5 py-2.5 text-right font-mono text-slate-600">
                                                    {rupiah(row.kas_real)}
                                                </td>
                                                <td
                                                    className={`border-r border-slate-100 px-5 py-2.5 text-right font-mono font-semibold ${
                                                        hasSelisih ? 'bg-amber-50/70 text-amber-700' : 'bg-emerald-50/70 text-emerald-700'
                                                    }`}
                                                >
                                                    {hasSelisih ? rupiah(row.selisih) : '✓ Balance'}
                                                </td>
                                                <td className="px-5 py-2.5 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <StatusBadge status={row.status_rekon} />
                                                        {row.selisih != 0 && row.status_rekon === 'SUDAH' && (
                                                            <span className="rounded border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
                                                                Ada Ket.
                                                            </span>
                                                        )}
                                                        {row.status_rekon === 'PROSES' && (
                                                            <span className="text-[10px] font-medium text-amber-600">
                                                                {[
                                                                    Math.abs(Number(row.selisih_bku ?? 0)) >= 0.01 && !row.keterangan_bku?.trim()
                                                                        ? 'Tab B'
                                                                        : null,
                                                                    Math.abs(Number(row.selisih ?? 0)) >= 0.01 && !row.keterangan?.trim()
                                                                        ? 'Tab C'
                                                                        : null,
                                                                ]
                                                                    .filter(Boolean)
                                                                    .join(' & ')}{' '}
                                                                belum tuntas
                                                            </span>
                                                        )}
                                                        {row.no_rekon && (
                                                            <span className="mt-0.5 block font-mono text-[9px] tracking-tight text-slate-400">
                                                                {row.no_rekon}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-slate-400">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                                                <Scale size={20} />
                                            </div>
                                            <p className="mt-3 text-xs font-semibold text-slate-500">Tidak ada data yang sesuai dengan filter.</p>
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Ubah SKPD, bulan, atau status untuk menampilkan hasil lain.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            {dataRekap.length > 0 && (
                                <tfoot className="border-t-2 border-slate-200 bg-slate-50/70 font-bold text-slate-700">
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="border-r border-slate-100 px-5 py-3 text-right uppercase tracking-wider text-slate-500"
                                        >
                                            Total {dataRekap.length} SKPD
                                        </td>
                                        <td className="border-r border-slate-100 px-5 py-3 text-right font-mono text-slate-800">
                                            {rupiah(totalKasSipd)}
                                        </td>
                                        <td className="border-r border-slate-100 px-5 py-3 text-right font-mono text-slate-800">
                                            {rupiah(totalKasReal)}
                                        </td>
                                        <td
                                            className={`border-r border-slate-100 px-5 py-3 text-right font-mono ${
                                                totalSelisih != 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                            }`}
                                        >
                                            {totalSelisih != 0 ? rupiah(totalSelisih) : '✓ Balance'}
                                        </td>
                                        <td className="bg-slate-100/50 px-5 py-3 text-center">
                                            <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                                                <span className="text-emerald-600">{summary.sudah}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-amber-600">{summary.proses}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-slate-400">{summary.belum}</span>
                                            </div>
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
