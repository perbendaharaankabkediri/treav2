import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, IdCard, Info, Loader2, Save, UserRound } from 'lucide-react';

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

export default function Create({ title }) {
    const { tahun } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        tahun: tahun || '2026',
        nip: '',
        nama: '',
        jabatan: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('bud.store'));
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="form">
                <TreaPageHeader title="Tambah Pejabat BUD" subtitle="Registrasikan pejabat Bendahara Umum Daerah untuk tahun anggaran aktif." />
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
                                    Pastikan data NIP, nama lengkap, tahun anggaran, dan jabatan pejabat BUD telah sesuai dengan dokumen penetapan.
                                </p>
                            </TreaCard>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <TreaInput
                                    id="tahun"
                                    name="tahun"
                                    type="number"
                                    label="Tahun Anggaran"
                                    value={data.tahun}
                                    onChange={(value) => setData('tahun', value)}
                                    icon={CalendarDays}
                                    placeholder="Contoh: 2026"
                                    min={2000}
                                    max={2100}
                                    inputMode="numeric"
                                    error={errors.tahun}
                                    required
                                    floatLabel
                                />

                                <div className="sm:col-span-2">
                                    <TreaInput
                                        id="nip"
                                        name="nip"
                                        type="text"
                                        label="NIP Pejabat"
                                        value={data.nip}
                                        onChange={(value) => setData('nip', value.replace(/\D/g, '').slice(0, 20))}
                                        placeholder="Masukkan Nomor Induk Pegawai"
                                        icon={IdCard}
                                        inputMode="numeric"
                                        maxLength={20}
                                        helperText="Masukkan NIP sesuai dokumen kepegawaian."
                                        error={errors.nip}
                                        required
                                        clearable
                                        floatLabel
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <TreaInput
                                        id="nama"
                                        name="nama"
                                        type="text"
                                        label="Nama Lengkap Pejabat"
                                        value={data.nama}
                                        onChange={(value) => setData('nama', value)}
                                        placeholder="Nama lengkap beserta gelar"
                                        icon={UserRound}
                                        autoComplete="name"
                                        error={errors.nama}
                                        required
                                        clearable
                                        floatLabel
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <TreaInput
                                        id="jabatan"
                                        name="jabatan"
                                        type="text"
                                        label="Jabatan Pokok"
                                        value={data.jabatan}
                                        onChange={(value) => setData('jabatan', value)}
                                        placeholder="Contoh: Kuasa BUD Kabupaten"
                                        icon={BriefcaseBusiness}
                                        helperText="Field ini dapat dikosongkan bila belum ditetapkan."
                                        error={errors.jabatan}
                                        clearable
                                        floatLabel
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs text-slate-400">
                                <span className="text-red-500">*</span> Wajib diisi
                            </span>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <TreaButton href={route('bud.index')} as={Link} variant="secondary">
                                    <ArrowLeft size={13} />
                                    Kembali
                                </TreaButton>

                                <TreaButton type="submit" disabled={processing}>
                                    {processing ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}

                                    {processing ? 'Menyimpan...' : 'Simpan Pejabat'}
                                </TreaButton>
                            </div>
                        </div>
                    </form>
                </TreaCard>
            </TreaPage>
        </>
    );
}
