import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, BookOpen, CalendarDays, CheckCircle2, Clock3, Hash, Landmark, Printer, Scale } from 'lucide-react';

const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value ?? 0);

const formatTanggalPanjang = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTanggalJam = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const tanggal = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${tanggal}, ${jam}`;
};

export default function Detail({ rekon }) {
    const totalPenjelasan = (rekon.details ?? []).reduce((sum, detail) => sum + Number(detail.nominal ?? 0), 0);
    const isBalance = rekon.selisih == 0;
    const tahunAnggaran = rekon.periode_rekon ? new Date(`${rekon.periode_rekon}T00:00:00`).getFullYear() : '-';

    return (
        <>
            <Head title="Detail Berita Acara Rekon" />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Detail Berita Acara Rekonsiliasi"
                    subtitle="Tinjau hasil, rincian selisih, dan status berita acara."
                    meta={
                        <span>
                            Tahun anggaran {tahunAnggaran} &mdash; periode {formatTanggalPanjang(rekon.periode_rekon)}
                        </span>
                    }
                    badge={
                        <TreaBadge tone={isBalance ? 'success' : 'warning'} icon={isBalance ? CheckCircle2 : AlertTriangle}>
                            {isBalance ? 'Balance' : 'Terdapat Selisih'}
                        </TreaBadge>
                    }
                    actions={
                        <>
                            <TreaButton href={route('kasda.rekon.print', rekon.id)} as="a" target="_blank" rel="noopener noreferrer" icon={Printer}>
                                Cetak PDF
                            </TreaButton>
                            <TreaButton href={route('kasda.rekon.index')} as={Link} variant="secondary" icon={ArrowLeft}>
                                Kembali
                            </TreaButton>
                        </>
                    }
                />
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="space-y-6 px-5 py-5">
                        {/* Ringkasan */}
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Periode Rekonsiliasi</p>
                                    <CalendarDays size={16} className="text-slate-400" />
                                </div>
                                <p className="mt-3 text-sm font-bold text-slate-800">{formatTanggalPanjang(rekon.periode_rekon)}</p>
                                <p className="mt-1 text-[11px] text-slate-400">Tahun anggaran {tahunAnggaran}</p>
                            </TreaCard>

                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Saldo Buku</p>
                                    <BookOpen size={16} className="text-slate-400" />
                                </div>
                                <p className="mt-3 truncate font-mono text-base font-bold text-slate-800">
                                    Rp {formatRupiah(rekon.saldo_buku_akhir)}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">BKU Pemda</p>
                            </TreaCard>

                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Saldo Bank</p>
                                    <Landmark size={16} className="text-slate-400" />
                                </div>
                                <p className="mt-3 truncate font-mono text-base font-bold text-slate-800">
                                    Rp {formatRupiah(rekon.saldo_bank_akhir)}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-400">Mutasi Rekening</p>
                            </TreaCard>

                            <div
                                className={`rounded-2xl border p-4 ${
                                    isBalance ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <p
                                        className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                            isBalance ? 'text-emerald-700' : 'text-amber-700'
                                        }`}
                                    >
                                        Selisih
                                    </p>
                                    <Scale size={16} className={isBalance ? 'text-emerald-700' : 'text-amber-700'} />
                                </div>
                                <p className={`mt-3 truncate font-mono text-base font-bold ${isBalance ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    Rp {formatRupiah(rekon.selisih)}
                                </p>
                                <p className={`mt-1 text-[11px] ${isBalance ? 'text-emerald-700/70' : 'text-amber-700/70'}`}>
                                    {isBalance ? 'Saldo telah sesuai' : 'Memerlukan penjelasan'}
                                </p>
                            </div>
                        </div>

                        {/* Tabel perbandingan saldo */}
                        <div>
                            <div className="mb-3">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Perbandingan Saldo Penutupan</h2>
                                <p className="mt-1 text-[11px] text-slate-400">Perbandingan nilai saldo buku dan saldo bank pada akhir periode.</p>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-slate-50/75">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-500">
                                                Keterangan Saldo Kas Umum Daerah
                                            </th>
                                            <th className="w-1/3 px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-slate-500">
                                                Nilai (Rp)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="px-4 py-2.5 text-slate-600">1. Menurut Buku (BKU Pemda)</td>
                                            <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                                                {formatRupiah(rekon.saldo_buku_akhir)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2.5 text-slate-600">2. Menurut Bank (Mutasi Rekening)</td>
                                            <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                                                {formatRupiah(rekon.saldo_bank_akhir)}
                                            </td>
                                        </tr>
                                        <tr className={isBalance ? 'bg-emerald-50' : 'bg-amber-50'}>
                                            <td className="px-4 py-2.5 font-semibold text-slate-700">Selisih</td>
                                            <td
                                                className={`px-4 py-2.5 text-right font-mono font-semibold ${isBalance ? 'text-emerald-700' : 'text-amber-700'}`}
                                            >
                                                {formatRupiah(rekon.selisih)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Detail penjelasan selisih */}
                        <div>
                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Penjelasan Rinci Selisih</h2>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Rincian item yang menjelaskan nilai selisih pada periode rekonsiliasi.
                                    </p>
                                </div>
                                <TreaBadge className="self-start sm:self-auto">
                                    <Hash size={11} />
                                    {(rekon.details ?? []).length} item
                                </TreaBadge>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-slate-50/75">
                                        <tr>
                                            <th className="w-12 px-4 py-2.5 text-center font-semibold uppercase tracking-wider text-slate-500">No</th>
                                            <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-500">
                                                Keterangan Item Selisih
                                            </th>
                                            <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-500">
                                                No. Referensi (SP2D/STS)
                                            </th>
                                            <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-500">
                                                Tanggal Transaksi
                                            </th>
                                            <th className="w-1/4 px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-slate-500">
                                                Nominal (Rp)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {rekon.details && rekon.details.length > 0 ? (
                                            rekon.details.map((detail, key) => (
                                                <tr key={detail.id ?? key} className="transition-colors hover:bg-slate-50/60">
                                                    <td className="px-4 py-2.5 text-center text-slate-400">{key + 1}</td>
                                                    <td className="px-4 py-2.5 text-slate-700">{detail.keterangan_item}</td>
                                                    <td className="px-4 py-2.5 text-slate-500">{detail.nomor_referensi ?? '-'}</td>
                                                    <td className="px-4 py-2.5 text-slate-500">{formatTanggalPanjang(detail.tanggal_transaksi)}</td>
                                                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                                                        {formatRupiah(detail.nominal)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-10 text-center">
                                                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                                        <CheckCircle2 size={18} />
                                                    </div>
                                                    <p className="mt-3 text-xs font-semibold text-slate-600">Tidak ada rincian selisih</p>
                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        Rekonsiliasi ini tidak memerlukan item penjelasan tambahan.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-slate-200 bg-slate-50/75">
                                            <td colSpan={4} className="px-4 py-2.5 text-right font-semibold text-slate-600">
                                                Total Penjelasan Selisih
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                                                {formatRupiah(totalPenjelasan)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Footer info */}
                    <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                        <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={13} />
                            Disimpan pada {formatTanggalJam(rekon.created_at)} WIB
                        </span>
                        <span>
                            Total penjelasan: <strong className="font-mono font-semibold text-slate-600">Rp {formatRupiah(totalPenjelasan)}</strong>
                        </span>
                    </div>
                </TreaCard>
            </TreaPage>
        </>
    );
}
