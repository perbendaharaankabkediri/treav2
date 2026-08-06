import TreaAlert from '@/components/ui/TreaAlert';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle2, FileSpreadsheet, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

const money = (value) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const statusStyle = {
    new: ['Baru', 'bg-blue-50 text-blue-700'],
    changed: ['Berubah', 'bg-amber-50 text-amber-700'],
    unchanged: ['Tetap', 'bg-slate-100 text-slate-500'],
};

function Summary({ label, value, tone = 'slate' }) {
    const tones = {
        blue: 'border-blue-100 bg-blue-50 text-blue-700',
        amber: 'border-amber-100 bg-amber-50 text-amber-700',
        emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
        rose: 'border-rose-100 bg-rose-50 text-rose-700',
        slate: 'border-slate-200 bg-white text-slate-700',
    };

    return (
        <div className={`rounded-xl border p-4 ${tones[tone]}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
        </div>
    );
}

export default function LaporanRealisasiPreview({ title, batch, rows }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const confirm = () => {
        setProcessing(true);
        router.post(route('icsa.pengeluaran.import-data.laporan-realisasi.confirm', batch.id), {}, { onFinish: () => setProcessing(false) });
    };

    const cancel = () => {
        if (cancelling || processing) return;
        if (!window.confirm('Batalkan preview ini? Data aktif sebelumnya tidak akan berubah.')) return;
        setCancelling(true);
        router.delete(route('icsa.pengeluaran.import-data.laporan-realisasi.cancel', batch.id), {
            onFinish: () => setCancelling(false),
        });
    };

    const openPage = (url) => {
        if (!url) return;
        router.visit(url, {
            preserveScroll: true,
            preserveState: true,
            only: ['rows'],
        });
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="full">
                <TreaPageHeader
                    title={`Preview Laporan Realisasi — ${batch.nama_bulan} ${batch.tahun}`}
                    subtitle="Periode SPP-LS berdasarkan Tanggal Transfer; jenis lainnya berdasarkan Tanggal Dokumen."
                    icon={FileSpreadsheet}
                    meta={
                        <>
                            <span>File: {batch.nama_file_asli}</span>
                            <span>{batch.jumlah_baris.toLocaleString('id-ID')} baris</span>
                        </>
                    }
                />

                {batch.has_active_batch && (
                    <TreaAlert tone="warning">
                        Periode ini sudah memiliki snapshot aktif. Konfirmasi akan menggantikannya secara otomatis tanpa menghapus riwayat lama.
                    </TreaAlert>
                )}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    <Summary label="Data baru" value={batch.jumlah_data_baru} tone="blue" />
                    <Summary label="Berubah" value={batch.jumlah_data_berubah} tone="amber" />
                    <Summary label="Tetap" value={batch.jumlah_data_tetap} tone="emerald" />
                    <Summary label="Tidak ada lagi" value={batch.jumlah_data_dihapus} tone="rose" />
                    <Summary label="Total baris" value={batch.jumlah_baris} />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <TreaCard className="p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Realisasi</p>
                        <p className="mt-1 font-mono text-sm font-bold text-violet-700">Rp{money(batch.total_realisasi)}</p>
                    </TreaCard>
                    <TreaCard className="p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Setoran</p>
                        <p className="mt-1 font-mono text-sm font-bold text-slate-800">Rp{money(batch.total_setoran)}</p>
                    </TreaCard>
                    <TreaCard className="p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total SP2D Unik</p>
                        <p className="mt-1 font-mono text-sm font-bold text-slate-800">Rp{money(batch.total_sp2d_unik)}</p>
                    </TreaCard>
                </div>

                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Rincian realisasi per rekening</h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Halaman {rows.current_page} dari {rows.last_page} · {rows.total.toLocaleString('id-ID')} baris
                            </p>
                        </div>
                    </div>
                    <div className="max-h-[580px] overflow-auto">
                        <table className="min-w-[1900px] text-xs">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-left uppercase tracking-wider text-slate-500 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3">Baris</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Tanggal Periode</th>
                                    <th className="px-4 py-3">Jenis</th>
                                    <th className="px-4 py-3">Nomor Dokumen</th>
                                    <th className="px-4 py-3">SKPD</th>
                                    <th className="px-4 py-3">Sub Kegiatan</th>
                                    <th className="px-4 py-3">Rekening</th>
                                    <th className="px-4 py-3 text-right">Realisasi</th>
                                    <th className="px-4 py-3 text-right">Setoran</th>
                                    <th className="px-4 py-3">Nomor SP2D</th>
                                    <th className="px-4 py-3 text-right">Nilai SP2D</th>
                                    <th className="px-4 py-3">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.data.map((row) => {
                                    const [label, classes] = statusStyle[row.comparison_status];
                                    return (
                                        <tr key={row.id} className="align-top hover:bg-slate-50/60">
                                            <td className="px-4 py-2 text-center text-slate-400">{row.nomor_baris}</td>
                                            <td className="px-4 py-2">
                                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${classes}`}>{label}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2">
                                                <span className="block">{row.tanggal_periode}</span>
                                                <span className="text-[10px] text-slate-400">{row.dasar_periode}</span>
                                            </td>
                                            <td className="px-4 py-2 font-semibold">
                                                {row.jenis_dokumen} · {row.jenis_transaksi}
                                            </td>
                                            <td className="max-w-xs px-4 py-2 font-mono text-[11px]">{row.nomor_dokumen}</td>
                                            <td className="max-w-xs px-4 py-2">
                                                <span className="block font-mono text-[10px] text-slate-400">{row.kode_skpd}</span>
                                                {row.nama_skpd}
                                            </td>
                                            <td className="max-w-sm px-4 py-2">
                                                <span className="block font-mono text-[10px] text-slate-400">{row.kode_sub_kegiatan}</span>
                                                {row.nama_sub_kegiatan}
                                            </td>
                                            <td className="max-w-sm px-4 py-2">
                                                <span className="block font-mono text-[10px] text-slate-400">{row.kode_rekening}</span>
                                                {row.nama_rekening}
                                            </td>
                                            <td
                                                className={`px-4 py-2 text-right font-mono font-semibold ${Number(row.nilai_realisasi) < 0 ? 'text-rose-600' : ''}`}
                                            >
                                                {money(row.nilai_realisasi)}
                                            </td>
                                            <td className="px-4 py-2 text-right font-mono">{money(row.nilai_setoran)}</td>
                                            <td className="max-w-xs px-4 py-2 font-mono text-[11px]">{row.nomor_sp2d || '—'}</td>
                                            <td className="px-4 py-2 text-right font-mono">{money(row.nilai_sp2d)}</td>
                                            <td className="max-w-md px-4 py-2 leading-5 text-slate-500">{row.keterangan_dokumen}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 border-t border-slate-100 px-4 py-3">
                        {rows.links.map((link, index) => (
                            <button
                                key={`${link.label}-${index}`}
                                type="button"
                                disabled={!link.url}
                                onClick={() => openPage(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`min-w-8 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${
                                    link.active
                                        ? 'border-violet-700 bg-violet-700 text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                } disabled:cursor-not-allowed disabled:opacity-40`}
                            />
                        ))}
                    </div>
                </TreaCard>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <TreaButton
                        variant="secondary"
                        onClick={cancel}
                        icon={Trash2}
                        loading={cancelling}
                        loadingLabel="Membatalkan..."
                        disabled={processing}
                    >
                        Batalkan Preview
                    </TreaButton>
                    <div className="flex gap-2">
                        <TreaButton variant="secondary" onClick={() => router.visit(route('icsa.pengeluaran.import-data.index'))} icon={ArrowLeft}>
                            Kembali
                        </TreaButton>
                        <TreaButton onClick={() => setConfirmOpen(true)} icon={Save} disabled={cancelling}>
                            Konfirmasi Import
                        </TreaButton>
                    </div>
                </div>
            </TreaPage>

            <TreaDialog
                open={confirmOpen}
                onClose={() => !processing && setConfirmOpen(false)}
                title="Aktifkan Laporan Realisasi"
                subtitle={`${batch.nama_bulan} ${batch.tahun} • ${batch.jumlah_baris.toLocaleString('id-ID')} baris`}
                icon={batch.has_active_batch ? RefreshCw : CheckCircle2}
                tone={batch.has_active_batch ? 'warning' : 'success'}
                loading={processing}
                loadingLabel="Mengaktifkan snapshot..."
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton variant="secondary" size="sm" onClick={() => setConfirmOpen(false)} disabled={processing}>
                            Periksa Kembali
                        </TreaButton>
                        <TreaButton size="sm" onClick={confirm} loading={processing} loadingLabel="Mengaktifkan...">
                            Ya, Aktifkan
                        </TreaButton>
                    </div>
                }
            >
                <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p>
                        {batch.has_active_batch
                            ? 'Snapshot aktif sebelumnya akan berstatus digantikan. Seluruh laporan periode ini selanjutnya membaca snapshot baru.'
                            : 'File ini akan menjadi snapshot aktif pertama untuk periode tersebut.'}
                    </p>
                </div>
            </TreaDialog>
        </>
    );
}
