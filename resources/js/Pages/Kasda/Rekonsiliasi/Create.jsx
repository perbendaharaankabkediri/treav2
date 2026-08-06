import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDatePicker from '@/components/ui/TreaDatePicker';
import TreaInput from '@/components/ui/TreaInput';
import TreaMoneyInput from '@/components/ui/TreaMoneyInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { useTreaToast } from '@/components/ui/TreaToast';
import useAsyncAction from '@/hooks/useAsyncAction';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, BookOpen, CalendarDays, CheckCircle2, Info, Landmark, Plus, Save, Scale, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const formatIDR = (val) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

export default function Create({ title }) {
    const toast = useTreaToast();
    const { data, setData, post, processing, errors } = useForm({
        periode_rekon: '',
        saldo_buku_akhir: 0,
        saldo_bank_akhir: 0,
        selisih: 0,
        details: [],
    });

    const [inputTanggal, setInputTanggal] = useState('');
    const { loading: isLoading, run: runBalanceCheck } = useAsyncAction();
    const [totalPenjelasan, setTotalPenjelasan] = useState(0);
    const [isBalanceMatch, setIsBalanceMatch] = useState(false);

    const handleCekSaldo = async (e) => {
        e.preventDefault();

        if (!inputTanggal) {
            toast.warning('Silakan pilih tanggal terlebih dahulu.');
            return;
        }

        try {
            const result = await runBalanceCheck(async () => {
                const response = await fetch(`/kasda/rekonsiliasi/create/get-data?tanggal=${encodeURIComponent(inputTanggal)}`);
                if (!response.ok) throw new Error('Saldo tidak dapat dimuat.');
                return response.json();
            });

            if (!result) return;

            setData((prev) => ({
                ...prev,
                periode_rekon: inputTanggal,
                saldo_buku_akhir: parseFloat(result.saldo_buku) || 0,
                saldo_bank_akhir: parseFloat(result.saldo_bank) || 0,
                selisih: parseFloat(result.selisih) || 0,
            }));
        } catch (error) {
            toast.error(error.message || 'Gagal mengambil data saldo.');
        }
    };

    const tambahBaris = () => {
        setData('details', [...data.details, { keterangan_item: '', nomor_referensi: '', nominal: 0 }]);
    };

    const hapusBaris = (indexItem) => {
        setData(
            'details',
            data.details.filter((_, idx) => idx !== indexItem),
        );
    };

    const handleDetailChange = (index, field, value) => {
        const updated = [...data.details];
        updated[index][field] = field === 'nominal' ? parseFloat(value) || 0 : value;
        setData('details', updated);
    };

    useEffect(() => {
        const total = data.details.reduce((sum, item) => sum + (item.nominal || 0), 0);
        setTotalPenjelasan(total);

        const selisihTarget = data.selisih;
        const isMatch = Math.abs(total - selisihTarget) < 0.01;

        if (selisihTarget === 0 && data.periode_rekon !== '') {
            setIsBalanceMatch(true);
        } else if (isMatch && Math.abs(selisihTarget) > 0) {
            setIsBalanceMatch(true);
        } else {
            setIsBalanceMatch(false);
        }
    }, [data.details, data.selisih, data.periode_rekon]);

    useEffect(() => {
        if (errors.details) toast.error(errors.details);
    }, [errors.details, toast]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('kasda.rekon.store'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Tambah Berita Acara Rekon" />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Tambah Berita Acara Rekonsiliasi"
                    subtitle="Susun berita acara baru berdasarkan periode dan data rekonsiliasi."
                    actions={
                        <div
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
                                data.periode_rekon === ''
                                    ? 'border-slate-200 bg-slate-50 text-slate-500'
                                    : isBalanceMatch
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                      : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                        >
                            {data.periode_rekon === '' ? (
                                <CalendarDays size={12} />
                            ) : isBalanceMatch ? (
                                <CheckCircle2 size={12} />
                            ) : (
                                <AlertTriangle size={12} />
                            )}
                            {data.periode_rekon === '' ? 'Menunggu Periode' : isBalanceMatch ? 'Siap Disimpan' : 'Belum Balance'}
                        </div>
                    }
                />
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6 px-5 py-5">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Saldo Buku</p>
                                        <BookOpen size={16} className="text-slate-400" />
                                    </div>
                                    <p className="mt-3 truncate font-mono text-base font-bold text-slate-800">
                                        Rp {formatIDR(data.saldo_buku_akhir)}
                                    </p>
                                </TreaCard>
                                <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Saldo Bank</p>
                                        <Landmark size={16} className="text-slate-400" />
                                    </div>
                                    <p className="mt-3 truncate font-mono text-base font-bold text-slate-800">
                                        Rp {formatIDR(data.saldo_bank_akhir)}
                                    </p>
                                </TreaCard>
                                <div
                                    className={`rounded-2xl border p-4 ${
                                        Number(data.selisih || 0) === 0 && data.periode_rekon !== ''
                                            ? 'border-emerald-200 bg-emerald-50'
                                            : 'border-amber-200 bg-amber-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p
                                            className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                                Number(data.selisih || 0) === 0 && data.periode_rekon !== '' ? 'text-emerald-700' : 'text-amber-700'
                                            }`}
                                        >
                                            Selisih
                                        </p>
                                        <Scale
                                            size={16}
                                            className={
                                                Number(data.selisih || 0) === 0 && data.periode_rekon !== '' ? 'text-emerald-700' : 'text-amber-700'
                                            }
                                        />
                                    </div>
                                    <p
                                        className={`mt-3 truncate font-mono text-base font-bold ${
                                            Number(data.selisih || 0) === 0 && data.periode_rekon !== '' ? 'text-emerald-700' : 'text-amber-700'
                                        }`}
                                    >
                                        Rp {formatIDR(data.selisih)}
                                    </p>
                                </div>
                                <div
                                    className={`rounded-2xl border p-4 ${
                                        isBalanceMatch ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <p
                                            className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${
                                                isBalanceMatch ? 'text-emerald-700' : 'text-slate-500'
                                            }`}
                                        >
                                            Status Penjelasan
                                        </p>
                                        {isBalanceMatch ? (
                                            <CheckCircle2 size={16} className="text-emerald-700" />
                                        ) : (
                                            <AlertTriangle size={16} className="text-slate-400" />
                                        )}
                                    </div>
                                    <p className={`mt-3 text-sm font-bold ${isBalanceMatch ? 'text-emerald-700' : 'text-slate-600'}`}>
                                        {isBalanceMatch ? 'Balance' : 'Belum Sesuai'}
                                    </p>
                                </div>
                            </div>

                            {/* Input periode & info panel */}
                            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
                                <div>
                                    <div className="flex gap-2">
                                        <div className="min-w-0 flex-1">
                                            <TreaDatePicker
                                                id="periode_rekon"
                                                name="periode_rekon"
                                                label="Tanggal Akhir Bulan"
                                                required
                                                value={inputTanggal}
                                                onChange={(value) => setInputTanggal(value)}
                                                placeholder="Pilih tanggal akhir bulan"
                                                size="md"
                                                showIcon
                                                showButtonBar
                                                clearable
                                                error={errors.periode_rekon}
                                                helperText="Pilih tanggal lalu klik tombol Cek."
                                                floatLabel
                                            />
                                        </div>

                                        <TreaButton
                                            type="button"
                                            onClick={handleCekSaldo}
                                            disabled={isLoading || !inputTanggal}
                                            loading={isLoading}
                                            loadingLabel="Memuat..."
                                            icon={Search}
                                            className="mt-[22px]"
                                        >
                                            Cek Saldo
                                        </TreaButton>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <TreaCard
                                        variant="transparent"
                                        padding="none"
                                        className="flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-700"
                                    >
                                        <Info size={15} className="mt-0.5 shrink-0" />
                                        <p className="leading-relaxed">
                                            Silakan pilih tanggal penutupan kas daerah, kemudian tekan tombol Cek untuk mengambil kalkulasi saldo buku
                                            dan saldo bank penutupan secara YTD (Year-to-Date).
                                        </p>
                                    </TreaCard>
                                </div>
                            </div>

                            {/* Tabel perbandingan saldo */}
                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Perbandingan Saldo Penutupan
                                        </h2>
                                        <p className="mt-1 text-[11px] text-slate-400">Nilai diambil otomatis berdasarkan periode yang dipilih.</p>
                                    </div>
                                </div>
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <table className="min-w-full text-xs">
                                        <thead className="bg-slate-50/75">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-500">
                                                    Keterangan
                                                </th>
                                                <th className="w-1/3 px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-slate-500">
                                                    Nilai (Rp)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            <tr>
                                                <td className="px-4 py-2.5 text-slate-600">1. Saldo Kas Umum Daerah menurut Buku</td>
                                                <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                                                    {isLoading ? 'Memuat...' : formatIDR(data.saldo_buku_akhir)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2.5 text-slate-600">2. Saldo Kas Umum Daerah menurut Bank</td>
                                                <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                                                    {isLoading ? 'Memuat...' : formatIDR(data.saldo_bank_akhir)}
                                                </td>
                                            </tr>
                                            <tr className={data.selisih !== 0 ? 'bg-slate-50' : 'bg-blue-50/40'}>
                                                <td className="px-4 py-3 align-top font-semibold text-slate-700">Selisih</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div
                                                        className={`font-mono font-semibold ${data.selisih !== 0 ? 'text-slate-700' : 'text-[#1E3A8A]'}`}
                                                    >
                                                        {isLoading ? 'Memuat...' : formatIDR(data.selisih)}
                                                    </div>
                                                    <div className="mt-1.5 flex justify-end">
                                                        {data.periode_rekon === '' ? (
                                                            <TreaBadge tone="neutral">Menunggu pengecekan tanggal</TreaBadge>
                                                        ) : isBalanceMatch ? (
                                                            <TreaBadge tone="success" variant="solid" icon={CheckCircle2}>
                                                                Penjelasan balance
                                                            </TreaBadge>
                                                        ) : (
                                                            <TreaBadge tone="warning" icon={AlertTriangle}>
                                                                Belum sesuai
                                                            </TreaBadge>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Detail penjelasan selisih */}
                            <div>
                                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Penjelasan Selisih Kas</h2>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            Total penjelasan harus sama dengan nilai selisih agar berita acara dapat disimpan.
                                        </p>
                                    </div>
                                    <TreaButton type="button" onClick={tambahBaris} icon={Plus} variant="secondary" size="sm">
                                        Tambah item
                                    </TreaButton>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full rounded-lg border border-slate-200 text-xs">
                                        <thead className="bg-slate-50/75">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-500">
                                                    Keterangan Item Selisih
                                                </th>
                                                <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-500">
                                                    No. Referensi (SP2D/STS)
                                                </th>
                                                <th className="w-1/4 px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-slate-500">
                                                    Nominal (Rp)
                                                </th>
                                                <th className="w-12 px-2 py-2.5"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {data.details.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-10 text-center">
                                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                            <Plus size={18} />
                                                        </div>
                                                        <p className="mt-3 text-xs font-semibold text-slate-600">Belum ada item penjelasan</p>
                                                        <p className="mt-1 text-[11px] text-slate-400">
                                                            Klik “Tambah item” untuk menjelaskan komponen selisih.
                                                        </p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                data.details.map((item, index) => (
                                                    <tr key={index} className="transition-colors hover:bg-slate-50/50">
                                                        <td className="px-3 py-2">
                                                            <TreaInput
                                                                value={item.keterangan_item}
                                                                label="Keterangan"
                                                                onChange={(value) => handleDetailChange(index, 'keterangan_item', value)}
                                                                placeholder="Contoh: Deposito..."
                                                                required
                                                                size="sm"
                                                                floatLabel
                                                            />
                                                        </td>

                                                        <td className="px-3 py-2">
                                                            <TreaInput
                                                                value={item.nomor_referensi}
                                                                label="Bukti"
                                                                onChange={(value) => handleDetailChange(index, 'nomor_referensi', value)}
                                                                placeholder="Nomor bukti"
                                                                size="sm"
                                                                floatLabel
                                                            />
                                                        </td>

                                                        <td className="px-3 py-2">
                                                            <TreaMoneyInput
                                                                label="Rp"
                                                                value={item.nominal}
                                                                onChange={(value) => handleDetailChange(index, 'nominal', value ?? 0)}
                                                                placeholder="0,00"
                                                                required
                                                                size="sm"
                                                                allowNegative
                                                                floatLabel
                                                            />
                                                        </td>

                                                        <td className="px-2 py-2 text-center">
                                                            <TreaButton
                                                                type="button"
                                                                onClick={() => hapusBaris(index)}
                                                                icon={X}
                                                                iconOnly
                                                                variant="ghost"
                                                                size="xs"
                                                                aria-label={`Hapus item ${index + 1}`}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t border-slate-200 bg-slate-50/75">
                                                <td colSpan={2} className="px-4 py-2.5 text-right font-semibold text-slate-600">
                                                    Total Penjelasan
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                                                    {formatIDR(totalPenjelasan)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Action bar */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <TreaButton href={route('kasda.rekon.index')} as={Link} variant="secondary">
                                <ArrowLeft size={13} /> Kembali
                            </TreaButton>

                            <TreaButton
                                type="submit"
                                disabled={!isBalanceMatch || processing || isLoading}
                                loading={processing}
                                loadingLabel="Menyimpan..."
                                icon={Save}
                            >
                                Simpan Berita Acara
                            </TreaButton>
                        </div>
                    </form>
                </TreaCard>
            </TreaPage>
        </>
    );
}
