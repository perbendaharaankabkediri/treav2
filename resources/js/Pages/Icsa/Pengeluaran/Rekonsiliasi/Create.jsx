import TreaAlert from '@/components/ui/TreaAlert';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { useTreaToast } from '@/components/ui/TreaToast';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Building2, CalendarDays, CheckCircle2, Loader2, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

const DAFTAR_BULAN = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

function InfoCard({ icon: Icon, label, value, helper }) {
    return (
        <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600">
                <Icon size={14} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">{value || 'Belum dipilih'}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{helper}</p>
            </div>
        </div>
    );
}

export default function Create({ title, listSkpd = [], selectedSkpd = '' }) {
    const toast = useTreaToast();
    const { session } = usePage().props;
    const tahunAnggaran = session?.tahun || new Date().getFullYear();

    const { data, setData, post, processing, errors } = useForm({
        kode_skpd: selectedSkpd || '',
        bulan: '',
    });

    const selectedSkpdData = useMemo(() => listSkpd.find((item) => item.kode_skpd === data.kode_skpd) || null, [listSkpd, data.kode_skpd]);

    const selectedBulanData = useMemo(() => DAFTAR_BULAN.find((item) => String(item.value) === String(data.bulan)) || null, [data.bulan]);

    const isComplete = Boolean(data.kode_skpd && data.bulan);

    useEffect(() => {
        if (errors.error) toast.error(errors.error);
    }, [errors.error, toast]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!data.kode_skpd) {
            toast.warning('Silakan pilih SKPD terlebih dahulu.', {
                title: 'SKPD belum dipilih',
            });
            return;
        }

        if (!data.bulan) {
            toast.warning('Silakan pilih bulan rekonsiliasi.', {
                title: 'Bulan belum dipilih',
            });
            return;
        }

        Swal.fire({
            title: 'Simpan Rekonsiliasi?',
            html: `
                <div style="text-align:left;font-size:13px;line-height:1.7;color:#475569">
                    <div><strong>SKPD:</strong> ${selectedSkpdData?.kode_skpd || ''} — ${selectedSkpdData?.skpd || ''}</div>
                    <div><strong>Bulan:</strong> ${selectedBulanData?.label || ''}</div>
                    <div><strong>Tahun Anggaran:</strong> ${tahunAnggaran}</div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, simpan',
            cancelButtonText: 'Periksa kembali',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('icsa.pengeluaran.rekonsiliasi.store'));
            }
        });
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="medium">
                <TreaPageHeader title="Tambah Rekonsiliasi Kas" subtitle="Pilih SKPD dan periode untuk membuat lembar kerja rekonsiliasi baru." />
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-5 p-5 lg:grid-cols-[1.3fr_0.7fr]">
                            <div className="space-y-5">
                                <div>
                                    <div className="mb-3">
                                        <h2 className="text-sm font-semibold text-slate-800">Parameter Rekonsiliasi</h2>
                                        <p className="mt-0.5 text-xs leading-5 text-slate-400">
                                            Pilih SKPD dan bulan yang akan dibuatkan lembar kerja rekonsiliasi.
                                        </p>
                                    </div>

                                    <div className="grid gap-4">
                                        <div>
                                            <TreaDropdown
                                                id="kode_skpd"
                                                label="Satuan Kerja / SKPD"
                                                value={data.kode_skpd}
                                                options={listSkpd}
                                                optionLabel="skpd"
                                                optionValue="kode_skpd"
                                                optionDescription="kode_skpd"
                                                placeholder="Pilih Satuan Kerja / SKPD"
                                                icon={Building2}
                                                onChange={(value) => setData('kode_skpd', value ?? '')}
                                                error={errors.kode_skpd}
                                                disabled={Boolean(selectedSkpd)}
                                                filter
                                                filterBy="kode_skpd,skpd"
                                                filterPlaceholder="Cari kode atau nama SKPD"
                                                emptyMessage="Data SKPD belum tersedia"
                                                emptyFilterMessage="SKPD tidak ditemukan"
                                                showClear={!selectedSkpd}
                                                required
                                                floatLabel
                                            />

                                            {selectedSkpd && (
                                                <p className="mt-1.5 text-[11px] leading-4 text-slate-400">
                                                    SKPD mengikuti pilihan dari halaman daftar rekonsiliasi.
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <TreaDropdown
                                                    id="bulan"
                                                    label="Bulan Rekonsiliasi"
                                                    value={data.bulan}
                                                    options={DAFTAR_BULAN}
                                                    optionLabel="label"
                                                    optionValue="value"
                                                    placeholder="Pilih Bulan"
                                                    icon={CalendarDays}
                                                    onChange={(value) => setData('bulan', value ?? '')}
                                                    error={errors.bulan}
                                                    required
                                                    floatLabel
                                                />
                                            </div>

                                            <div>
                                                <TreaInput
                                                    id="tahun_anggaran"
                                                    name="tahun_anggaran"
                                                    label="Tahun Anggaran"
                                                    value={tahunAnggaran}
                                                    icon={CalendarDays}
                                                    helperText="Mengikuti tahun aktif pada sistem."
                                                    readOnly
                                                    floatLabel
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <TreaAlert tone="info" title="Setelah disimpan" compact>
                                    Sistem akan membuat nomor rekonsiliasi dan membuka lembar kerja pengisian SP2D, SPJ, STS, posisi kas, serta rekap
                                    selisih.
                                </TreaAlert>
                            </div>

                            <aside className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-800">Ringkasan Pilihan</h2>
                                    <p className="mt-0.5 text-xs text-slate-400">Periksa kembali sebelum menyimpan.</p>
                                </div>

                                <InfoCard
                                    icon={Building2}
                                    label="SKPD"
                                    value={selectedSkpdData ? `${selectedSkpdData.kode_skpd} — ${selectedSkpdData.skpd}` : ''}
                                    helper="Satuan kerja yang direkonsiliasi"
                                />

                                <InfoCard
                                    icon={CalendarDays}
                                    label="Periode"
                                    value={selectedBulanData ? `${selectedBulanData.label} ${tahunAnggaran}` : ''}
                                    helper="Bulan dan tahun rekonsiliasi"
                                />

                                <div
                                    className={`rounded-lg border px-3 py-2.5 ${
                                        isComplete ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400'
                                            }`}
                                        >
                                            {isComplete ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-semibold ${isComplete ? 'text-emerald-700' : 'text-slate-600'}`}>
                                                {isComplete ? 'Data siap disimpan' : 'Parameter belum lengkap'}
                                            </p>
                                            <p className={`mt-1 text-[11px] leading-4 ${isComplete ? 'text-emerald-600/80' : 'text-slate-400'}`}>
                                                {isComplete ? 'SKPD dan periode telah dipilih.' : 'Lengkapi seluruh kolom wajib terlebih dahulu.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[11px] text-slate-400">
                                <span className="text-rose-500">*</span> Wajib diisi
                            </p>

                            <div className="flex items-center gap-2">
                                <TreaButton
                                    href={route('icsa.pengeluaran.rekonsiliasi.index')}
                                    as={Link}
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1 sm:flex-none"
                                >
                                    <ArrowLeft size={13} />
                                    Kembali
                                </TreaButton>

                                <TreaButton type="submit" disabled={processing} size="sm" className="flex-1">
                                    {processing ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={13} />
                                            Simpan Rekonsiliasi
                                        </>
                                    )}
                                </TreaButton>
                            </div>
                        </div>
                    </form>
                </TreaCard>
            </TreaPage>
        </>
    );
}
