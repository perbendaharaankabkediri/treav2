import TreaAlert from '@/components/ui/TreaAlert';
import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaEmptyState from '@/components/ui/TreaEmptyState';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, BookOpen, CalendarDays, CheckCircle2, Inbox, Landmark, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';

const BULAN = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

const formatNumber = (value) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

const formatDate = (value) =>
    new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

function TransactionPanel({ source, rows, summary }) {
    const isBank = source === 'bank';

    return (
        <TreaCard variant="transparent" padding="none" className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        isBank ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                    }`}
                >
                    {isBank ? <Landmark size={17} /> : <BookOpen size={17} />}
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">{isBank ? 'Mutasi Bank' : 'BKU Pemda'}</h2>
                    <p className="mt-0.5 text-xs text-slate-400">{rows.length} transaksi belum cocok</p>
                </div>
                <TreaBadge tone="warning" className="ml-auto">
                    Unmatched
                </TreaBadge>
            </div>

            {rows.length === 0 ? (
                <TreaEmptyState
                    size="sm"
                    icon={CheckCircle2}
                    title={`Tidak ada unmatched di sisi ${isBank ? 'Bank' : 'BKU'}`}
                    description="Seluruh transaksi pada sisi ini sudah memiliki pasangan."
                />
            ) : (
                <>
                    <div className="max-h-[560px] overflow-auto">
                        <table className="w-full min-w-[620px] text-xs">
                            <thead className="sticky top-0 z-10 bg-slate-50">
                                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-400">
                                    <th className="px-4 py-3 text-left">Tanggal</th>
                                    <th className="px-4 py-3 text-center">Jenis</th>
                                    {!isBank && <th className="px-4 py-3 text-left">SKPD</th>}
                                    <th className="px-4 py-3 text-left">Keterangan</th>
                                    <th className="px-4 py-3 text-right">Nominal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row) => {
                                    const nominal = row.jenis === 'masuk' ? row.penerimaan : row.pengeluaran;

                                    return (
                                        <tr key={row.id} className="transition hover:bg-slate-50">
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <Link
                                                    href={route('kasda.pencocokan-harian.index', { tanggal: row.tanggal })}
                                                    className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:underline"
                                                >
                                                    {formatDate(row.tanggal)}
                                                    <ArrowRight size={11} />
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <TreaBadge tone={row.jenis === 'masuk' ? 'success' : 'warning'} size="xs">
                                                    {row.jenis === 'masuk' ? 'Masuk' : 'Keluar'}
                                                </TreaBadge>
                                            </td>
                                            {!isBank && (
                                                <td className="max-w-[150px] truncate px-4 py-3 text-slate-600" title={row.skpd}>
                                                    {row.skpd || '-'}
                                                </td>
                                            )}
                                            <td className="max-w-[220px] truncate px-4 py-3 text-slate-500" title={row.keterangan}>
                                                {row.keterangan || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-semibold text-slate-800">
                                                {formatNumber(nominal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-2 border-t border-slate-200 bg-slate-50">
                        <div className="border-r border-slate-200 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Masuk</p>
                            <p className="mt-1 font-mono text-xs font-semibold text-slate-700">{formatNumber(summary.penerimaan)}</p>
                        </div>
                        <div className="px-4 py-3">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Keluar</p>
                            <p className="mt-1 font-mono text-xs font-semibold text-slate-700">{formatNumber(summary.pengeluaran)}</p>
                        </div>
                    </div>
                </>
            )}
        </TreaCard>
    );
}

export default function TransaksiBelumCocok({ title, bankData = [], bkuData = [], summary, filters, isApplied = false, hasProcessedData = false }) {
    const [form, setForm] = useState({
        bulan: filters.bulan || '',
        tahun: filters.tahun || '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const totalUnmatched = bankData.length + bkuData.length;
    const selectedMonth = BULAN.find((item) => item.value === String(filters.bulan))?.label || 'Semua Bulan';

    const navigate = (params) => {
        router.get(route('kasda.transaksi-belum-cocok.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate({ ...form, applied: '1' });
    };

    const handleReset = () => {
        const reset = { bulan: '', tahun: filters.tahun };
        setForm(reset);
        navigate({});
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Transaksi Belum Cocok"
                    subtitle="Tinjau transaksi Bank dan BKU yang belum memperoleh pasangan setelah proses pencocokan."
                />

                <TreaAlert tone="info">
                    Data pada halaman ini hanya muncul setelah suatu tanggal diproses melalui Pencocokan Harian. Transaksi yang ditampilkan adalah
                    transaksi yang belum menemukan pasangan dan masih perlu ditindaklanjuti.
                </TreaAlert>

                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end">
                        <div className="w-full sm:w-52">
                            <TreaDropdown
                                id="bulan"
                                label="Bulan"
                                value={form.bulan}
                                options={[{ value: '', label: 'Semua Bulan' }, ...BULAN]}
                                optionLabel="label"
                                optionValue="value"
                                icon={CalendarDays}
                                onChange={(value) => setForm((current) => ({ ...current, bulan: value ?? '' }))}
                                size="sm"
                                floatLabel
                            />
                        </div>
                        <div className="w-full sm:w-32">
                            <TreaInput
                                id="tahun"
                                name="tahun"
                                type="number"
                                label="Tahun"
                                value={form.tahun}
                                onChange={(value) => setForm((current) => ({ ...current, tahun: value }))}
                                min={2020}
                                max={2100}
                                size="sm"
                                floatLabel
                            />
                        </div>
                        <TreaButton type="submit" icon={Search} size="sm" loading={isLoading} loadingLabel="Memuat...">
                            Tampilkan
                        </TreaButton>
                        <TreaButton
                            type="button"
                            icon={RotateCcw}
                            variant="secondary"
                            size="sm"
                            onClick={handleReset}
                            disabled={!isApplied || isLoading}
                        >
                            Reset
                        </TreaButton>
                    </form>
                </TreaCard>

                {!isApplied ? (
                    <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white">
                        <TreaEmptyState
                            icon={Inbox}
                            title="Pilih periode yang akan diperiksa"
                            description="Tentukan bulan dan tahun untuk melihat transaksi yang belum memperoleh pasangan."
                        />
                    </TreaCard>
                ) : !hasProcessedData ? (
                    <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white">
                        <TreaEmptyState
                            icon={CalendarDays}
                            title="Belum ada tanggal yang diproses"
                            description={`Belum ada hasil Pencocokan Harian untuk ${selectedMonth} ${filters.tahun}.`}
                        />
                    </TreaCard>
                ) : totalUnmatched === 0 ? (
                    <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-emerald-200 bg-emerald-50/40">
                        <TreaEmptyState
                            icon={CheckCircle2}
                            title="Semua transaksi sudah cocok"
                            description={`Tidak ada transaksi unmatched untuk ${selectedMonth} ${filters.tahun}.`}
                        />
                    </TreaCard>
                ) : (
                    <>
                        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center">
                            <AlertTriangle size={20} className="shrink-0 text-amber-600" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">{totalUnmatched} transaksi belum cocok</p>
                                <p className="mt-0.5 text-xs text-amber-700">
                                    {bankData.length} dari Bank dan {bkuData.length} dari BKU · {selectedMonth} {filters.tahun}
                                </p>
                            </div>
                            <TreaBadge tone="warning" className="sm:ml-auto">
                                Perlu ditindaklanjuti
                            </TreaBadge>
                        </div>

                        <div className="grid items-start gap-4 xl:grid-cols-2">
                            <TransactionPanel source="bank" rows={bankData} summary={summary.bank} />
                            <TransactionPanel source="bku" rows={bkuData} summary={summary.bku} />
                        </div>

                        <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 px-5 py-4">
                                <h2 className="text-sm font-semibold text-slate-800">Residual transaksi belum cocok</h2>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Perbedaan total unmatched Bank dan BKU. Nilai nol tidak berarti transaksi sudah memiliki pasangan.
                                </p>
                            </div>
                            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
                                {[
                                    ['Masuk', summary.selisih.penerimaan],
                                    ['Keluar', summary.selisih.pengeluaran],
                                ].map(([label, value]) => (
                                    <div key={label} className="bg-white px-5 py-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                                        <p
                                            className={`mt-2 font-mono text-sm font-bold ${Number(value) === 0 ? 'text-slate-700' : 'text-amber-700'}`}
                                        >
                                            {formatNumber(value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </TreaCard>
                    </>
                )}
            </TreaPage>
        </>
    );
}
