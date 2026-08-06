import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaEmptyState from '@/components/ui/TreaEmptyState';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { treaChartTooltipStyle, treaColors } from '@/theme/treaTheme';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Banknote,
    Building2,
    CalendarDays,
    CheckCircle2,
    CircleAlert,
    CircleCheck,
    Clock3,
    FileCheck2,
    Landmark,
    ListTodo,
    RefreshCw,
    Scale,
    ShieldAlert,
    Sparkles,
    TrendingUp,
    UploadCloud,
    WalletCards,
} from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const money = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const compactMoney = (value) =>
    new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(Number(value ?? 0));

const number = (value) => new Intl.NumberFormat('id-ID').format(Number(value ?? 0));

const statusMeta = {
    SUDAH: { tone: 'success', label: 'Selesai' },
    PROSES: { tone: 'warning', label: 'Perlu tindak lanjut' },
    BELUM: { tone: 'danger', label: 'Belum' },
};

function MetricCard({ label, value, caption, icon: Icon, tone = 'primary', badge }) {
    const palette = {
        primary: 'bg-indigo-50 text-indigo-600',
        success: 'bg-emerald-50 text-emerald-600',
        warning: 'bg-amber-50 text-amber-600',
        danger: 'bg-rose-50 text-rose-600',
        info: 'bg-sky-50 text-sky-600',
    };

    return (
        <TreaCard padding="lg" className="h-full">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
                    <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-800">{value}</p>
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${palette[tone]}`}>
                    <Icon size={19} strokeWidth={1.8} />
                </div>
            </div>
            <div className="mt-4 flex min-h-5 items-center justify-between gap-2">
                <p className="text-[11px] leading-5 text-slate-400">{caption}</p>
                {badge}
            </div>
        </TreaCard>
    );
}

export function ProgressBar({ value }) {
    const numericValue = Number(value);
    const safe = Number.isFinite(numericValue) ? Math.max(0, Math.min(100, numericValue)) : 0;
    const displayValue = Math.round(safe);

    return (
        <div>
            <div className="mb-2 flex items-end justify-between">
                <span className="text-xs font-medium text-slate-500">Progress penyelesaian</span>
                <span className="text-2xl font-bold tracking-tight text-slate-800">{displayValue}%</span>
            </div>
            <div
                className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Progress penyelesaian ICSA"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={displayValue}
                aria-valuetext={`${displayValue} persen selesai`}
            >
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${safe}%` }} />
            </div>
        </div>
    );
}

function EmptyAttention() {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Sparkles size={22} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">Tidak ada selisih prioritas</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Seluruh rekonsiliasi yang tersedia sudah seimbang.</p>
        </div>
    );
}

