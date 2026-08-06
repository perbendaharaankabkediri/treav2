import TreaButton from '@/components/ui/TreaButton';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { useTreaToast } from '@/components/ui/TreaToast';
import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Banknote, FileSpreadsheet, Landmark, UploadCloud } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* ── MODAL UPLOAD — dipakai untuk BKU & Mutasi ── */
function UploadModal({
    open,
    onClose,
    title,
    description,
    icon: Icon,
    fieldName,
    formField,
    onSubmit,
    processing,
    fileValue,
    onFileChange,
    submitLabel,
}) {
    const fileInputRef = useRef(null);

    return (
        <TreaDialog
            open={open}
            onClose={onClose}
            title={title}
            subtitle={description}
            icon={Icon}
            size="lg"
            loading={processing}
            loadingLabel="Memproses berkas..."
            footer={
                <div className="flex justify-end gap-2">
                    <TreaButton type="button" onClick={onClose} variant="secondary" size="sm">
                        Batal
                    </TreaButton>
                    <TreaButton
                        type="submit"
                        form={`upload-${formField}`}
                        disabled={!fileValue}
                        loading={processing}
                        loadingLabel="Memproses..."
                        size="sm"
                    >
                        {submitLabel}
                    </TreaButton>
                </div>
            }
        >
            <form id={`upload-${formField}`} onSubmit={onSubmit}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">File Excel {fieldName}</label>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex cursor-pointer justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 pb-7 pt-6 transition-all duration-150 hover:border-[#1E3A8A]/50 hover:bg-slate-50/50"
                >
                    <div className="space-y-2 text-center">
                        <UploadCloud size={28} className="mx-auto text-slate-300 transition-colors group-hover:text-[#1E3A8A]/60" strokeWidth={1.5} />
                        <div className="text-xs text-slate-600">
                            <span className="font-semibold text-[#1E3A8A]">Pilih berkas excel</span>
                            <input ref={fileInputRef} type="file" accept=".xls,.xlsx" className="sr-only" onChange={onFileChange} required />
                        </div>
                        <p className="text-[11px] text-slate-400">Format yang didukung hanya dokumen .xls / .xlsx</p>
                    </div>
                </div>

                {fileValue && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-xs font-medium text-[#1E3A8A]">
                        <FileSpreadsheet size={14} className="shrink-0" />
                        <span>
                            Terpilih: <strong className="font-semibold">{fileValue.name}</strong>
                        </span>
                    </div>
                )}
            </form>
        </TreaDialog>
    );
}

export default function Index({ title }) {
    const toast = useTreaToast();
    const [modalOpen, setModalOpen] = useState(null); // null | 'bku' | 'mutasi'

    /* ── FUNGSI FORMAT RIBUAN (TITIK) & DESIMAL (KOMA) ── */
    /* Form upload BKU */
    const bkuForm = useForm({ file_bku: null });

    /* Form upload Mutasi */
    const mutasiForm = useForm({ file_mutasi: null });

    useEffect(() => {
        const error = bkuForm.errors.file_bku || mutasiForm.errors.file_mutasi;
        if (error) toast.error(error);
    }, [bkuForm.errors.file_bku, mutasiForm.errors.file_mutasi, toast]);

    const handleSubmitBku = (e) => {
        e.preventDefault();
        bkuForm.post(route('kasda.import.bku.preview'));
    };

    const handleSubmitMutasi = (e) => {
        e.preventDefault();
        mutasiForm.post(route('kasda.import.mutasi.preview'));
    };

    const closeModal = () => {
        setModalOpen(null);
        bkuForm.reset();
        mutasiForm.reset();
        bkuForm.clearErrors();
        mutasiForm.clearErrors();
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="medium">
                <TreaPageHeader title="Import Data Kasda" subtitle="Unggah data BKU Pemda dan mutasi rekening dari file Excel." />
                {/* Pilih Sumber Import */}
                <div className="space-y-3">
                    <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Pilih Sumber Import Data</h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Card Import BKU */}
                        <button
                            type="button"
                            onClick={() => setModalOpen('bku')}
                            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors duration-150 hover:border-[#1E3A8A]/40"
                        >
                            <div>
                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-[#1E3A8A]">
                                    <Landmark size={16} className="text-[#1E3A8A] transition-colors group-hover:text-white" />
                                </div>
                                <h3 className="mb-1.5 text-sm font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-[#1E3A8A]">
                                    Import BKU Pemda
                                </h3>
                                <p className="text-xs leading-relaxed text-slate-500">
                                    Unggah berkas Buku Kas Umum Pemerintah Daerah dari file Excel untuk disesuaikan dengan sistem kas daerah.
                                </p>
                            </div>
                            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] transition-all group-hover:gap-1.5">
                                    Buka Form Import <ArrowRight size={12} />
                                </span>
                            </div>
                        </button>

                        {/* Card Import Mutasi */}
                        <button
                            type="button"
                            onClick={() => setModalOpen('mutasi')}
                            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors duration-150 hover:border-[#1E3A8A]/40"
                        >
                            <div>
                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-[#1E3A8A]">
                                    <Banknote size={16} className="text-[#1E3A8A] transition-colors group-hover:text-white" />
                                </div>
                                <h3 className="mb-1.5 text-sm font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-[#1E3A8A]">
                                    Import Mutasi Rekening
                                </h3>
                                <p className="text-xs leading-relaxed text-slate-500">
                                    Unggah berkas mutasi rekening koran bank Kas Daerah guna kebutuhan pencocokan saldo harian dan bulanan.
                                </p>
                            </div>
                            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] transition-all group-hover:gap-1.5">
                                    Buka Form Import <ArrowRight size={12} />
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </TreaPage>

            {/* Modal Upload BKU */}
            <UploadModal
                open={modalOpen === 'bku'}
                onClose={closeModal}
                title="Upload File BKU Pemda"
                description="Validasi pra-import data Buku Kas Umum"
                icon={Landmark}
                fieldName="BKU Pemda"
                onSubmit={handleSubmitBku}
                processing={bkuForm.processing}
                fileValue={bkuForm.data.file_bku}
                onFileChange={(e) => bkuForm.setData('file_bku', e.target.files[0])}
                submitLabel="Upload & Preview"
            />

            {/* Modal Upload Mutasi */}
            <UploadModal
                open={modalOpen === 'mutasi'}
                onClose={closeModal}
                title="Upload File Mutasi Rekening"
                description="Pencocokan saldo harian dan bulanan"
                icon={Banknote}
                fieldName="Mutasi Rekening"
                onSubmit={handleSubmitMutasi}
                processing={mutasiForm.processing}
                fileValue={mutasiForm.data.file_mutasi}
                onFileChange={(e) => mutasiForm.setData('file_mutasi', e.target.files[0])}
                submitLabel="Upload & Preview"
            />
        </>
    );
}
