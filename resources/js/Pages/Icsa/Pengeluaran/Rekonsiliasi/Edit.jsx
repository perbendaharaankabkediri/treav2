import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDatePicker from '@/components/ui/TreaDatePicker';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaMoneyInput, { formatTreaMoney, parseTreaMoney } from '@/components/ui/TreaMoneyInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { useTreaToast } from '@/components/ui/TreaToast';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Check, Info, Landmark, Layers, Minus, Plus, Save, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

/* ── HELPERS ── */
const num = (value) => parseTreaMoney(value) ?? 0;
const fmt = (value) => formatTreaMoney(value);

const BULAN = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

/* ── KALKULATOR PEMBANTU ── */
function Calculator({ title, fields, onApply, result, onChange }) {
    return (
        <TreaCard variant="transparent" padding="none" className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-indigo-600">
                <Info size={12} className="shrink-0" />
                {title}
            </div>
            <div className="flex flex-wrap items-end gap-3">
                {fields.map((field, index) => (
                    <React.Fragment key={field.key}>
                        {index > 0 && (
                            <span className="pb-2 text-slate-400">
                                <Plus size={12} />
                            </span>
                        )}
                        <div className="min-w-[140px] flex-1">
                            <TreaMoneyInput
                                id={field.key}
                                label={field.label}
                                value={field.value}
                                onChange={(value) => onChange(field.key, value)}
                                allowNegative={false}
                                min={0}
                                size="sm"
                                ariaLabel={field.label}
                                floatLabel
                            />
                        </div>
                    </React.Fragment>
                ))}
                <button
                    type="button"
                    onClick={onApply}
                    className="h-9 shrink-0 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                    Terapkan ({fmt(result)})
                </button>
            </div>
        </TreaCard>
    );
}

/* ── KALKULATOR BKU (pengurangan) ── */
function BkuCalculator({ title, keyTotal, keySblm, tools, onChange }) {
    return (
        <TreaCard variant="transparent" padding="none" className="mt-2 max-w-xl rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                <Info size={12} className="shrink-0" />
                {title}
            </div>
            <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[130px] flex-1">
                    <TreaMoneyInput
                        id={keyTotal}
                        label="Total s/d Bulan Ini"
                        value={tools[keyTotal]}
                        onChange={(value) => onChange(keyTotal, value)}
                        allowNegative={false}
                        min={0}
                        size="sm"
                        floatLabel
                    />
                </div>
                <span className="pb-2 text-slate-400">
                    <Minus size={12} />
                </span>
                <div className="min-w-[130px] flex-1">
                    <TreaMoneyInput
                        id={keySblm}
                        label="Saldo sebelumnya"
                        value={tools[keySblm]}
                        onChange={(value) => onChange(keySblm, value)}
                        allowNegative={false}
                        min={0}
                        size="sm"
                        floatLabel
                    />
                </div>
            </div>
        </TreaCard>
    );
}

/* ── ROW LABEL ── */
function RowLabel({ children, className = '' }) {
    return <td className={`px-4 py-3 font-medium leading-5 text-slate-600 ${className}`}>{children}</td>;
}

/* ── SELISIH ROW ── */
function SelisihRow({ label, value, colspan = 1 }) {
    const isBalance = value === 0;
    return (
        <tr className={isBalance ? 'bg-slate-50/60' : 'bg-blue-50/40'}>
            <td className={`flex items-center gap-1.5 px-4 py-3 font-semibold ${isBalance ? 'text-slate-500' : 'text-[#1E3A8A]'}`}>
                {!isBalance && <Info size={13} className="shrink-0 text-blue-400" />}
                {label}
            </td>
            <td colSpan={colspan} className={`px-4 py-3 text-right font-mono text-sm font-bold ${isBalance ? 'text-slate-700' : 'text-[#1E3A8A]'}`}>
                {fmt(value)}
            </td>
        </tr>
    );
}

/* ── SALDO ROW ── */
function SaldoRow({ label, value, colspan = 1 }) {
    return (
        <tr className="border-t-2 border-slate-200 bg-[#1E3A8A]/5">
            <td className="px-4 py-3.5 text-sm font-bold text-[#1E3A8A]">{label}</td>
            <td colSpan={colspan} className="px-4 py-3.5 text-right font-mono text-base font-black text-[#1E3A8A]">
                {fmt(value)}
            </td>
        </tr>
    );
}