export default function Dashboard({ filters, icsa, kasda, coverage, actions, rekonKasda }) {
    const isOperator = usePage().props.auth?.user?.role === 'operator';
    const changeMonth = (event) => {
        router.get(route('dashboard'), { bulan: event.target.value }, { preserveState: true, preserveScroll: true });
    };

    const positiveActions = actions.filter((item) => item.count > 0);
    const maxActionCount = Math.max(...actions.map((item) => item.count), 1);
    const toneDot = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500',
        info: 'bg-sky-500',
    };

    return (
        <>
            <Head title="Dashboard Treasury" />

            <TreaPage>
                <TreaPageHeader
                    title="Dashboard Treasury"
                    subtitle="Pusat kendali rekonsiliasi kas, kualitas pencocokan, dan tindak lanjut periode aktif."
                    eyebrow="Executive overview"
                    icon={Landmark}
                    badge={
                        <TreaBadge tone="primary" variant="outline">
                            T.A. {filters.tahun}
                        </TreaBadge>
                    }
                    meta={
                        <>
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={13} /> Data s.d. {filters.tanggalAkhir}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <RefreshCw size={13} /> Periode otomatis mengikuti data terbaru
                            </span>
                        </>
                    }
                    actions={
                        <label className="relative">
                            <span className="sr-only">Pilih bulan</span>
                            <select
                                value={filters.bulan}
                                onChange={changeMonth}
                                className="min-w-44 rounded-xl border-slate-200 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-slate-700 shadow-sm focus:border-indigo-400 focus:ring-indigo-100"
                            >
                                {months.map((month, index) => (
                                    <option key={month} value={index + 1}>
                                        {month} {filters.tahun}
                                    </option>
                                ))}
                            </select>
                        </label>
                    }
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Progress ICSA"
                        value={`${icsa.summary.progress}%`}
                        caption={`${number(icsa.summary.selesai)} dari ${number(icsa.summary.total)} SKPD selesai`}
                        icon={Building2}
                        tone="primary"
                    />
                    {!isOperator && (
                        <>
                            <MetricCard
                                label="Match Rate Kasda"
                                value={`${kasda.matching.rate}%`}
                                caption={`${number(kasda.matching.matched)} dari ${number(kasda.matching.total)} baris`}
                                icon={CheckCircle2}
                                tone="success"
                            />
                            <MetricCard
                                label="Transaksi Unmatched"
                                value={number(kasda.matching.unmatched)}
                                caption="Baris bank dan BKU yang perlu diperiksa"
                                icon={ShieldAlert}
                                tone={kasda.matching.unmatched > 0 ? 'warning' : 'success'}
                            />
                            <MetricCard
                                label="Selisih Saldo Kasda"
                                value={money(kasda.saldo.selisih)}
                                caption={`Posisi akhir ${filters.label}`}
                                icon={Scale}
                                tone={Number(kasda.saldo.selisih) === 0 ? 'success' : 'danger'}
                                badge={
                                    !kasda.saldo.saldoAwalTersedia && (
                                        <TreaBadge tone="danger" size="xs">
                                            Saldo awal belum ada
                                        </TreaBadge>
                                    )
                                }
                            />
                        </>
                    )}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
                    <TreaCard
                        title="Kesehatan Rekonsiliasi ICSA"
                        subtitle={`Status seluruh SKPD pada ${filters.label}.`}
                        icon={FileCheck2}
                        tone="primary"
                        actions={
                            <TreaButton
                                as={Link}
                                href={route('icsa.pengeluaran.rekap-monitoring.index', { bulan: filters.bulan })}
                                variant="ghost"
                                size="sm"
                                icon={ArrowRight}
                                iconPosition="end"
                            >
                                Buka monitoring
                            </TreaButton>
                        }
                        padding="lg"
                    >
                        <ProgressBar value={icsa.summary.progress} />

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                ['Seimbang', icsa.summary.seimbang, 'bg-emerald-50 text-emerald-700', CircleCheck],
                                ['Dijelaskan', icsa.summary.dijelaskan, 'bg-sky-50 text-sky-700', FileCheck2],
                                ['Proses', icsa.summary.proses, 'bg-amber-50 text-amber-700', Clock3],
                                ['Belum', icsa.summary.belum, 'bg-rose-50 text-rose-700', CircleAlert],
                            ].map(([label, value, color, Icon]) => (
                                <div key={label} className={`rounded-xl px-3 py-3 ${color}`}>
                                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
                                        <Icon size={13} /> {label}
                                    </div>
                                    <p className="mt-2 text-xl font-bold">{number(value)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                            {[
                                ['Kas SIPD', icsa.summary.kasSipd],
                                ['Kas riil', icsa.summary.kasRiil],
                                ['Selisih bersih', icsa.summary.selisih],
                            ].map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-[11px] text-slate-400">{label}</p>
                                    <p className="mt-1 truncate text-sm font-bold text-slate-700">{money(value)}</p>
                                </div>
                            ))}
                        </div>
                    </TreaCard>

                    <TreaCard
                        title="Perlu Tindakan"
                        subtitle="Prioritas yang dapat langsung ditindaklanjuti."
                        icon={ListTodo}
                        tone={positiveActions.length ? 'warning' : 'success'}
                        badge={
                            <TreaBadge tone={positiveActions.length ? 'warning' : 'success'} dot>
                                {positiveActions.length ? `${positiveActions.length} perhatian` : 'Semua aman'}
                            </TreaBadge>
                        }
                        padding="none"
                    >
                        <div className="divide-y divide-slate-100">
                            {actions.map((item) => (
                                <Link
                                    key={item.key}
                                    href={route(item.route, item.params)}
                                    className="group flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
                                >
                                    <span className={`h-2 w-2 shrink-0 rounded-full ${toneDot[item.tone]}`} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="truncate text-xs font-semibold text-slate-700">{item.label}</p>
                                            <span className="text-sm font-bold text-slate-700">{number(item.count)}</span>
                                        </div>
                                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className={`h-full rounded-full ${toneDot[item.tone]}`}
                                                style={{ width: `${Math.max(item.count ? 8 : 0, (item.count / maxActionCount) * 100)}%` }}
                                            />
                                        </div>
                                        <p className="mt-1.5 truncate text-[10px] text-slate-400">{item.description}</p>
                                    </div>
                                    <ArrowRight
                                        size={14}
                                        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
                                    />
                                </Link>
                            ))}
                        </div>
                    </TreaCard>
                </div>

                {!isOperator && (
                    <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
                        <TreaCard
                            title="Pergerakan Saldo Kasda"
                            subtitle="Saldo berjalan bank dan BKU pada periode terpilih."
                            icon={TrendingUp}
                            tone="info"
                            actions={
                                <TreaButton
                                    as={Link}
                                    href={route('kasda.monitoring-periode.index', {
                                        tgl_awal: `${filters.tahun}-${String(filters.bulan).padStart(2, '0')}-01`,
                                        tgl_akhir: filters.tanggalAkhir,
                                    })}
                                    variant="ghost"
                                    size="sm"
                                >
                                    Detail periode
                                </TreaButton>
                            }
                            padding="sm"
                        >
                            <div className="h-[310px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={kasda.trend} margin={{ top: 15, right: 16, left: 4, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={treaColors.chart.grid} />
                                        <XAxis
                                            dataKey="tanggal"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: treaColors.chart.axis, fontSize: 10 }}
                                            minTickGap={24}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            width={58}
                                            tick={{ fill: treaColors.chart.axis, fontSize: 10 }}
                                            tickFormatter={compactMoney}
                                        />
                                        <Tooltip contentStyle={treaChartTooltipStyle} formatter={(value) => money(value)} />
                                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                                        <Line
                                            type="monotone"
                                            dataKey="bank"
                                            name="Saldo Bank"
                                            stroke={treaColors.chart.primary}
                                            strokeWidth={2.4}
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="bku"
                                            name="Saldo BKU"
                                            stroke={treaColors.chart.teal}
                                            strokeWidth={2.4}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </TreaCard>

                        <TreaCard
                            title="Posisi Saldo"
                            subtitle={`Akumulasi sampai ${filters.tanggalAkhir}.`}
                            icon={WalletCards}
                            tone="primary"
                            padding="lg"
                        >
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/80 p-5 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-500">Saldo bank</p>
                                    <p className="mt-2 truncate text-xl font-bold text-slate-800">{money(kasda.saldo.bank)}</p>
                                    <div className="mt-5 flex items-center justify-between border-t border-indigo-100 pt-4">
                                        <span className="text-xs text-slate-500">Saldo BKU</span>
                                        <span className="text-sm font-semibold text-slate-700">{money(kasda.saldo.bku)}</span>
                                    </div>
                                </div>
                                <div
                                    className={`rounded-xl border p-4 ${Number(kasda.saldo.selisih) === 0 ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Selisih posisi</p>
                                            <p className="mt-1 text-base font-bold text-slate-800">{money(kasda.saldo.selisih)}</p>
                                        </div>
                                        <Scale size={21} className={Number(kasda.saldo.selisih) === 0 ? 'text-emerald-600' : 'text-rose-600'} />
                                    </div>
                                </div>
                            </div>
                        </TreaCard>
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-2">
                    <TreaCard
                        title="Selisih ICSA Prioritas"
                        subtitle="Diurutkan berdasarkan nilai absolut selisih terbesar."
                        icon={ShieldAlert}
                        tone="warning"
                        padding="none"
                        overflow="hidden"
                    >
                        {icsa.attention.length === 0 ? (
                            <EmptyAttention />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                        <tr>
                                            <th className="px-5 py-3">SKPD</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Selisih</th>
                                            <th className="w-10 px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {icsa.attention.map((item) => (
                                            <tr key={item.kodeSkpd} className="transition hover:bg-slate-50">
                                                <td className="max-w-60 px-5 py-3">
                                                    <p className="truncate text-xs font-semibold text-slate-700">{item.skpd}</p>
                                                    <p className="mt-1 text-[10px] text-slate-400">{item.kodeSkpd}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <TreaBadge tone={statusMeta[item.status].tone} size="xs">
                                                        {statusMeta[item.status].label}
                                                    </TreaBadge>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-bold text-slate-700">
                                                    {money(item.selisih)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.noRekon && (
                                                        <Link
                                                            href={route(
                                                                isOperator
                                                                    ? 'icsa.pengeluaran.rekonsiliasi.cetak'
                                                                    : 'icsa.pengeluaran.rekonsiliasi.edit',
                                                                item.noRekon,
                                                            )}
                                                            className="text-slate-300 transition hover:text-indigo-600"
                                                        >
                                                            <ArrowRight size={15} />
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TreaCard>

                    {!isOperator && (
                        <TreaCard
                            title="Komposisi Belum Cocok"
                            subtitle="Jumlah dan nominal transaksi unmatched per sumber."
                            icon={Activity}
                            tone="warning"
                            actions={
                                <TreaButton
                                    as={Link}
                                    href={route('kasda.transaksi-belum-cocok.index', {
                                        applied: 1,
                                        bulan: filters.bulan,
                                        tahun: filters.tahun,
                                    })}
                                    variant="ghost"
                                    size="sm"
                                >
                                    Lihat transaksi
                                </TreaButton>
                            }
                            padding="lg"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    ['Bank masuk', kasda.unmatched.bank_masuk, Landmark, 'bg-indigo-50 text-indigo-600'],
                                    ['BKU masuk', kasda.unmatched.bku_masuk, Banknote, 'bg-emerald-50 text-emerald-600'],
                                    ['Bank keluar', kasda.unmatched.bank_keluar, Landmark, 'bg-violet-50 text-violet-600'],
                                    ['BKU keluar', kasda.unmatched.bku_keluar, Banknote, 'bg-amber-50 text-amber-600'],
                                ].map(([label, data, Icon, color]) => (
                                    <div key={label} className="rounded-xl border border-slate-100 p-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-medium text-slate-500">{label}</p>
                                                <p className="mt-0.5 text-base font-bold text-slate-800">{number(data.jumlah)} baris</p>
                                            </div>
                                        </div>
                                        <p className="mt-3 truncate border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
                                            {money(data.nominal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </TreaCard>
                    )}
                </div>

                {!isOperator && (
                    <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
                        <TreaCard
                            title="Kesiapan Data Kasda"
                            subtitle="Cakupan impor dan proses pencocokan pada periode aktif."
                            icon={UploadCloud}
                            tone="info"
                            padding="lg"
                        >
                            <div className="grid gap-3 sm:grid-cols-3">
                                {[
                                    ['BKU terakhir', coverage.latestBku ?? 'Belum ada', Banknote],
                                    ['Bank terakhir', coverage.latestBank ?? 'Belum ada', Landmark],
                                    ['Proses terakhir', coverage.latestProcessed ?? 'Belum ada', RefreshCw],
                                ].map(([label, value, Icon]) => (
                                    <div key={label} className="rounded-xl bg-slate-50 p-3.5">
                                        <Icon size={16} className="text-slate-400" />
                                        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                                        <p className="mt-1 text-xs font-bold text-slate-700">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3">
                                <div>
                                    <p className="text-xs font-semibold text-slate-700">
                                        {coverage.hariDiproses} dari {coverage.hariDenganData} hari sudah diproses
                                    </p>
                                    <p className="mt-1 text-[10px] text-slate-400">Dihitung hanya untuk hari yang memiliki data sumber.</p>
                                </div>
                                <TreaBadge tone={coverage.hariBelumDiproses ? 'warning' : 'success'} dot>
                                    {coverage.hariBelumDiproses} hari tertunda
                                </TreaBadge>
                            </div>
                        </TreaCard>

                        <TreaCard
                            title="Berita Acara Kasda Terakhir"
                            subtitle="Dokumen rekonsiliasi bank paling mutakhir pada tahun aktif."
                            icon={FileCheck2}
                            tone="primary"
                            padding="lg"
                        >
                            {!rekonKasda ? (
                                <TreaEmptyState
                                    size="sm"
                                    icon={FileCheck2}
                                    title="Belum ada berita acara"
                                    description="Dokumen akan tampil setelah rekonsiliasi Kasda dibuat."
                                />
                            ) : (
                                <>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Periode</p>
                                            <p className="mt-1 text-lg font-bold text-slate-800">{rekonKasda.periode}</p>
                                        </div>
                                        <TreaBadge tone={Number(rekonKasda.selisih) === 0 ? 'success' : 'warning'} dot>
                                            {Number(rekonKasda.selisih) === 0 ? 'Seimbang' : 'Ada selisih'}
                                        </TreaBadge>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-[10px] text-slate-400">Saldo buku</p>
                                            <p className="mt-1 truncate text-xs font-bold text-slate-700">{money(rekonKasda.saldoBuku)}</p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 p-3">
                                            <p className="text-[10px] text-slate-400">Saldo bank</p>
                                            <p className="mt-1 truncate text-xs font-bold text-slate-700">{money(rekonKasda.saldoBank)}</p>
                                        </div>
                                    </div>
                                    <TreaButton
                                        as={Link}
                                        href={route('kasda.rekon.show', rekonKasda.id)}
                                        variant="secondary"
                                        size="sm"
                                        className="mt-4 w-full justify-center"
                                        icon={ArrowRight}
                                        iconPosition="end"
                                    >
                                        Lihat berita acara
                                    </TreaButton>
                                </>
                            )}
                        </TreaCard>
                    </div>
                )}
            </TreaPage>
        </>
    );
}
