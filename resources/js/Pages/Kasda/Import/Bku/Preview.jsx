import TreaAlert from '@/components/ui/TreaAlert';
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

export default function Preview({ title, rows, path, originalName, bulan, namaBulan, tahun, hasPencocokanData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { loading: isDeletingBulan, run: runDeletePeriod } = useAsyncAction();
    const [hasPencocokan, setHasPencocokan] = useState(hasPencocokanData);
    const toast = useTreaToast();

    const { post, processing } = useForm({
        file_path: path,
        original_name: originalName,
    });

    const rupiah = (angka) => {
        if (!angka || isNaN(angka)) return '0,00';
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(angka);
    };

    const handleOpenModal = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handleConfirmStore = () => {
        setIsModalOpen(false);
        post(route('kasda.import.bku.store'));
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

    return (
        <>
            <Head title={title} />

            <TreaPage size="medium">
                <TreaPageHeader title="Preview Import BKU Pemda" subtitle="Periksa data hasil unggahan sebelum disimpan ke dalam sistem." />
                {/* Warning: sudah ada data rekonsiliasi di bulan ini */}
                {hasPencocokan && (
                    <TreaCard
                        variant="transparent"
                        padding="none"
                        className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800"
                    >
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <div className="flex-1 text-xs font-medium leading-relaxed">
                            <strong className="font-semibold">Data Rekonsiliasi Sudah Ada:</strong> Bulan{' '}
                            <span className="font-semibold text-slate-800">
                                {namaBulan} {tahun}
                            </span>{' '}
                            sudah memiliki data pencocokan harian. Import ulang BKU pada bulan ini <strong>tidak akan otomatis memperbarui</strong>{' '}
                            hasil rekonsiliasi yang sudah ada, dan berisiko membuatnya tidak valid (source_id lama bisa berubah/hilang). Disarankan
                            hapus dulu data rekonsiliasi bulan ini sebelum melanjutkan import, lalu proses ulang rekonsiliasi setelah data selesai
                            diupload.
                            <div className="mt-2.5">
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
                        </div>
                    </TreaCard>
                )}

                {/* Warning replace system */}
                <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-[#1E3A8A]">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <div className="text-xs font-medium leading-relaxed">
                        <strong className="font-semibold">Sistem Penggantian Otomatis (Replace System):</strong> Jika file bernama{' '}
                        <span className="font-semibold text-slate-800 underline">"{originalName}"</span> sudah pernah diunggah sebelumnya, menekan
                        tombol simpan akan menghapus seluruh rekaman data lama tersebut untuk menghindari duplikasi data.
                    </div>
                </div>

                {/* Tabel preview */}
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-tight text-slate-900">Pratinjau Data Dokumen</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Data di bawah ini merupakan struktur mentah dan belum disimpan ke database master
                            </p>
                        </div>
                        <div className="inline-flex items-center self-start rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-500 sm:self-center">
                            Berkas: {originalName}
                        </div>
                    </div>

                    <div className="max-h-[520px] overflow-x-auto overflow-y-auto">
                        <table className="min-w-full text-xs">
                            <thead className="sticky top-0 z-10 bg-slate-50/90 text-center font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0_rgba(226,232,240,1)] backdrop-blur-sm">
                                <tr>
                                    <th className="w-12 border-r border-slate-200/60 px-3 py-3 text-center">No</th>
                                    <th className="border-r border-slate-200/60 px-4 py-3 text-left">Tanggal</th>
                                    <th className="border-r border-slate-200/60 px-5 py-3 text-left">Nama SKPD</th>
                                    <th className="border-r border-slate-200/60 px-5 py-3 text-left">Sub SKPD</th>
                                    <th className="border-r border-slate-200/60 px-4 py-3 text-left">No. Bukti</th>
                                    <th className="border-r border-slate-200/60 px-4 py-3 text-left">Jenis Dok.</th>
                                    <th className="border-r border-slate-200/60 px-6 py-3 text-left">Uraian Transaksi</th>
                                    <th className="border-r border-slate-200/60 px-5 py-3 text-right">Penerimaan</th>
                                    <th className="border-r border-slate-200/60 px-5 py-3 text-right">Pengeluaran</th>
                                    <th className="px-5 py-3 text-right">Saldo Buku</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white font-mono text-[11px] text-slate-700">
                                {rows.length > 0 ? (
                                    rows.map((row, index) => (
                                        <tr key={index} className="transition-colors hover:bg-slate-50/60">
                                            <td className="border-r border-slate-100 px-3 py-2 text-center font-sans text-slate-400">{index + 1}</td>
                                            <td className="whitespace-nowrap border-r border-slate-100 px-4 py-2 text-left font-sans text-slate-600">
                                                {row[1] || ''}
                                            </td>
                                            <td className="max-w-xs truncate border-r border-slate-100 px-5 py-2 text-left font-sans" title={row[2]}>
                                                {row[2] || ''}
                                            </td>
                                            <td className="max-w-xs truncate border-r border-slate-100 px-5 py-2 text-left font-sans" title={row[3]}>
                                                {row[3] || ''}
                                            </td>
                                            <td className="whitespace-nowrap border-r border-slate-100 px-4 py-2 text-left font-sans font-medium text-slate-800">
                                                {row[4] || ''}
                                            </td>
                                            <td className="whitespace-nowrap border-r border-slate-100 px-4 py-2 text-left font-sans text-slate-500">
                                                {row[5] || ''}
                                            </td>
                                            <td
                                                className="whitespace-normal border-r border-slate-100 px-6 py-2 text-left font-sans text-slate-600"
                                                style={{ minWidth: '240px' }}
                                            >
                                                {row[6] || ''}
                                            </td>
                                            <td className="border-r border-slate-100 px-5 py-2 text-right font-semibold text-[#1E3A8A]">
                                                {rupiah(row[7])}
                                            </td>
                                            <td className="border-r border-slate-100 px-5 py-2 text-right font-semibold text-slate-600">
                                                {rupiah(row[8])}
                                            </td>
                                            <td className="bg-slate-50/40 px-5 py-2 text-right font-bold text-slate-900">{rupiah(row[9])}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="py-14 text-center font-sans text-slate-400">
                                            <Inbox size={24} className="mx-auto mb-2 text-slate-300" />
                                            Berkas kosong atau tidak memiliki struktur data baris yang valid.
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
                        <ArrowLeft size={13} /> Batal & Kembali
                    </TreaButton>

                    {/* Mengubah onSubmit form agar membuka modal terlebih dahulu */}
                    <form onSubmit={handleOpenModal}>
                        <TreaButton type="submit" disabled={processing || rows.length === 0}>
                            <Save size={13} />
                            {processing ? 'Menyimpan Data...' : 'Simpan ke Database'}
                        </TreaButton>
                    </form>
                </div>
            </TreaPage>

            {/* ==================== MODAL KONFIRMASI (TAILWIND CODES) ==================== */}
            <TreaDialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Konfirmasi Simpan Data"
                subtitle="Pastikan data pratinjau sudah benar sebelum disimpan."
                icon={AlertTriangle}
                tone="warning"
                size="md"
                footer={
                    <div className="flex items-center justify-end gap-2">
                        <TreaButton type="button" onClick={() => setIsModalOpen(false)} variant="secondary" size="sm">
                            Periksa Kembali
                        </TreaButton>
                        <TreaButton type="button" onClick={handleConfirmStore} size="sm">
                            Ya, Ganti & Simpan
                        </TreaButton>
                    </div>
                }
            >
                <p className="text-xs leading-5 text-trea-muted">
                    Dokumen ini menggunakan <strong className="font-semibold text-trea-heading">Replace System</strong>.
                </p>
                <TreaAlert tone="warning" compact className="mt-3">
                    Data lama dengan nama berkas <span className="font-bold text-trea-heading underline">"{originalName}"</span> akan dihapus
                    sepenuhnya dan digantikan dengan data pratinjau saat ini. Tindakan ini tidak dapat dibatalkan.
                </TreaAlert>
            </TreaDialog>
            {/* ========================================================================= */}
        </>
    );
}
