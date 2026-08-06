import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Clock3, FileSpreadsheet, History, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

const money = (value) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

export default function Index({ title, history = [], realisasiHistory = [] }) {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [realisasiOpen, setRealisasiOpen] = useState(false);
    const fileInput = useRef(null);
    const realisasiFileInput = useRef(null);
    const form = useForm({ file_register_sp2d: null });
    const realisasiForm = useForm({ file_laporan_realisasi: null });

    const closeUpload = () => {
        if (form.processing) return;
        setUploadOpen(false);
        form.reset();
        form.clearErrors();
    };

    const closeRealisasi = () => {
        if (realisasiForm.processing) return;
        setRealisasiOpen(false);
        realisasiForm.reset();
        realisasiForm.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route('icsa.pengeluaran.import-data.register-sp2d.upload'), {
            forceFormData: true,
        });
    };

    const submitRealisasi = (event) => {
        event.preventDefault();
        realisasiForm.post(route('icsa.pengeluaran.import-data.laporan-realisasi.upload'), {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Import Data Pengeluaran"
                    subtitle="Pilih sumber data yang akan diunggah dan periksa hasilnya sebelum diaktifkan."
                />

                <section className="space-y-3">
                    <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Pilih jenis data</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setUploadOpen(true)}
                            className="hover:border-trea-primary/40 group flex min-h-44 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition"
                        >
                            <div>
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-trea-primary group-hover:bg-trea-primary group-hover:text-white">
                                    <FileSpreadsheet size={18} />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900">Register SP2D</h3>
                                <p className="mt-1.5 max-w-md text-xs leading-5 text-slate-500">
                                    Unggah snapshot lengkap Register SP2D bulanan berdasarkan Tanggal Pembuatan.
                                </p>
                            </div>
                            <span className="mt-4 inline-flex items-center justify-end gap-1 border-t border-slate-100 pt-3 text-xs font-semibold text-trea-primary">
                                Upload dan preview <ArrowRight size={13} />
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRealisasiOpen(true)}
                            className="hover:border-trea-primary/40 group flex min-h-44 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition"
                        >
                            <div>
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 group-hover:bg-violet-700 group-hover:text-white">
                                    <FileSpreadsheet size={18} />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900">Laporan Realisasi</h3>
                                <p className="mt-1.5 max-w-md text-xs leading-5 text-slate-500">
                                    Periode memakai Tanggal Transfer untuk SPP-LS dan Tanggal Dokumen untuk jenis lainnya.
                                </p>
                            </div>
                            <span className="mt-4 inline-flex items-center justify-end gap-1 border-t border-slate-100 pt-3 text-xs font-semibold text-violet-700">
                                Upload dan preview <ArrowRight size={13} />
                            </span>
                        </button>
                    </div>
                </section>

                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                        <History size={16} className="text-trea-primary" />
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Riwayat Register SP2D</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Dua belas import terkonfirmasi terbaru.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Periode</th>
                                    <th className="px-5 py-3">File</th>
                                    <th className="px-5 py-3 text-right">Baris</th>
                                    <th className="px-5 py-3 text-right">Total Netto</th>
                                    <th className="px-5 py-3">Pengunggah</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.length ? (
                                    history.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60">
                                            <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-800">
                                                {item.nama_bulan} {item.tahun}
                                            </td>
                                            <td className="max-w-xs truncate px-5 py-3 text-slate-600" title={item.nama_file_asli}>
                                                {item.nama_file_asli}
                                                <span className="mt-0.5 block text-[10px] text-slate-400">{item.confirmed_at}</span>
                                            </td>
                                            <td className="px-5 py-3 text-right font-mono">{item.jumlah_baris}</td>
                                            <td className="px-5 py-3 text-right font-mono font-semibold">{money(item.total_netto)}</td>
                                            <td className="px-5 py-3 text-slate-600">{item.importer || '—'}</td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                                        item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {item.is_active ? <CheckCircle2 size={11} /> : <Clock3 size={11} />}
                                                    {item.is_active ? 'Aktif' : 'Digantikan'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                            Belum ada Register SP2D yang diaktifkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TreaCard>

                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                        <History size={16} className="text-violet-700" />
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Riwayat Laporan Realisasi</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Dua belas import terkonfirmasi terbaru.</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Periode</th>
                                    <th className="px-5 py-3">File</th>
                                    <th className="px-5 py-3 text-right">Baris</th>
                                    <th className="px-5 py-3 text-right">Total Realisasi</th>
                                    <th className="px-5 py-3">Pengunggah</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {realisasiHistory.length ? (
                                    realisasiHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/60">
                                            <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-800">
                                                {item.nama_bulan} {item.tahun}
                                            </td>
                                            <td className="max-w-xs truncate px-5 py-3 text-slate-600" title={item.nama_file_asli}>
                                                {item.nama_file_asli}
                                                <span className="mt-0.5 block text-[10px] text-slate-400">{item.confirmed_at}</span>
                                            </td>
                                            <td className="px-5 py-3 text-right font-mono">{item.jumlah_baris}</td>
                                            <td className="px-5 py-3 text-right font-mono font-semibold">{money(item.total_realisasi)}</td>
                                            <td className="px-5 py-3 text-slate-600">{item.importer || '—'}</td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                                        item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {item.is_active ? <CheckCircle2 size={11} /> : <Clock3 size={11} />}
                                                    {item.is_active ? 'Aktif' : 'Digantikan'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                            Belum ada Laporan Realisasi yang diaktifkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TreaCard>
            </TreaPage>

            <TreaDialog
                open={uploadOpen}
                onClose={closeUpload}
                title="Upload Register SP2D"
                subtitle="Satu file harus berisi snapshot lengkap untuk satu bulan Tanggal Pembuatan."
                icon={UploadCloud}
                size="lg"
                loading={form.processing}
                loadingLabel="Membaca dan memvalidasi Excel..."
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton variant="secondary" size="sm" onClick={closeUpload}>
                            Batal
                        </TreaButton>
                        <TreaButton
                            type="submit"
                            form="upload-register-sp2d"
                            size="sm"
                            loading={form.processing}
                            loadingLabel="Memproses..."
                            disabled={!form.data.file_register_sp2d}
                        >
                            Upload & Preview
                        </TreaButton>
                    </div>
                }
            >
                <form id="upload-register-sp2d" onSubmit={submit}>
                    <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="hover:border-trea-primary/40 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:bg-slate-50"
                    >
                        <UploadCloud size={30} className="mb-2 text-slate-300" />
                        <span className="text-xs font-semibold text-trea-primary">Pilih file Excel</span>
                        <span className="mt-1 text-[11px] text-slate-400">Format .xls atau .xlsx, maksimal 20 MB</span>
                    </button>
                    <input
                        ref={fileInput}
                        type="file"
                        accept=".xls,.xlsx"
                        className="sr-only"
                        onChange={(event) => form.setData('file_register_sp2d', event.target.files?.[0] || null)}
                    />

                    {form.data.file_register_sp2d && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-trea-primary">
                            <FileSpreadsheet size={14} />
                            <span className="truncate font-semibold">{form.data.file_register_sp2d.name}</span>
                        </div>
                    )}

                    {form.errors.file_register_sp2d && (
                        <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
                            {form.errors.file_register_sp2d}
                        </p>
                    )}
                </form>
            </TreaDialog>

            <TreaDialog
                open={realisasiOpen}
                onClose={closeRealisasi}
                title="Upload Laporan Realisasi"
                subtitle="Satu file harus berisi snapshot lengkap untuk satu periode: Tanggal Transfer bagi SPP-LS, Tanggal Dokumen bagi jenis lainnya."
                icon={UploadCloud}
                size="lg"
                loading={realisasiForm.processing}
                loadingLabel="Membaca dan memvalidasi file besar. Proses ini dapat memerlukan beberapa menit..."
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton variant="secondary" size="sm" onClick={closeRealisasi}>
                            Batal
                        </TreaButton>
                        <TreaButton
                            type="submit"
                            form="upload-laporan-realisasi"
                            size="sm"
                            loading={realisasiForm.processing}
                            loadingLabel="Memproses..."
                            disabled={!realisasiForm.data.file_laporan_realisasi}
                        >
                            Upload & Preview
                        </TreaButton>
                    </div>
                }
            >
                <form id="upload-laporan-realisasi" onSubmit={submitRealisasi}>
                    <button
                        type="button"
                        onClick={() => realisasiFileInput.current?.click()}
                        className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center transition hover:border-violet-400 hover:bg-slate-50"
                    >
                        <UploadCloud size={30} className="mb-2 text-slate-300" />
                        <span className="text-xs font-semibold text-violet-700">Pilih file Excel</span>
                        <span className="mt-1 text-[11px] text-slate-400">Format .xls atau .xlsx, maksimal 100 MB</span>
                    </button>
                    <input
                        ref={realisasiFileInput}
                        type="file"
                        accept=".xls,.xlsx"
                        className="sr-only"
                        onChange={(event) => realisasiForm.setData('file_laporan_realisasi', event.target.files?.[0] || null)}
                    />
                    {realisasiForm.data.file_laporan_realisasi && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2.5 text-xs text-violet-700">
                            <FileSpreadsheet size={14} />
                            <span className="truncate font-semibold">{realisasiForm.data.file_laporan_realisasi.name}</span>
                        </div>
                    )}
                    {realisasiForm.errors.file_laporan_realisasi && (
                        <p className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
                            {realisasiForm.errors.file_laporan_realisasi}
                        </p>
                    )}
                </form>
            </TreaDialog>
        </>
    );
}
