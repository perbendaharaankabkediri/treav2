import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaInput from '@/components/ui/TreaInput';
import TreaLoadingOverlay from '@/components/ui/TreaLoadingOverlay';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import useAsyncAction from '@/hooks/useAsyncAction';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    ChevronDown,
    Clock,
    FileSpreadsheet,
    FileX,
    Info,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Plus,
    Printer,
    ScanLine,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';

const fmt = (val) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(val ?? 0));

const BULAN = {
    1: 'Januari',
    2: 'Februari',
    3: 'Maret',
    4: 'April',
    5: 'Mei',
    6: 'Juni',
    7: 'Juli',
    8: 'Agustus',
    9: 'September',
    10: 'Oktober',
    11: 'November',
    12: 'Desember',
};

const isBalanced = (value) => Math.abs(Number(value ?? 0)) < 0.001;

function StatusBadge({ status }) {
    if (status === 'SUDAH') {
        return (
            <TreaBadge tone="success" icon={CheckCircle2}>
                Selesai
            </TreaBadge>
        );
    }

    if (status === 'BELUM') {
        return <TreaBadge tone="neutral">Belum</TreaBadge>;
    }

    return (
        <TreaBadge tone="warning" icon={Clock}>
            Proses
        </TreaBadge>
    );
}

function BalanceBadge({ value }) {
    const balanced = isBalanced(value);

    return (
        <TreaBadge tone={balanced ? 'success' : 'warning'} icon={balanced ? CheckCircle2 : AlertCircle}>
            {balanced ? 'Balance' : `Rp ${fmt(Math.abs(value))}`}
        </TreaBadge>
    );
}

function ScanUnavailableModal({ isOpen, onClose }) {
    return (
        <TreaDialog
            open={isOpen}
            onClose={onClose}
            title="Dokumen tidak tersedia"
            icon={FileX}
            tone="warning"
            size="sm"
            footer={
                <div className="flex justify-end">
                    <TreaButton type="button" onClick={onClose} variant="secondary" size="sm">
                        Tutup
                    </TreaButton>
                </div>
            }
        >
            <div className="py-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <ScanLine size={22} />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">Scan berita acara belum tersedia</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                    File PDF belum diunggah ke sistem. Hubungi administrator untuk mengunggah dokumen.
                </p>
            </div>
        </TreaDialog>
    );
}