function ImportValueCell({ value, available, currentValue, onCopy }) {
    const isSame = available && num(currentValue) === num(value);

    return (
        <td className="px-4 py-2">
            {available ? (
                <div className="flex items-center justify-end gap-2">
                    <div className="min-w-0 text-right">
                        <span className="block font-mono text-sm font-bold text-slate-700">Rp {fmt(value)}</span>
                        {isSame && (
                            <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-semibold text-emerald-600">
                                <Check size={11} /> Sesuai
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onCopy}
                        disabled={isSame}
                        title={isSame ? 'Nilai form sudah sama dengan data import' : 'Salin nominal import ke form'}
                        className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-[11px] font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-default disabled:border-emerald-100 disabled:bg-emerald-50 disabled:text-emerald-600"
                    >
                        {isSame ? <Check size={12} /> : <ArrowLeft size={12} />}
                        {isSame ? 'Sesuai' : 'Salin'}
                    </button>
                </div>
            ) : (
                <div className="text-right text-[11px] font-medium text-slate-400">Import belum tersedia</div>
            )}
        </td>
    );
}

/* ── MAIN ── */
export default function Edit({ auth, title, rekon, dataRekon }) {
    const toast = useTreaToast();
    const [activeTab, setActiveTab] = useState('tabA');
    const [importInfoOpen, setImportInfoOpen] = useState(false);

    const [tools, setTools] = useState({
        sp2d_ls_gaji: null,
        sp2d_ls_barjas: null,
        spj_ls_gaji: null,
        spj_ls_barjas: null,
        bku_penerimaan_total: null,
        bku_penerimaan_sblm: null,
        bku_pengeluaran_total: null,
        bku_pengeluaran_sblm: null,
    });

    const { data, setData, put, processing } = useForm({
        tanggal_rekon: rekon.tanggal_rekon ? rekon.tanggal_rekon.substring(0, 10) : '',
        sp2d_ls: dataRekon.tabA.penerimaan.ls ?? 0,
        sp2d_upgu: dataRekon.tabA.penerimaan.up_gu ?? 0,
        sp2d_tu: dataRekon.tabA.penerimaan.tu ?? 0,
        sp2d_gukkpd: dataRekon.tabA.penerimaan.gukkpd ?? 0,
        spj_ls: dataRekon.tabA.pengeluaran.spj_ls ?? 0,
        spj_upgu: dataRekon.tabA.pengeluaran.spj_up_gu ?? 0,
        spj_tu: dataRekon.tabA.pengeluaran.spj_tu ?? 0,
        spj_gukkpd: dataRekon.tabA.pengeluaran.spj_gukkpd ?? 0,
        sts_upgu: dataRekon.tabA.pengeluaran.sts_up_gu ?? 0,
        sts_tu: dataRekon.tabA.pengeluaran.sts_tu ?? 0,
        cp_ls: dataRekon.tabA.pengeluaran.cp_ls ?? 0,
        cp_upgu: dataRekon.tabA.pengeluaran.cp_up_gu ?? 0,
        cp_tu: dataRekon.tabA.pengeluaran.cp_tu ?? 0,
        bku_penerimaan: dataRekon.tabB.penerimaan ?? 0,
        bku_pengeluaran: dataRekon.tabB.pengeluaran ?? 0,
        keterangan_bku: dataRekon.keterangan_selisih.keterangan_bku || '',
        posisi_kas: dataRekon.tabC.list_bendahara.map((b) => {
            const match = dataRekon.tabC.posisi_kas.find((p) => {
                const pJ = String(p.jenis_bendahara ?? '').trim();
                const bJ = String(b.jenis_bendahara ?? '').trim();
                const pBd = String(p.bidang_bendahara ?? '').trim();
                const bBd = String(b.bidang_bendahara ?? '').trim();
                return pJ === bJ && pBd === bBd;
            });
            return {
                jenis_bendahara: b.jenis_bendahara,
                bidang_bendahara: b.bidang_bendahara || '',
                label: String(b.jenis_bendahara).trim() === '001' ? 'Bendahara Pengeluaran' : `BPP ${b.bidang_bendahara || ''}`,
                kas_tunai: match ? Number(match.kas_tunai) : 0,
                kas_di_bank: match ? Number(match.kas_di_bank) : 0,
            };
        }),
        keterangan_posisi_kas: dataRekon.keterangan_selisih.keterangan_posisi_kas || '',
    });

    /* ── Kalkulasi ── */
    const totalPenerimaanA = num(data.sp2d_ls) + num(data.sp2d_upgu) + num(data.sp2d_tu) + num(data.sp2d_gukkpd);
    const totalPengeluaranA =
        num(data.spj_ls) +
        num(data.spj_upgu) +
        num(data.spj_tu) +
        num(data.spj_gukkpd) +
        num(data.sts_upgu) +
        num(data.sts_tu) +
        num(data.cp_ls) +
        num(data.cp_upgu) +
        num(data.cp_tu);
    const saldoKasA = num(dataRekon.tabA.saldo_awal) + totalPenerimaanA - totalPengeluaranA;
    const saldoKasB = num(dataRekon.tabB.saldo_awal) + num(data.bku_penerimaan) - num(data.bku_pengeluaran);
    const selisihAB = saldoKasA - saldoKasB;
    const totalKasTunai = data.posisi_kas.reduce((a, c) => a + num(c.kas_tunai), 0);
    const totalKasBank = data.posisi_kas.reduce((a, c) => a + num(c.kas_di_bank), 0);
    const jumlahKasRiilC = totalKasTunai + totalKasBank;
    const selisihAC = saldoKasA - jumlahKasRiilC;
    const totalSp2dLsCalc = num(tools.sp2d_ls_gaji) + num(tools.sp2d_ls_barjas);
    const totalSpjLsCalc = num(tools.spj_ls_gaji) + num(tools.spj_ls_barjas);
    const tabAImport = dataRekon.tabA.import ?? {};
    const registerImport = tabAImport.register_sp2d ?? { available: false, values: {} };
    const realisasiImport = tabAImport.laporan_realisasi ?? { available: false, values: {} };
    const totalPenerimaanImport = ['sp2d_ls', 'sp2d_upgu', 'sp2d_tu', 'sp2d_gukkpd'].reduce(
        (total, key) => total + num(registerImport.values?.[key]),
        0,
    );
    const totalPengeluaranImport = ['spj_ls', 'spj_upgu', 'spj_tu', 'spj_gukkpd', 'sts_upgu', 'sts_tu', 'cp_ls', 'cp_upgu', 'cp_tu'].reduce(
        (total, key) => total + num(realisasiImport.values?.[key]),
        0,
    );
    const sp2dLsValue = num(data.sp2d_ls);
    const spjLsValue = num(data.spj_ls);
    const cpLsValue = num(data.cp_ls);
    const lsHasDifference = Math.abs(sp2dLsValue - spjLsValue) >= 0.01;
    const lsIsExplainedByReturn = lsHasDifference && Math.abs(sp2dLsValue - (spjLsValue + cpLsValue)) < 0.01;
    const lsUnexplainedDifference = sp2dLsValue - (spjLsValue + cpLsValue);

    /* BKU kalkulator — auto-update via useEffect */
    useEffect(() => {
        if (tools.bku_penerimaan_total !== null || tools.bku_penerimaan_sblm !== null) {
            setData('bku_penerimaan', num(tools.bku_penerimaan_total) - num(tools.bku_penerimaan_sblm));
        }
    }, [tools.bku_penerimaan_total, tools.bku_penerimaan_sblm]);

    useEffect(() => {
        if (tools.bku_pengeluaran_total !== null || tools.bku_pengeluaran_sblm !== null) {
            setData('bku_pengeluaran', num(tools.bku_pengeluaran_total) - num(tools.bku_pengeluaran_sblm));
        }
    }, [tools.bku_pengeluaran_total, tools.bku_pengeluaran_sblm]);

    /* ── Handlers ── */
    const handleToolChange = (key, value) => {
        setTools((current) => ({ ...current, [key]: value }));
    };

    const handlePosisiKasChange = (index, field, value) => {
        const updated = data.posisi_kas.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value ?? 0 } : item));

        setData('posisi_kas', updated);
    };

    const applyCalc = (formKey, value, label) => {
        setData(formKey, value);
        toast.success(`${label} diperbarui menjadi Rp ${fmt(value)}`, {
            title: 'Diterapkan',
            life: 1500,
        });
    };

    const copyImportValue = (formKey, value, label) => {
        setData(formKey, num(value));
        toast.success(`${label} diisi dari data import sebesar Rp ${fmt(value)}`, {
            title: 'Data import disalin',
            life: 1800,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const hasSelisih = selisihAB !== 0 || selisihAC !== 0;
        Swal.fire({
            title: 'Simpan Perubahan?',
            text: hasSelisih ? 'Masih terdeteksi selisih saldo keuangan. Tetap simpan?' : 'Pastikan semua data perubahan sudah benar.',
            icon: hasSelisih ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: '#1E3A8A',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, Simpan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                put(route('icsa.pengeluaran.rekonsiliasi.update', encodeURIComponent(rekon.no_rekon)), {
                    data: {
                        ...data,
                        sp2d_ls: num(data.sp2d_ls),
                        sp2d_upgu: num(data.sp2d_upgu),
                        sp2d_tu: num(data.sp2d_tu),
                        sp2d_gukkpd: num(data.sp2d_gukkpd),
                        spj_ls: num(data.spj_ls),
                        spj_upgu: num(data.spj_upgu),
                        spj_tu: num(data.spj_tu),
                        spj_gukkpd: num(data.spj_gukkpd),
                        sts_upgu: num(data.sts_upgu),
                        sts_tu: num(data.sts_tu),
                        cp_ls: num(data.cp_ls),
                        cp_upgu: num(data.cp_upgu),
                        cp_tu: num(data.cp_tu),
                        bku_penerimaan: num(data.bku_penerimaan),
                        bku_pengeluaran: num(data.bku_pengeluaran),
                        posisi_kas: data.posisi_kas.map((item) => ({
                            ...item,
                            kas_tunai: num(item.kas_tunai),
                            kas_di_bank: num(item.kas_di_bank),
                        })),
                        total_penerimaan: totalPenerimaanA,
                        total_pengeluaran: totalPengeluaranA,
                        saldo_kas_a: saldoKasA,
                        saldo_kas_b: saldoKasB,
                        selisih_ab: selisihAB,
                        jumlah_kas: jumlahKasRiilC,
                        selisih_ac: selisihAC,
                    },
                });
            }
        });
    };

    const TABS = [
        { key: 'tabA', label: 'Tab A: Realisasi SIPD', icon: Layers },
        { key: 'tabB', label: 'Tab B: Buku Kas Umum', icon: Landmark },
        { key: 'tabC', label: 'Tab C: Saldo Kas Riil', icon: Wallet },
    ];

    const SP2D_FIELDS = [
        { k: 'sp2d_upgu', l: 'b. SP2D UP / GU (Uang Persediaan)' },
        { k: 'sp2d_tu', l: 'c. SP2D TU (Tambahan Uang)' },
        { k: 'sp2d_gukkpd', l: 'd. SP2D GU KKPD' },
    ];
    const SPJ_FIELDS = [
        { k: 'spj_upgu', l: 'b. SPJ UP / GU' },
        { k: 'spj_tu', l: 'c. SPJ TU' },
        { k: 'spj_gukkpd', l: 'd. SPJ GU KKPD' },
        { k: 'sts_upgu', l: 'e. Sisa UP / GU (STS)' },
        { k: 'sts_tu', l: 'f. Sisa TU (STS)' },
        { k: 'cp_ls', l: 'g. Pengembalian Belanja LS' },
        { k: 'cp_upgu', l: 'h. Pengembalian Belanja UP / GU' },
        { k: 'cp_tu', l: 'i. Pengembalian Belanja TU' },
    ];

    return (
        <>
            <Head title={title} />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Edit Rekonsiliasi Kas"
                    subtitle="Perbarui nilai dan penjelasan pada lembar kerja rekonsiliasi."
                    meta={
                        <>
                            <span>
                                No. <strong className="font-mono font-semibold text-slate-600">{rekon.no_rekon}</strong>
                            </span>
                            <span>TA {rekon.tahun}</span>
                            <span>{BULAN[parseInt(rekon.bulan)] || rekon.bulan}</span>
                            <span className="max-w-md truncate">{rekon.skpd || dataRekon.skpdNama || '-'}</span>
                        </>
                    }
                    actions={
                        <div className="w-full sm:w-52">
                            <TreaDatePicker
                                id="tanggal_rekon"
                                name="tanggal_rekon"
                                label="Tanggal Rekon"
                                value={data.tanggal_rekon}
                                onChange={(value) => setData('tanggal_rekon', value)}
                                placeholder="Pilih tanggal"
                                size="sm"
                                showIcon
                                showButtonBar
                                clearable
                                floatLabel
                            />
                        </div>
                    }
                />
                {/* ── Ringkasan Saldo ── */}
                <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Saldo SIPD (A)', value: fmt(saldoKasA) },
                        { label: 'Saldo BKU (B)', value: fmt(saldoKasB) },
                        { label: 'Kas Riil (C)', value: fmt(jumlahKasRiilC) },
                    ].map(({ label, value }) => (
                        <div key={label} className="border-b border-slate-100 px-4 py-2.5 sm:border-r xl:border-b-0">
                            <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</span>
                            <span className="mt-1 block font-mono text-sm font-semibold text-slate-700">{value}</span>
                        </div>
                    ))}
                    <div
                        className={`px-4 py-2.5 ${
                            selisihAB === 0 && selisihAC === 0 ? 'bg-emerald-50/70 text-emerald-700' : 'bg-amber-50/70 text-amber-700'
                        }`}
                    >
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] opacity-70">Status Rekonsiliasi</span>
                        <span className="mt-1 block text-sm font-semibold">
                            {selisihAB === 0 && selisihAC === 0 ? 'Balance' : 'Masih Ada Selisih'}
                        </span>
                    </div>
                </div>

                {/* ── Tab Form ── */}
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {/* Tab nav */}
                    <div className="flex gap-1 border-b border-slate-100 bg-slate-50 p-1.5">
                        {TABS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setActiveTab(key)}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
                                    activeTab === key
                                        ? 'border border-slate-200 bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-400 hover:bg-white/60 hover:text-slate-600'
                                }`}
                            >
                                <Icon size={13} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-5">
                            {/* ══ TAB A: REALISASI SIPD ══ */}
                            {activeTab === 'tabA' && (
                                <div>
                                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                                        <table className="min-w-full whitespace-nowrap text-xs">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                        Uraian Parameter Finansial
                                                    </th>
                                                    <th className="w-64 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                        Nilai Rekonsiliasi
                                                    </th>
                                                    <th className="w-72 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                        <span className="inline-flex items-center justify-end gap-1.5">
                                                            Nilai Data Import
                                                            <button
                                                                type="button"
                                                                onClick={() => setImportInfoOpen(true)}
                                                                title="Informasi sumber data import"
                                                                aria-label="Buka informasi sumber data import"
                                                                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-indigo-500 transition hover:bg-indigo-100 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                                            >
                                                                <Info size={15} />
                                                            </button>
                                                        </span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {/* Saldo awal */}
                                                <tr className="bg-slate-50/70">
                                                    <RowLabel>1. Saldo Awal Rekonsiliasi Kas</RowLabel>
                                                    <td colSpan={2} className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                                                        {fmt(dataRekon.tabA.saldo_awal)}
                                                    </td>
                                                </tr>

                                                {/* Header penerimaan */}
                                                <tr className="bg-slate-100/70">
                                                    <td colSpan={3} className="px-4 py-2 font-bold text-slate-700">
                                                        2. Realisasi Penerimaan Kas
                                                    </td>
                                                </tr>

                                                {/* SP2D LS + kalkulator */}
                                                <tr>
                                                    <RowLabel className="pl-8">a. SP2D Penerimaan LS</RowLabel>
                                                    <td className="px-4 py-2">
                                                        <TreaMoneyInput
                                                            id="sp2d_ls"
                                                            label="Rp"
                                                            ariaLabel="SP2D penerimaan LS"
                                                            value={data.sp2d_ls}
                                                            onChange={(value) => setData('sp2d_ls', value ?? 0)}
                                                            allowNegative={false}
                                                            min={0}
                                                            size="sm"
                                                            floatLabel
                                                        />
                                                    </td>
                                                    <ImportValueCell
                                                        value={registerImport.values?.sp2d_ls}
                                                        available={registerImport.available}
                                                        currentValue={data.sp2d_ls}
                                                        onCopy={() => copyImportValue('sp2d_ls', registerImport.values?.sp2d_ls, 'SP2D LS')}
                                                    />
                                                </tr>
                                                <tr>
                                                    <td colSpan={3} className="px-4 pb-4 pl-8">
                                                        <Calculator
                                                            title="Kalkulator Pembantu SP2D LS"
                                                            fields={[
                                                                { key: 'sp2d_ls_gaji', label: 'LS Gaji & Tunjangan', value: tools.sp2d_ls_gaji },
                                                                { key: 'sp2d_ls_barjas', label: 'LS Barang & Jasa', value: tools.sp2d_ls_barjas },
                                                            ]}
                                                            result={totalSp2dLsCalc}
                                                            onChange={handleToolChange}
                                                            onApply={() => applyCalc('sp2d_ls', totalSp2dLsCalc, 'SP2D LS')}
                                                        />
                                                    </td>
                                                </tr>

                                                {/* SP2D lainnya */}
                                                {SP2D_FIELDS.map(({ k, l }) => (
                                                    <tr key={k}>
                                                        <RowLabel className="pl-8">{l}</RowLabel>
                                                        <td className="px-4 py-2">
                                                            <TreaMoneyInput
                                                                id={k}
                                                                label="Rp"
                                                                ariaLabel={l}
                                                                value={data[k]}
                                                                onChange={(value) => setData(k, value ?? 0)}
                                                                allowNegative={false}
                                                                min={0}
                                                                size="sm"
                                                                floatLabel
                                                            />
                                                        </td>
                                                        <ImportValueCell
                                                            value={registerImport.values?.[k]}
                                                            available={registerImport.available}
                                                            currentValue={data[k]}
                                                            onCopy={() =>
                                                                copyImportValue(k, registerImport.values?.[k], l.replace(/^[a-z]\.\s*/i, ''))
                                                            }
                                                        />
                                                    </tr>
                                                ))}

                                                {/* Total penerimaan */}
                                                <tr className="bg-indigo-50/70">
                                                    <td className="px-4 py-3 font-bold text-indigo-700">Jumlah Penerimaan Kas (SIPD)</td>
                                                    <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700">
                                                        {fmt(totalPenerimaanA)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono font-bold text-indigo-700">
                                                        {registerImport.available ? fmt(totalPenerimaanImport) : '—'}
                                                    </td>
                                                </tr>

                                                {/* Header pengeluaran */}
                                                <tr className="bg-slate-100/70">
                                                    <td colSpan={3} className="px-4 py-2 font-bold text-slate-700">
                                                        3. Realisasi Pengeluaran Kas
                                                    </td>
                                                </tr>

                                                {/* SPJ LS + kalkulator */}
                                                <tr>
                                                    <RowLabel className="pl-8">a. SPJ Pengeluaran LS</RowLabel>
                                                    <td className="px-4 py-2">
                                                        <TreaMoneyInput
                                                            id="spj_ls"
                                                            label="Rp"
                                                            ariaLabel="SPJ pengeluaran LS"
                                                            value={data.spj_ls}
                                                            onChange={(value) => setData('spj_ls', value ?? 0)}
                                                            allowNegative={false}
                                                            min={0}
                                                            size="sm"
                                                            floatLabel
                                                        />
                                                    </td>
                                                    <ImportValueCell
                                                        value={realisasiImport.values?.spj_ls}
                                                        available={realisasiImport.available}
                                                        currentValue={data.spj_ls}
                                                        onCopy={() => copyImportValue('spj_ls', realisasiImport.values?.spj_ls, 'SPJ LS')}
                                                    />
                                                </tr>
                                                <tr>
                                                    <td colSpan={3} className="px-4 pb-4 pl-8">
                                                        <Calculator
                                                            title="Kalkulator Pembantu SPJ LS"
                                                            fields={[
                                                                { key: 'spj_ls_gaji', label: 'SPJ LS Gaji', value: tools.spj_ls_gaji },
                                                                { key: 'spj_ls_barjas', label: 'SPJ LS Barang & Jasa', value: tools.spj_ls_barjas },
                                                            ]}
                                                            result={totalSpjLsCalc}
                                                            onChange={handleToolChange}
                                                            onApply={() => applyCalc('spj_ls', totalSpjLsCalc, 'SPJ LS')}
                                                        />
                                                    </td>
                                                </tr>

                                                {/* SPJ/STS/CP lainnya */}
                                                {SPJ_FIELDS.map(({ k, l }) => (
                                                    <tr key={k}>
                                                        <RowLabel className="pl-8">{l}</RowLabel>
                                                        <td className="px-4 py-2">
                                                            <TreaMoneyInput
                                                                id={k}
                                                                label="Rp"
                                                                ariaLabel={l}
                                                                value={data[k]}
                                                                onChange={(value) => setData(k, value ?? 0)}
                                                                allowNegative={false}
                                                                min={0}
                                                                size="sm"
                                                                floatLabel
                                                            />
                                                        </td>
                                                        <ImportValueCell
                                                            value={realisasiImport.values?.[k]}
                                                            available={realisasiImport.available}
                                                            currentValue={data[k]}
                                                            onCopy={() =>
                                                                copyImportValue(k, realisasiImport.values?.[k], l.replace(/^[a-z]\.\s*/i, ''))
                                                            }
                                                        />
                                                    </tr>
                                                ))}

                                                {/* Total pengeluaran */}
                                                <tr className="bg-slate-100/70">
                                                    <td className="px-4 py-3 font-bold text-slate-600">Jumlah Pengeluaran Kas (SIPD)</td>
                                                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                                                        {fmt(totalPengeluaranA)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                                                        {realisasiImport.available ? fmt(totalPengeluaranImport) : '—'}
                                                    </td>
                                                </tr>

                                                <SaldoRow label="4. Saldo Kas Akhir Bulan Berjalan (A)" value={saldoKasA} colspan={2} />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ══ TAB B: BKU ══ */}
                            {activeTab === 'tabB' && (
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <table className="min-w-full whitespace-nowrap text-xs">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                    Uraian Pencatatan Buku Kas Umum
                                                </th>
                                                <th className="w-72 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                    Nilai (IDR)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            <tr className="bg-slate-50/70">
                                                <RowLabel>1. Saldo Awal BKU Bulan Berjalan</RowLabel>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                                                    {fmt(dataRekon.tabB.saldo_awal)}
                                                </td>
                                            </tr>

                                            {/* Penerimaan */}
                                            <tr>
                                                <td className="px-4 py-3 align-top">
                                                    <span className="mb-2 block font-bold text-slate-700">2. Total Penerimaan Bulan Ini</span>
                                                    <BkuCalculator
                                                        title="Kalkulator Penerimaan BKU"
                                                        keyTotal="bku_penerimaan_total"
                                                        keySblm="bku_penerimaan_sblm"
                                                        tools={tools}
                                                        onChange={handleToolChange}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 align-middle">
                                                    <TreaMoneyInput
                                                        id="bku_penerimaan"
                                                        label="Rp"
                                                        ariaLabel="Total penerimaan bulan ini"
                                                        value={data.bku_penerimaan}
                                                        onChange={(value) => setData('bku_penerimaan', value ?? 0)}
                                                        allowNegative={false}
                                                        min={0}
                                                        size="sm"
                                                        floatLabel
                                                    />
                                                </td>
                                            </tr>

                                            {/* Pengeluaran */}
                                            <tr>
                                                <td className="px-4 py-3 align-top">
                                                    <span className="mb-2 block font-bold text-slate-700">3. Total Pengeluaran Bulan Ini</span>
                                                    <BkuCalculator
                                                        title="Kalkulator Pengeluaran BKU"
                                                        keyTotal="bku_pengeluaran_total"
                                                        keySblm="bku_pengeluaran_sblm"
                                                        tools={tools}
                                                        onChange={handleToolChange}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 align-middle">
                                                    <TreaMoneyInput
                                                        id="bku_pengeluaran"
                                                        label="Rp"
                                                        ariaLabel="Total pengeluaran bulan ini"
                                                        value={data.bku_pengeluaran}
                                                        onChange={(value) => setData('bku_pengeluaran', value ?? 0)}
                                                        allowNegative={false}
                                                        min={0}
                                                        size="sm"
                                                        floatLabel
                                                    />
                                                </td>
                                            </tr>

                                            <SaldoRow label="4. Final Saldo Kas Buku Umum (B)" value={saldoKasB} />
                                            <SelisihRow label="5. Selisih Realisasi SIPD & BKU (A − B)" value={selisihAB} />

                                            {/* Keterangan BKU */}
                                            <tr>
                                                <RowLabel className="align-top">6. Keterangan Selisih BKU</RowLabel>
                                                <td className="px-4 py-3">
                                                    <textarea
                                                        rows={3}
                                                        placeholder="Deskripsikan penyebab perbedaan nominal BKU..."
                                                        value={data.keterangan_bku}
                                                        onChange={(e) => setData('keterangan_bku', e.target.value)}
                                                        className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ══ TAB C: POSISI KAS ══ */}
                            {activeTab === 'tabC' && (
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <table className="min-w-full whitespace-nowrap text-xs">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                    Pemegang Kas / Bendahara
                                                </th>
                                                <th className="w-72 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                    Kas Tunai (Rp)
                                                </th>
                                                <th className="w-72 px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                                                    Saldo Bank (Rp)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {data.posisi_kas.map((b, i) => (
                                                <tr key={i} className="transition-colors hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-semibold text-slate-800">{b.label}</td>
                                                    <td className="px-4 py-2">
                                                        <TreaMoneyInput
                                                            id={`posisi_kas_${i}_tunai`}
                                                            label="Rp"
                                                            ariaLabel={`Kas tunai ${b.label}`}
                                                            value={b.kas_tunai}
                                                            onChange={(value) => handlePosisiKasChange(i, 'kas_tunai', value)}
                                                            allowNegative={false}
                                                            min={0}
                                                            size="sm"
                                                            floatLabel
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <TreaMoneyInput
                                                            id={`posisi_kas_${i}_bank`}
                                                            label="Rp"
                                                            ariaLabel={`Saldo bank ${b.label}`}
                                                            value={b.kas_di_bank}
                                                            onChange={(value) => handlePosisiKasChange(i, 'kas_di_bank', value)}
                                                            allowNegative={false}
                                                            min={0}
                                                            size="sm"
                                                            floatLabel
                                                        />
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* Subtotal */}
                                            <tr className="bg-slate-50/70">
                                                <td className="px-4 py-2.5 font-bold text-slate-600">Subtotal</td>
                                                <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-700">
                                                    {fmt(totalKasTunai)}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-700">{fmt(totalKasBank)}</td>
                                            </tr>

                                            {/* Total Kas Riil C */}
                                            <tr className="border-t-2 border-slate-200 bg-[#1E3A8A]/5">
                                                <td className="px-4 py-3.5 text-sm font-bold text-[#1E3A8A]">3. Jumlah Kas Riil (C)</td>
                                                <td colSpan={2} className="px-4 py-3.5 text-right font-mono text-base font-black text-[#1E3A8A]">
                                                    {fmt(jumlahKasRiilC)}
                                                </td>
                                            </tr>

                                            <SelisihRow label="4. Selisih Saldo SIPD & Kas Riil (A − C)" value={selisihAC} colspan={2} />

                                            {/* Keterangan */}
                                            <tr>
                                                <RowLabel className="align-top">5. Keterangan Selisih Fisik Kas</RowLabel>
                                                <td colSpan={2} className="px-4 py-3">
                                                    <textarea
                                                        rows={3}
                                                        placeholder="Berikan alasan jika saldo sistem berbeda dengan saldo brankas/rekening..."
                                                        value={data.keterangan_posisi_kas}
                                                        onChange={(e) => setData('keterangan_posisi_kas', e.target.value)}
                                                        className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                            <TreaButton
                                href={route('icsa.pengeluaran.rekonsiliasi.index', { kode_skpd: rekon.kode_skpd })}
                                as={Link}
                                variant="secondary"
                                size="sm"
                            >
                                <ArrowLeft size={13} /> Kembali
                            </TreaButton>
                            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
                                {activeTab === 'tabA' && lsHasDifference && (
                                    <div
                                        className={`flex max-w-xl items-start gap-2 rounded-lg border px-3 py-2 text-[11px] leading-4 ${
                                            lsIsExplainedByReturn
                                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                : 'border-rose-200 bg-rose-50 text-rose-700'
                                        }`}
                                    >
                                        <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                                        <span>
                                            {lsIsExplainedByReturn ? (
                                                <>
                                                    <strong>LS berbeda karena pengembalian Rp {fmt(cpLsValue)}.</strong> SP2D = SPJ + Pengembalian.
                                                </>
                                            ) : (
                                                <>
                                                    <strong>LS belum sesuai.</strong> SP2D harus sama dengan SPJ + Pengembalian. Selisih Rp{' '}
                                                    {fmt(Math.abs(lsUnexplainedDifference))}.
                                                </>
                                            )}
                                        </span>
                                    </div>
                                )}
                                <TreaButton type="submit" disabled={processing} size="sm">
                                    <Save size={13} />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </TreaButton>
                            </div>
                        </div>
                    </form>
                </TreaCard>

                <TreaDialog
                    open={importInfoOpen}
                    onClose={() => setImportInfoOpen(false)}
                    title="Informasi Data Import"
                    subtitle={`${BULAN[parseInt(rekon.bulan)] || rekon.bulan} ${rekon.tahun} · ${rekon.skpd || dataRekon.skpdNama || 'SKPD'}`}
                    icon={Info}
                    tone="info"
                    size="sm"
                >
                    <div className="space-y-3">
                        {[
                            {
                                label: 'Register SP2D',
                                available: registerImport.available,
                                detail: 'Nominal SP2D menggunakan bruto dan periode tanggal pencairan.',
                            },
                            {
                                label: 'Laporan Realisasi',
                                available: realisasiImport.available,
                                detail: 'Nominal SPJ, STS-Nihil, dan pengembalian menggunakan nilai realisasi serta periode tanggal dokumen.',
                            },
                        ].map((source) => (
                            <div key={source.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold text-slate-700">{source.label}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                            source.available ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}
                                    >
                                        {source.available ? 'Tersedia' : 'Tidak tersedia'}
                                    </span>
                                </div>
                                <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{source.detail}</p>
                            </div>
                        ))}
                        <p className="text-[11px] leading-5 text-slate-500">
                            Data import hanya menjadi referensi. Nilai rekonsiliasi tetap dapat diisi manual dan baru tersimpan setelah tombol Simpan
                            Perubahan ditekan.
                        </p>
                    </div>
                </TreaDialog>
            </TreaPage>
        </>
    );
}
