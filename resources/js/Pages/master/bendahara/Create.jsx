import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Building2, IdCard, Info, Loader2, Save, UserRound } from 'lucide-react';

function Field({ label, required, error, hint, children }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {children}

            {hint && !error && <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p>}

            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>
    );
}

const inputClass = (error) =>
    `h-10 w-full rounded-lg border px-3 text-sm text-slate-700 outline-none transition ${
        error
            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
    } bg-white`;

export default function Create({ title, listSkpd = [], jenis = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        kode_skpd: '',
        nip: '',
        nama: '',
        jenis_bendahara: '',
        bidang_bendahara: '',
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route('bendahara.store'));
    };

    const handleJenisChange = (value) => {
        setData((current) => ({
            ...current,
            jenis_bendahara: value ?? '',
            bidang_bendahara: value !== '002' ? '' : current.bidang_bendahara,
        }));
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="form">
                <TreaPageHeader title="Tambah Bendahara" subtitle="Daftarkan bendahara baru beserta unit kerja dan jenis bendaharanya." />
                <TreaCard
                    variant="transparent"
                    padding="none"
                    className="max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-5 p-5">
                            <TreaCard
                                variant="transparent"
                                padding="none"
                                className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-700"
                            >
                                <Info size={15} className="mt-0.5 shrink-0" />

                                <p className="leading-relaxed">
                                    Bendahara Pengeluaran hanya dapat berjumlah satu orang per SKPD. Bendahara Pengeluaran Pembantu dapat ditambahkan
                                    sesuai kebutuhan bidang kerja.
                                </p>
                            </TreaCard>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <TreaDropdown
                                        id="kode_skpd"
                                        label="SKPD"
                                        value={data.kode_skpd}
                                        options={listSkpd}
                                        optionLabel="skpd"
                                        optionValue="kode_skpd"
                                        optionDescription="kode_skpd"
                                        placeholder="Pilih Satuan Kerja"
                                        icon={Building2}
                                        onChange={(value) => setData('kode_skpd', value ?? '')}
                                        error={errors.kode_skpd}
                                        filter
                                        filterBy="kode_skpd,skpd"
                                        filterPlaceholder="Cari kode atau nama SKPD"
                                        emptyMessage="Data SKPD belum tersedia"
                                        emptyFilterMessage="SKPD tidak ditemukan"
                                        showClear
                                        required
                                        floatLabel
                                    />
                                </div>

                                <TreaInput
                                    id="nip"
                                    name="nip"
                                    type="text"
                                    label="NIP Pegawai"
                                    value={data.nip}
                                    onChange={(value) => setData('nip', value.replace(/\D/g, '').slice(0, 18))}
                                    placeholder="18 digit NIP"
                                    icon={IdCard}
                                    inputMode="numeric"
                                    maxLength={18}
                                    helperText="Maksimal 18 digit NIP."
                                    error={errors.nip}
                                    required
                                    clearable
                                    floatLabel
                                />

                                <TreaInput
                                    id="nama"
                                    name="nama"
                                    type="text"
                                    label="Nama Lengkap"
                                    value={data.nama}
                                    onChange={(value) => setData('nama', value)}
                                    placeholder="Nama lengkap bendahara"
                                    icon={UserRound}
                                    autoComplete="name"
                                    error={errors.nama}
                                    required
                                    clearable
                                    floatLabel
                                />

                                <TreaDropdown
                                    id="jenis_bendahara"
                                    label="Jabatan / Jenis"
                                    value={data.jenis_bendahara}
                                    options={jenis}
                                    optionLabel="bendahara"
                                    optionValue="jenis_bendahara"
                                    placeholder="Pilih Jenis Jabatan"
                                    icon={BadgeCheck}
                                    onChange={handleJenisChange}
                                    error={errors.jenis_bendahara}
                                    emptyMessage="Jenis jabatan belum tersedia"
                                    showClear
                                    required
                                    floatLabel
                                />

                                {data.jenis_bendahara === '002' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <TreaInput
                                            id="bidang_bendahara"
                                            name="bidang_bendahara"
                                            type="text"
                                            label="Nama Bidang Kerja"
                                            value={data.bidang_bendahara}
                                            onChange={(value) => setData('bidang_bendahara', value)}
                                            placeholder="Contoh: Bidang Pengairan / Sekretariat"
                                            icon={BriefcaseBusiness}
                                            error={errors.bidang_bendahara}
                                            required
                                            clearable
                                            floatLabel
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs text-slate-400">
                                <span className="text-red-500">*</span> Wajib diisi
                            </span>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <TreaButton href={route('bendahara.index')} as={Link} variant="secondary">
                                    <ArrowLeft size={13} />
                                    Kembali
                                </TreaButton>

                                <TreaButton type="submit" disabled={processing}>
                                    {processing ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}

                                    {processing ? 'Menyimpan...' : 'Simpan Data'}
                                </TreaButton>
                            </div>
                        </div>
                    </form>
                </TreaCard>
            </TreaPage>
        </>
    );
}
