import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaMoneyInput from '@/components/ui/TreaMoneyInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ title, saldo, tahun }) {
    const form = useForm({
        saldo_bku: saldo?.saldo_awal_bku?.toString() || '0',
        saldo_mutasi: saldo?.saldo_awal_mutasi?.toString() || '0',
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        form.post(route('kasda.saldo-awal.store'), { preserveScroll: true });
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="medium">
                <TreaPageHeader
                    title="Saldo Awal Kasda"
                    subtitle="Tetapkan saldo awal Buku Kas Umum dan mutasi rekening untuk tahun anggaran aktif."
                />

                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Saldo Awal Tahun Anggaran {tahun || '-'}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Nilai ini digunakan sebagai dasar perhitungan saldo Kasda pada periode berjalan.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-5 py-4">
                        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
                            <TreaMoneyInput
                                label="Saldo Awal BKU"
                                value={form.data.saldo_bku}
                                onChange={(value) => form.setData('saldo_bku', value ?? 0)}
                                error={form.errors.saldo_bku}
                                placeholder="0,00"
                                size="md"
                                allowNegative={false}
                                min={0}
                                floatLabel
                            />

                            <TreaMoneyInput
                                label="Saldo Awal Mutasi"
                                value={form.data.saldo_mutasi}
                                onChange={(value) => form.setData('saldo_mutasi', value ?? 0)}
                                error={form.errors.saldo_mutasi}
                                placeholder="0,00"
                                size="md"
                                allowNegative={false}
                                min={0}
                                floatLabel
                            />

                            <TreaButton type="submit" disabled={form.processing} loading={form.processing} loadingLabel="Menyimpan...">
                                Simpan Saldo Awal
                            </TreaButton>
                        </div>
                    </form>
                </TreaCard>
            </TreaPage>
        </>
    );
}
