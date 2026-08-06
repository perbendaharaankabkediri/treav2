import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Building2, Info, Save } from 'lucide-react';

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

export default function Edit({ title, bendahara, listSkpd = [], jenis = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        kode_skpd: bendahara.kode_skpd || '',
        nip: bendahara.nip || '',
        nama: bendahara.nama || '',
        jenis_bendahara: bendahara.jenis_bendahara || '',
        bidang_bendahara: bendahara.bidang_bendahara || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('bendahara.update', bendahara.id));
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="form">
                <TreaPageHeader title="Edit Bendahara" subtitle="Perbarui informasi bendahara yang telah terdaftar." />
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
                                    <Field label="SKPD" required error={errors.kode_skpd}>
                                        <div className="relative">
                                            <Building2
                                                size={14}
                                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                            <select
                                                value={data.kode_skpd}
                                                onChange={(e) => setData('kode_skpd', e.target.value)}
                                                className={`${inputClass(errors.kode_skpd)} pl-9`}
                                                required
                                            >
                                                <option value="">— Pilih Satuan Kerja —</option>
                                                {listSkpd.map((s) => (
                                                    <option key={s.kode_skpd} value={s.kode_skpd}>
                                                        {s.skpd}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </Field>
                                </div>

                                <Field label="NIP Pegawai" required error={errors.nip} hint="Maksimal 18 digit NIP.">
                                    <input
                                        type="text"
                                        maxLength={18}
                                        value={data.nip}
                                        onChange={(e) => setData('nip', e.target.value)}
                                        placeholder="18 digit NIP"
                                        className={inputClass(errors.nip)}
                                        required
                                    />
                                </Field>

                                <Field label="Nama Lengkap" required error={errors.nama}>
                                    <input
                                        type="text"
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        placeholder="Nama lengkap bendahara"
                                        className={inputClass(errors.nama)}
                                        required
                                    />
                                </Field>

                                <Field label="Jabatan / Jenis" required error={errors.jenis_bendahara}>
                                    <div className="relative">
                                        <BadgeCheck
                                            size={14}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <select
                                            value={data.jenis_bendahara}
                                            onChange={(e) =>
                                                setData((d) => ({
                                                    ...d,
                                                    jenis_bendahara: e.target.value,
                                                    bidang_bendahara: e.target.value !== '002' ? '' : d.bidang_bendahara,
                                                }))
                                            }
                                            className={`${inputClass(errors.jenis_bendahara)} pl-9`}
                                            required
                                        >
                                            <option value="">— Pilih Jenis Jabatan —</option>
                                            {jenis.map((j) => (
                                                <option key={j.jenis_bendahara} value={j.jenis_bendahara}>
                                                    {j.bendahara}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </Field>

                                {data.jenis_bendahara === '002' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Field label="Nama Bidang Kerja" required error={errors.bidang_bendahara}>
                                            <input
                                                type="text"
                                                value={data.bidang_bendahara}
                                                onChange={(e) => setData('bidang_bendahara', e.target.value)}
                                                placeholder="Contoh: Bidang Pengairan / Sekretariat"
                                                className={inputClass(errors.bidang_bendahara)}
                                                required
                                            />
                                        </Field>
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
                                    <ArrowLeft size={13} /> Kembali
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
