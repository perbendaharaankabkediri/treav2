import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { useTreaToast } from '@/components/ui/TreaToast';
import useAsyncAction from '@/hooks/useAsyncAction';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, ArrowLeft, Inbox, Loader2, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Preview({ title, rows, path, originalName, exists, bulan, namaBulan, tahun, hasPencocokanData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { loading: isDeletingBulan, run: runDeletePeriod } = useAsyncAction();
    const [hasPencocokan, setHasPencocokan] = useState(hasPencocokanData);
    const toast = useTreaToast();

    const { post, processing } = useForm({
        file_path: path,
        original_name: originalName,
    });

    const formatRupiah = (number) => {
        if (!number || isNaN(number)) return '0,00';
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);
    };

    const handleOpenModal = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handleConfirmSave = () => {
        setIsModalOpen(false);
        post(route('kasda.import.mutasi.store'));
    };

    const handleHapusBulan = async () => {
        if (isDeletingBulan) return;
        if (!confirm(`Hapus seluruh data rekonsiliasi bulan ${namaBulan} ${tahun}? Tindakan ini tidak dapat dibatalkan.`)) return;

        try {
            const res = await runDeletePeriod(() =>
                axios.post(route('kasda.pencocokan-harian.delete-periode'), {
                    bulan,
                    tahun,
                }),
            );
            if (!res) return;
            setHasPencocokan(false);
            toast.success(res.data?.message || 'Data rekonsiliasi bulan berhasil dihapus.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus data rekonsiliasi bulan.');
        }
    };

    const showWarningBanner = exists || hasPencocokan;

    return (
        <>
            <Head title={title} />

            <TreaPage size="medium">
                <TreaPageHeader title="Preview Import Mutasi Rekening" subtitle="Periksa data hasil unggahan sebelum disimpan ke dalam sistem." />
                {/* Banner gabungan: duplikat file &/atau data rekonsiliasi bulan sudah ada */}
                {showWarningBanner && (
                    <div
                        className={`flex items-start gap-2.5 rounded-xl border p-4 ${
                            hasPencocokan ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-blue-100 bg-blue-50 text-[#1E3A8A]'
                        }`}
                    >
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-2 text-xs font-medium leading-relaxed">
                            {exists && (
                                <p>
                                    <strong className="font-semibold">File Terdeteksi Duplikat:</strong> Berkas bernama{' '}
                                    <span className="font-semibold text-slate-800 underline">"{originalName}"</span> tercatat sudah pernah diunggah
                                    sebelumnya. Proses simpan akan melakukan <strong className="font-semibold">Overwriting (Replace)</strong> terhadap
                                    mutasi pada dokumen tersebut.
                                </p>
                            )}

                            {hasPencocokan && (
                                <p>
                                    <strong className="font-semibold">Data Rekonsiliasi Sudah Ada:</strong> Bulan{' '}
                                    <span className="font-semibold text-slate-800">
                                        {namaBulan} {tahun}
                                    </span>{' '}
                                    sudah memiliki data pencocokan harian. Import ulang mutasi pada bulan ini{' '}
                                    <strong>tidak akan otomatis memperbarui</strong> hasil rekonsiliasi yang sudah ada, dan berisiko membuatnya tidak
                                    valid (source_id lama bisa berubah/hilang). Disarankan hapus dulu data rekonsiliasi bulan ini sebelum melanjutkan
                                    import, lalu proses ulang rekonsiliasi setelah data selesai diupload.
                                </p>
                            )}

                            {hasPencocokan && (
                                <div className="pt-0.5">
                                    <button
                                        type="button"
                                        onClick={handleHapusBulan}
                                        disabled={isDeletingBulan}
                                        aria-busy={isDeletingBulan || undefined}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                                    >
                                        {isDeletingBulan ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                        {isDeletingBulan ? 'Menghapus...' : `Hapus Rekonsiliasi Bulan ${namaBulan}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabel preview */}
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-tight text-slate-900">Detail Isi Dokumen Mutasi Bank</p>
                            <p className="mt-0.5 text-xs text-slate-500">Periksa kembali kecocokan kolom saldo sebelum melakukan komit data</p>
                        </div>
                        <div className="inline-flex items-center self-start rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-500 sm:self-center">
                            Berkas: {originalName}
                        </div>
                    </div>

                    <div className="max-h-[520px] overflow-x-auto overflow-y-auto">
                        <table className="min-w-full text-xs">
                            <thead className="sticky top-0 z-10 bg-slate-50/90 text-center font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0_rgba(226,232,240,1)] backdrop-blur-sm">
                                <tr>
                                    <th className="border-r border-slate-200/60 px-4 py-3 text-left">Posting Date</th>
                                    <th className="border-r border-slate-200/60 px-4 py-3 text-left">Effective Date</th>
                                    <th className="border-r border-slate-200/60 px-4 py-3 text-left">Account</th>
                                    <th className="border-r border-slate-200/60 px-5 py-3 text-left">Name</th>
                                    <th className="border-r border-slate-200/60 px-6 py-3 text-left">Description</th>
                                    <th className="border-r border-slate-200/60 px-3 py-3 text-center">Curr</th>
                                    <th className="border-r border-slate-200/60 px-5 py-3 text-right">Debit</th>
                                    <th className="border-r border-slate-200/60 px-5 py-3 text-right">Credit</th>
                                    <th className="border-r border-slate-200/60 px-5 py-3 text-right">Balance</th>
                                    <th className="px-4 py-3 text-left">Reference No</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px] text-slate-700">
                                {rows.length > 0 ? (
                                    rows.map((row, index) => (
                                        <tr key={index} className="transition-colors hover:bg-slate-50/60">
                                            <td className="whitespace-nowrap border-r border-slate-100 px-4 py-2 text-left font-sans text-slate-600">
                                                {row.posting_date}
                                            </td>
                                            <td className="whitespace-nowrap border-r border-slate-100 px-4 py-2 text-left font-sans text-slate-500">
                                                {row.effective_date}
                                            </td>
                                            <td className="border-r border-slate-100 px-4 py-2 text-left font-medium text-slate-800">
                                                {row.account}
                                            </td>
                                            <td
                                                className="max-w-xs truncate border-r border-slate-100 px-5 py-2 text-left font-sans"
                                                title={row.name}
                                            >
                                                {row.name}
                                            </td>
                                            <td
                                                className="whitespace-normal border-r border-slate-100 px-6 py-2 text-left font-sans text-slate-600"
                                                style={{ minWidth: '220px' }}
                                            >
                                                {row.description}
                                            </td>
                                            <td className="border-r border-slate-100 px-3 py-2 text-center font-sans text-[10px] text-slate-400">
                                                {row.currency}
                                            </td>
                                            <td className="border-r border-slate-100 px-5 py-2 text-right font-semibold text-slate-600">
                                                {formatRupiah(row.debit)}
                                            </td>
                                            <td className="border-r border-slate-100 px-5 py-2 text-right font-semibold text-[#1E3A8A]">
                                                {formatRupiah(row.credit)}
                                            </td>
                                            <td className="border-r border-slate-100 bg-slate-50/30 px-5 py-2 text-right font-bold text-slate-900">
                                                {formatRupiah(row.balance)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 text-left font-sans text-slate-500">{row.reference_no}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="py-14 text-center font-sans text-slate-400">
                                            <Inbox size={24} className="mx-auto mb-2 text-slate-300" />
                                            Baris data mutasi tidak ditemukan atau kosong.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TreaCard>

                {/* Bottom action bar */}
                <div className="flex items-center justify-between pt-1">
                    <TreaButton href={route('kasda.import.index')} as={Link} variant="secondary">
                        <ArrowLeft size={13} /> Batalkan & Kembali
                    </TreaButton>

                    <form onSubmit={handleOpenModal}>
                        <TreaButton type="submit" disabled={processing || rows.length === 0}>
                            <Save size={13} />
                            {processing ? 'Menyimpan...' : 'Simpan Mutasi ke Database'}
                        </TreaButton>
                    </form>
                </div>
            </TreaPage>

            {/* ==================== LAYOUT MODAL DI SINI ==================== */}
            <TreaDialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Konfirmasi Simpan Mutasi"
                icon={AlertTriangle}
                tone={exists ? 'warning' : 'primary'}
                size="md"
                footer={
                    <div className="flex items-center justify-end gap-2">
                        <TreaButton type="button" onClick={() => setIsModalOpen(false)} variant="secondary" size="sm">
                            Kembali
                        </TreaButton>
                        <TreaButton type="button" onClick={handleConfirmSave} variant={exists ? 'warning' : 'primary'} size="sm">
                            {exists ? 'Ya, Ganti & Overwrite' : 'Ya, Commit Data'}
                        </TreaButton>
                    </div>
                }
            >
                <div className="space-y-3">
                    <p className="text-xs leading-5 text-trea-muted">
                        {exists
                            ? 'Perhatian! Berkas ini terdeteksi sudah ada di dalam database master.'
                            : 'Apakah Anda yakin ingin melakukan komit data dan mengunggah seluruh rekaman mutasi ini?'}
                    </p>

                    {exists ? (
                        <TreaCard
                            variant="transparent"
                            padding="none"
                            className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-[11px] font-medium leading-relaxed text-amber-800"
                        >
                            Sistem akan <strong className="font-bold">menghapus seluruh data mutasi lama</strong> yang berasal dari file bernama{' '}
                            <span className="font-bold text-slate-800 underline">"{originalName}"</span> untuk kemudian digantikan secara penuh.
                            Tindakan overwrite ini tidak dapat dibatalkan.
                        </TreaCard>
                    ) : (
                        <TreaCard
                            variant="transparent"
                            padding="none"
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500"
                        >
                            Pastikan baris data nominal (Debit/Kredit) dan nomor referensi berkas{' '}
                            <span className="font-mono font-semibold text-slate-700">"{originalName}"</span> sudah sesuai sebelum melanjutkan
                            penyimpanan.
                        </TreaCard>
                    )}

                    {hasPencocokan && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] font-medium leading-relaxed text-[#1E3A8A]">
                            Ingat: bulan{' '}
                            <strong>
                                {namaBulan} {tahun}
                            </strong>{' '}
                            sudah punya data rekonsiliasi. Import ini tidak memperbarui hasil rekonsiliasi yang sudah ada secara otomatis.
                        </div>
                    )}
                </div>
            </TreaDialog>
            {/* ============================================================= */}
        </>
    );
}
