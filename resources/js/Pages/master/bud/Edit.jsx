import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, IdCard, Info, Save, UserRound } from 'lucide-react';

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

export default function Edit({ title, bud }) {
    const { data, setData, put, processing, errors } = useForm({
        tahun: bud.tahun || '',
        nip: bud.nip || '',
        nama: bud.nama || '',
        jabatan: bud.jabatan || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('bud.update', bud.id));
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="form">
                <TreaPageHeader title="Edit Pejabat BUD" subtitle="Perbarui informasi pejabat Bendahara Umum Daerah yang telah terdaftar." />
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
                                <Field label="Tahun Anggaran" required error={errors.tahun}>
                                    <div className="relative">
                                        <CalendarDays
                                            size={14}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            type="number"
                                            value={data.tahun}
                                            onChange={(e) => setData('tahun', e.target.value)}
                                            className={`${inputClass(errors.tahun)} pl-9`}
                                            required
                                        />
                                    </div>
                                </Field>

                                <div className="sm:col-span-2">
                                    <Field label="NIP Pejabat" required error={errors.nip} hint="Masukkan NIP sesuai dokumen kepegawaian.">
                                        <div className="relative">
                                            <IdCard
                                                size={14}
                                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                            <input
                                                type="text"
                                                maxLength={20}
                                                value={data.nip}
                                                onChange={(e) => setData('nip', e.target.value)}
                                                placeholder="Masukkan Nomor Induk Pegawai"
                                                className={`${inputClass(errors.nip)} pl-9`}
                                                required
                                            />
                                        </div>
                                    </Field>
                                </div>

                                <div className="sm:col-span-3">
                                    <Field label="Nama Lengkap Pejabat" required error={errors.nama}>
                                        <div className="relative">
                                            <UserRound
                                                size={14}
                                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                            <input
                                                type="text"
                                                value={data.nama}
                                                onChange={(e) => setData('nama', e.target.value)}
                                                placeholder="Nama lengkap beserta gelar"
                                                className={`${inputClass(errors.nama)} pl-9`}
                                                required
                                            />
                                        </div>
                                    </Field>
                                </div>

                                <div className="sm:col-span-3">
                                    <Field label="Jabatan Pokok" error={errors.jabatan} hint="Field ini dapat dikosongkan bila belum ditetapkan.">
                                        <div className="relative">
                                            <BriefcaseBusiness
                                                size={14}
                                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                            <input
                                                type="text"
                                                value={data.jabatan}
                                                onChange={(e) => setData('jabatan', e.target.value)}
                                                placeholder="Contoh: Kuasa BUD Kabupaten"
                                                className={`${inputClass(errors.jabatan)} pl-9`}
                                            />
                                        </div>
                                    </Field>
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
                                    Batal
                                </TreaButton>

                                <TreaButton type="submit" variant="warning" loading={processing} loadingLabel="Menyimpan..." icon={Save}>
                                    Perbarui Data
                                </TreaButton>
                            </div>
                        </div>
                    </form>
                </TreaCard>
            </TreaPage>
        </>
    );
}
