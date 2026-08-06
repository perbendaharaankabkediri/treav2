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

export default function RegisterSp2dPreview({ title, batch, rows = [], unmatchedSkpd = [] }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const confirm = () => {
        setProcessing(true);
        router.post(route('icsa.pengeluaran.import-data.register-sp2d.confirm', batch.id), {}, { onFinish: () => setProcessing(false) });
    };

    const cancel = () => {
        if (cancelling || processing) return;
        if (!window.confirm('Batalkan preview ini? Data aktif sebelumnya tidak akan berubah.')) return;
        setCancelling(true);
        router.delete(route('icsa.pengeluaran.import-data.register-sp2d.cancel', batch.id), {
            onFinish: () => setCancelling(false),
        });
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="full">
                <TreaPageHeader
                    title={`Preview Register SP2D — ${batch.nama_bulan} ${batch.tahun}`}
                    subtitle="Periksa perubahan sebelum menjadikan file ini sebagai snapshot aktif periode tersebut."
                    icon={FileSpreadsheet}
                    meta={
                        <>
                            <span>File: {batch.nama_file_asli}</span>
                            <span>{batch.jumlah_baris} baris</span>
                        </>
                    }
                />

                {batch.has_active_batch && (
                    <TreaAlert tone="warning">
                        Periode ini sudah memiliki snapshot aktif. Konfirmasi akan menonaktifkan snapshot lama dan mengaktifkan file baru secara
                        otomatis; riwayat lama tetap tersimpan.
                    </TreaAlert>
                )}

                {unmatchedSkpd.length > 0 && (
                    <TreaAlert tone="warning">
                        <strong>{unmatchedSkpd.length} nama SKPD belum cocok dengan master:</strong> {unmatchedSkpd.join(', ')}. Data tetap dapat
                        diimpor, tetapi kolom kode SKPD akan kosong.
                    </TreaAlert>
                )}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    <Summary label="Data baru" value={batch.jumlah_data_baru} tone="blue" />
                    <Summary label="Berubah" value={batch.jumlah_data_berubah} tone="amber" />
                    <Summary label="Tetap" value={batch.jumlah_data_tetap} tone="emerald" />
                    <Summary label="Tidak ada lagi" value={batch.jumlah_data_dihapus} tone="rose" />
                    <Summary label="Total baris baru" value={batch.jumlah_baris} />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <TreaCard className="p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Bruto</p>
                        <p className="mt-1 font-mono text-sm font-bold text-slate-800">Rp{money(batch.total_bruto)}</p>
                    </TreaCard>
                    <TreaCard className="p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Potongan</p>
                        <p className="mt-1 font-mono text-sm font-bold text-slate-800">Rp{money(batch.total_potongan)}</p>
                    </TreaCard>
                    <TreaCard className="p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Netto</p>
                        <p className="mt-1 font-mono text-sm font-bold text-trea-primary">Rp{money(batch.total_netto)}</p>
                    </TreaCard>
                </div>

                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-semibold text-slate-900">Data hasil pembacaan Excel</h2>
                        <p className="mt-0.5 text-xs text-slate-500">Status dibandingkan dengan snapshot aktif periode yang sama.</p>
                    </div>
                    <div className="max-h-[560px] overflow-auto">
                        <table className="min-w-[1600px] text-xs">
                            <thead className="sticky top-0 z-10 bg-slate-50 text-left uppercase tracking-wider text-slate-500 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3">No</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Tgl. Pembuatan</th>
                                    <th className="px-4 py-3">Tgl. Pencairan</th>
                                    <th className="px-4 py-3">Nomor SP2D</th>
                                    <th className="px-4 py-3">SKPD</th>
                                    <th className="px-4 py-3">Penerima</th>
                                    <th className="px-4 py-3">Jenis</th>
                                    <th className="px-4 py-3 text-right">Bruto</th>
                                    <th className="px-4 py-3 text-right">Potongan</th>
                                    <th className="px-4 py-3 text-right">Netto</th>
                                    <th className="px-4 py-3">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row) => {
                                    const [label, classes] = statusStyle[row.comparison_status];
                                    return (
                                        <tr key={row.id} className="align-top hover:bg-slate-50/60">
                                            <td className="px-4 py-2 text-center text-slate-400">{row.nomor_urut}</td>
                                            <td className="px-4 py-2">
                                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${classes}`}>{label}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2">{row.tanggal_pembuatan}</td>
                                            <td className="whitespace-nowrap px-4 py-2">{row.tanggal_pencairan}</td>
                                            <td className="max-w-xs px-4 py-2 font-mono text-[11px] font-semibold">{row.nomor_sp2d}</td>
                                            <td className="max-w-xs px-4 py-2">
                                                {row.nama_skpd}
                                                {!row.kode_skpd && <span className="mt-1 block text-[10px] text-amber-600">Belum terpetakan</span>}
                                            </td>
                                            <td className="max-w-xs px-4 py-2">{row.nama_penerima}</td>
                                            <td className="px-4 py-2 font-semibold">{row.jenis_sp2d}</td>
                                            <td className="px-4 py-2 text-right font-mono">{money(row.bruto)}</td>
                                            <td className="px-4 py-2 text-right font-mono">{money(row.potongan)}</td>
                                            <td className="px-4 py-2 text-right font-mono font-semibold">{money(row.netto)}</td>
                                            <td className="max-w-md px-4 py-2 leading-5 text-slate-500">{row.keterangan}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
                title="Aktifkan Register SP2D"
                subtitle={`${batch.nama_bulan} ${batch.tahun} • ${batch.jumlah_baris} baris`}
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