function AksiDropdown({ row, selectedSkpd, namaSkpd, onDelete, onScanBa, permissions }) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const menuWidth = 190;
    const menuHeight = 214;

    const calculatePosition = () => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < menuHeight && rect.top > menuHeight;

        setCoords({
            top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
            left: Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
        });
    };

    const toggleOpen = () => {
        if (!open) calculatePosition();
        setOpen((current) => !current);
    };

    const handlePrint = () => {
        setOpen(false);

        const printUrl = route('icsa.pengeluaran.rekonsiliasi.cetak', row.no_rekon);
        const unresolvedTabs = [
            !isBalanced(row.selisih_ab) && !row.keterangan_bku?.trim() ? 'Tab B' : null,
            !isBalanced(row.selisih_ac) && !row.keterangan?.trim() ? 'Tab C' : null,
        ].filter(Boolean);

        if (row.status !== 'PROSES' || unresolvedTabs.length === 0) {
            window.open(printUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        Swal.fire({
            title: `Masih ada selisih di ${unresolvedTabs.join(' dan ')}!`,
            text: 'Berita acara tetap dapat dicetak, tetapi rekonsiliasi belum tuntas.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d97706',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Tetap Cetak',
            cancelButtonText: 'Kembali',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                window.open(printUrl, '_blank', 'noopener,noreferrer');
            }
        });
    };

    useEffect(() => {
        if (!open) return undefined;

        const handleOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target) && menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        const handlePosition = () => calculatePosition();

        document.addEventListener('mousedown', handleOutside);
        window.addEventListener('scroll', handlePosition, true);
        window.addEventListener('resize', handlePosition);

        return () => {
            document.removeEventListener('mousedown', handleOutside);
            window.removeEventListener('scroll', handlePosition, true);
            window.removeEventListener('resize', handlePosition);
        };
    }, [open]);

    const items = [
        {
            label: 'Isi & Koreksi Data',
            permission: 'icsa-rekon.update',
            icon: Pencil,
            isLink: true,
            href: route('icsa.pengeluaran.rekonsiliasi.edit', {
                no_rekon: row.no_rekon,
                kode_skpd: selectedSkpd,
            }),
            className: 'text-indigo-600',
        },
        {
            label: 'Lihat Scan Dokumen',
            permission: 'icsa-rekon.view',
            icon: ScanLine,
            onClick: () => {
                setOpen(false);
                onScanBa(namaSkpd, row.bulan);
            },
            className: 'text-slate-600',
        },
        { divider: true },
        {
            label: 'Cetak Berita Acara',
            permission: 'icsa-rekon.print',
            icon: Printer,
            onClick: handlePrint,
            className: 'text-slate-600',
        },
        {
            label: 'Download Excel',
            permission: 'icsa-rekon.export',
            icon: FileSpreadsheet,
            external: true,
            href: route('icsa.pengeluaran.rekonsiliasi.excel', row.no_rekon),
            className: 'text-slate-600',
        },
        { divider: true },
        {
            label: 'Hapus Data',
            permission: 'icsa-rekon.delete',
            icon: Trash2,
            onClick: () => {
                setOpen(false);
                onDelete(row.no_rekon, row.bulan);
            },
            className: 'text-rose-600',
        },
    ].filter((item) => item.divider || !item.permission || permissions.includes(item.permission));

    return (
        <>
            <TreaButton ref={buttonRef} type="button" onClick={toggleOpen} variant="secondary">
                <MoreHorizontal size={13} />
                <ChevronDown size={10} className={`transition ${open ? 'rotate-180' : ''}`} />
            </TreaButton>

            {open &&
                createPortal(
                    <TreaCard
                        variant="transparent"
                        padding="none"
                        ref={menuRef}
                        style={{
                            position: 'fixed',
                            top: coords.top,
                            left: coords.left,
                            width: menuWidth,
                        }}
                        className="z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                    >
                        {items.map((item, index) => {
                            if (item.divider) {
                                return <div key={`divider-${index}`} className="my-0.5 border-t border-slate-100" />;
                            }

                            const Icon = item.icon;
                            const itemClass = `flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition hover:bg-slate-50 ${item.className}`;

                            if (item.isLink) {
                                return (
                                    <Link key={item.label} href={item.href} className={itemClass} onClick={() => setOpen(false)}>
                                        <Icon size={12} />
                                        {item.label}
                                    </Link>
                                );
                            }

                            if (item.external) {
                                return (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={itemClass}
                                        onClick={() => setOpen(false)}
                                    >
                                        <Icon size={12} />
                                        {item.label}
                                    </a>
                                );
                            }

                            return (
                                <button type="button" key={item.label} onClick={item.onClick} className={itemClass}>
                                    <Icon size={12} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </TreaCard>,
                    document.body,
                )}
        </>
    );
}

function DetailModal({ detail, onClose }) {
    if (!detail.isOpen) return null;

    const data = detail.data;
    const balancedBku = isBalanced(data?.selisihBku);
    const balancedKas = isBalanced(data?.selisih);

    const summaryItems = [
        { label: 'SP2D', prefix: '+', value: data?.sp2d },
        { label: 'SPJ', prefix: '−', value: data?.spj },
        { label: 'STS', prefix: '−', value: data?.sts },
    ];

    return (
        <TreaDialog
            open={detail.isOpen}
            onClose={onClose}
            title="Detail rekonsiliasi"
            subtitle={detail.bulan}
            icon={Info}
            size="lg"
            scrollable
            footer={
                <div className="flex justify-end">
                    <TreaButton type="button" onClick={onClose} variant="secondary" size="sm">
                        Tutup
                    </TreaButton>
                </div>
            }
        >
            <div className="grid grid-cols-3 gap-3">
                {summaryItems.map((item) => (
                    <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {item.label} ({item.prefix})
                        </span>
                        <span className="mt-1.5 block truncate font-mono text-xs font-bold text-slate-700">{fmt(item.value)}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
                <TreaCard variant="transparent" padding="none" className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Kas SIPD</span>
                    <span className="mt-1.5 block font-mono text-sm font-bold text-indigo-700">{fmt(data?.kasSipd)}</span>
                </TreaCard>
                <TreaCard variant="transparent" padding="none" className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Kas BKU</span>
                    <span className="mt-1.5 block font-mono text-sm font-bold text-slate-700">{fmt(data?.kasBku)}</span>
                </TreaCard>
                <TreaCard variant="transparent" padding="none" className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Kas Riil</span>
                    <span className="mt-1.5 block font-mono text-sm font-bold text-slate-700">{fmt(data?.kasRiil)}</span>
                </TreaCard>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                    { label: 'Selisih A − B (BKU)', value: data?.selisihBku, balanced: balancedBku },
                    { label: 'Selisih A − C (Kas Riil)', value: data?.selisih, balanced: balancedKas },
                ].map((item) => (
                    <div
                        key={item.label}
                        className={`rounded-xl border px-4 py-3 ${
                            item.balanced ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
                        }`}
                    >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</span>
                        <div className="mt-1 flex items-center justify-between gap-2">
                            <span className={`font-mono text-sm font-bold ${item.balanced ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {item.balanced ? '0' : fmt(Math.abs(item.value))}
                            </span>
                            <BalanceBadge value={item.value} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <TreaCard
                    variant="transparent"
                    padding="none"
                    className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600"
                >
                    <p className="mb-1.5 font-semibold text-slate-600">Keterangan Tab B</p>
                    {data?.keteranganBku || <span className="italic text-slate-400">Tidak ada keterangan.</span>}
                </TreaCard>
                <TreaCard
                    variant="transparent"
                    padding="none"
                    className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600"
                >
                    <p className="mb-1.5 font-semibold text-slate-600">Keterangan Tab C</p>
                    {data?.keterangan || <span className="italic text-slate-400">Tidak ada keterangan.</span>}
                </TreaCard>
            </div>
        </TreaDialog>
    );
}

export default function Index({ title, listSkpd = [], selectedSkpd = '', list = [], tahun }) {
    const permissions = usePage().props.auth?.user?.permissions ?? [];
    const canCreate = permissions.includes('icsa-rekon.create');
    const [search, setSearch] = useState('');
    const { loading: scanLoading, run: runDocumentScan } = useAsyncAction();
    const [deletingNoRekon, setDeletingNoRekon] = useState(null);
    const [scanUnavailable, setScanUnavailable] = useState(false);
    const [modalDetail, setModalDetail] = useState({
        isOpen: false,
        bulan: '',
        data: null,
    });

    const namaSkpd = listSkpd.find((item) => item.kode_skpd === selectedSkpd)?.skpd || '';

    const totalSudah = list.filter((row) => row.status === 'SUDAH').length;
    const totalBelum = list.filter((row) => row.status === 'BELUM').length;
    const totalProses = list.filter((row) => row.status === 'PROSES').length;
    const totalSelisih = list.filter((row) => !isBalanced(row.selisih_ab) || !isBalanced(row.selisih_ac)).length;

    const handleSkpdChange = (kodeSkpd) => {
        router.get(route('icsa.pengeluaran.rekonsiliasi.index'), { kode_skpd: kodeSkpd }, { preserveState: true });
    };

    const handleDelete = (noRekon, bulan) => {
        if (deletingNoRekon) return;

        Swal.fire({
            title: 'Hapus rekonsiliasi?',
            text: `Data rekonsiliasi Bulan ${BULAN[bulan]} beserta seluruh transaksi terkait akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                setDeletingNoRekon(noRekon);
                Swal.fire({
                    title: 'Menghapus rekonsiliasi...',
                    text: 'Mohon tunggu hingga proses selesai.',
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });
                router.delete(route('icsa.pengeluaran.rekonsiliasi.destroy', noRekon), {
                    preserveScroll: true,
                    onFinish: () => {
                        setDeletingNoRekon(null);
                        Swal.close();
                    },
                });
            }
        });
    };

    const handleScanBa = async (skpd, bulan) => {
        if (!skpd || !bulan || scanLoading) return;

        try {
            await runDocumentScan(async () => {
                const url = route('icsa.pengeluaran.rekonsiliasi.scan-ba') + `?skpd=${encodeURIComponent(skpd)}&bulan=${bulan}`;
                const response = await fetch(url, {
                    method: 'HEAD',
                    headers: {
                        Accept: 'application/pdf',
                    },
                });

                if (!response.ok) throw new Error('Dokumen tidak tersedia.');
                window.open(url, '_blank', 'noopener,noreferrer');
            });
        } catch {
            setScanUnavailable(true);
        }
    };

    const filtered = list.filter((row) => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return true;

        return (
            (BULAN[row.bulan] || '').toLowerCase().includes(keyword) ||
            row.status?.toLowerCase().includes(keyword) ||
            row.keterangan?.toLowerCase().includes(keyword) ||
            row.no_rekon?.toLowerCase().includes(keyword)
        );
    });

    const closeDetail = () =>
        setModalDetail({
            isOpen: false,
            bulan: '',
            data: null,
        });

    return (
        <>
            <Head title={title} />

            <ScanUnavailableModal isOpen={scanUnavailable} onClose={() => setScanUnavailable(false)} />

            <DetailModal detail={modalDetail} onClose={closeDetail} />

            <TreaLoadingOverlay open={scanLoading} title="Memeriksa dokumen..." compact className="bg-slate-950/30 backdrop-blur-[1px]" />

            <TreaPage size="wide">
                <TreaPageHeader title="Rekonsiliasi Kas ICSA" subtitle="Kelola lembar kerja dan progres rekonsiliasi kas setiap SKPD." />
                <TreaCard
                    variant="toolbar"
                    left={
                        <TreaDropdown
                            floatLabel
                            id="kode_skpd"
                            label="Satuan Kerja Perangkat Daerah"
                            value={selectedSkpd || ''}
                            options={listSkpd}
                            optionLabel="skpd"
                            optionValue="kode_skpd"
                            optionDescription="kode_skpd"
                            placeholder="Pilih atau cari nama instansi"
                            icon={Building2}
                            onChange={(value) => handleSkpdChange(value ?? '')}
                            filter
                            filterBy="kode_skpd,skpd"
                            filterPlaceholder="Cari kode atau nama SKPD"
                            emptyMessage="Data SKPD belum tersedia"
                            emptyFilterMessage="SKPD tidak ditemukan"
                            showClear
                            size="sm"
                            scrollHeight="260px"
                        />
                    }
                    right={
                        canCreate ? (
                            <Link
                                href={
                                    selectedSkpd
                                        ? `${route('icsa.pengeluaran.rekonsiliasi.create')}?kode_skpd=${encodeURIComponent(selectedSkpd)}`
                                        : '#'
                                }
                                className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold text-white transition ${
                                    selectedSkpd ? 'bg-indigo-600 hover:bg-indigo-700' : 'pointer-events-none cursor-not-allowed bg-slate-300'
                                }`}
                            >
                                <Plus size={13} />
                                Tambah Rekonsiliasi
                            </Link>
                        ) : null
                    }
                    toolbarClassName="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
                    rightClassName="w-full lg:w-auto"
                />

                {!selectedSkpd ? (
                    <TreaCard
                        variant="subtle"
                        shadow="none"
                        className="border-dashed border-slate-300"
                        contentClassName="flex flex-col items-center justify-center px-6 py-14 text-center"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                            <Building2 size={22} />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-700">Pilih SKPD terlebih dahulu</p>

                        <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">
                            Lembar kerja rekonsiliasi akan ditampilkan setelah satuan kerja dipilih.
                        </p>
                    </TreaCard>
                ) : (
                    <TreaCard
                        variant="table"
                        title="Lembar Kerja Rekonsiliasi Kas"
                        subtitle={namaSkpd}
                        meta={
                            <>
                                <span>TA {tahun}</span>
                                <span>{list.length} bulan</span>
                                <span>{totalSudah} selesai</span>
                                <span>{totalProses} proses</span>
                                <span>{totalBelum} belum</span>
                                <span className={totalSelisih > 0 ? 'font-semibold text-amber-600' : 'font-semibold text-emerald-600'}>
                                    {totalSelisih > 0 ? `${totalSelisih} ada selisih` : 'Semua balance'}
                                </span>
                            </>
                        }
                        actions={
                            <div className="w-full lg:w-72">
                                <TreaInput
                                    id="search"
                                    label="Cari Data"
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Cari bulan, status, nomor..."
                                    icon={Search}
                                    clearable
                                    floatLabel
                                />
                            </div>
                        }
                        headerClassName="lg:items-center"
                        actionsClassName="w-full lg:w-auto"
                    >
                        {list.length === 0 ? (
                            <div className="px-6 py-14 text-center">
                                <p className="text-sm font-semibold text-slate-700">Belum ada data rekonsiliasi</p>

                                <p className="mt-1 text-xs text-slate-400">Belum ada rekam data untuk Tahun Anggaran {tahun}.</p>
                            </div>
                        ) : (
                            <div className="max-h-[620px] overflow-auto">
                                <table className="w-full min-w-[980px] table-fixed text-xs">
                                    <colgroup>
                                        <col className="w-14" />
                                        <col className="w-[260px]" />
                                        <col className="w-[150px]" />
                                        <col className="w-[190px]" />
                                        <col className="w-[130px]" />
                                        <col className="w-[110px]" />
                                        <col className="w-24" />
                                    </colgroup>
                                    <thead className="sticky top-0 z-20 bg-slate-50">
                                        <tr>
                                            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold uppercase tracking-wider text-slate-400">
                                                No
                                            </th>
                                            <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold uppercase tracking-wider text-slate-400">
                                                Bulan
                                            </th>
                                            <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-400">
                                                Tanggal Rekon
                                            </th>
                                            <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-400">
                                                Selisih A − C
                                            </th>
                                            <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-400">
                                                Status
                                            </th>
                                            <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-400">
                                                Detail
                                            </th>
                                            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold uppercase tracking-wider text-slate-400">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                                    Data pencarian tidak ditemukan.
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((row, index) => {
                                                const warning = row.status !== 'SUDAH';

                                                return (
                                                    <tr
                                                        key={row.no_rekon}
                                                        className={`border-l-4 transition hover:bg-slate-50 ${
                                                            warning ? 'border-l-amber-400' : 'border-l-emerald-400'
                                                        }`}
                                                    >
                                                        <td className="px-3 py-3 text-center text-slate-400">{index + 1}</td>

                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="font-semibold text-slate-800">{BULAN[row.bulan] || row.bulan}</p>

                                                                <p
                                                                    className="mt-0.5 truncate font-mono text-[10px] text-slate-400"
                                                                    title={row.no_rekon}
                                                                >
                                                                    {row.no_rekon}
                                                                </p>
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3 text-center text-slate-500">
                                                            {row.tanggal_rekon
                                                                ? new Date(row.tanggal_rekon).toLocaleDateString('id-ID', {
                                                                      day: '2-digit',
                                                                      month: '2-digit',
                                                                      year: 'numeric',
                                                                  })
                                                                : '—'}
                                                        </td>

                                                        <td className="px-4 py-3 text-center">
                                                            <BalanceBadge value={row.selisih_ac} />
                                                        </td>

                                                        <td className="px-4 py-3 text-center">
                                                            <StatusBadge status={row.status} />
                                                        </td>

                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setModalDetail({
                                                                        isOpen: true,
                                                                        bulan: BULAN[row.bulan] || row.bulan,
                                                                        data: {
                                                                            sp2d: row.total_sp2d,
                                                                            spj: row.total_spj,
                                                                            sts: row.total_sts,
                                                                            kasSipd: row.kas_sipd,
                                                                            kasBku: row.kas_bku,
                                                                            kasRiil: row.kas_riil,
                                                                            selisihBku: row.selisih_ab,
                                                                            selisih: row.selisih_ac,
                                                                            keteranganBku: row.keterangan_bku,
                                                                            keterangan: row.keterangan,
                                                                        },
                                                                    })
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-100"
                                                            >
                                                                <MessageSquare size={11} />
                                                                Detail
                                                            </button>
                                                        </td>

                                                        <td className="px-3 py-3 text-center">
                                                            <AksiDropdown
                                                                row={row}
                                                                selectedSkpd={selectedSkpd}
                                                                namaSkpd={namaSkpd}
                                                                onDelete={handleDelete}
                                                                onScanBa={handleScanBa}
                                                                permissions={permissions}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </TreaCard>
                )}
            </TreaPage>
        </>
    );
}
