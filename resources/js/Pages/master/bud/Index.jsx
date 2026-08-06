import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaEmptyState from '@/components/ui/TreaEmptyState';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import TreaToolbar from '@/components/ui/TreaToolbar';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, BadgeCheck, BadgeMinus, CalendarDays, Landmark, Pencil, Plus, Search, Trash2, UserRoundCheck } from 'lucide-react';
import { useState } from 'react';

export default function Index({ title, list = [] }) {
    const { tahun } = usePage().props;
    const [search, setSearch] = useState('');
    const [modalDelete, setModalDelete] = useState({ open: false, id: null, nama: '' });
    const [deleting, setDeleting] = useState(false);

    const filteredList = list.filter((row) => {
        const keyword = search.trim().toLowerCase();

        return (
            row.nama?.toLowerCase().includes(keyword) ||
            row.nip?.toLowerCase().includes(keyword) ||
            row.jabatan?.toLowerCase().includes(keyword) ||
            row.tahun?.toString().includes(keyword)
        );
    });

    const jumlahDenganJabatan = list.filter((row) => row.jabatan?.trim()).length;
    const jumlahTanpaJabatan = list.length - jumlahDenganJabatan;

    const handleDelete = () => {
        if (!modalDelete.id || deleting) return;

        setDeleting(true);
        router.delete(route('bud.destroy', modalDelete.id), {
            onSuccess: () => setModalDelete({ open: false, id: null, nama: '' }),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title={title} />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Master Pejabat BUD"
                    subtitle="Kelola data Bendahara Umum Daerah untuk tahun anggaran aktif."
                    actions={
                        <TreaButton href={route('bud.create')} as={Link}>
                            <Plus size={13} />
                            Tambah Pejabat
                        </TreaButton>
                    }
                />
                {list.length === 0 ? (
                    <TreaCard
                        variant="transparent"
                        padding="none"
                        className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm"
                    >
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Landmark size={24} />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-slate-700">Data Pejabat BUD Belum Tersedia</h3>

                        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                            Data Bendahara Umum Daerah untuk Tahun Anggaran {tahun} belum diinput.
                        </p>

                        <TreaButton href={route('bud.create')} as={Link} className="mt-5">
                            <Plus size={13} />
                            Tambah Pejabat BUD
                        </TreaButton>
                    </TreaCard>
                ) : (
                    <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {/* Summary */}
                        <div className="grid gap-3 border-b border-slate-100 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Total Pejabat</p>
                                    <UserRoundCheck size={16} className="text-slate-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-800">{list.length}</p>
                            </TreaCard>

                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-indigo-700">Tahun Aktif</p>
                                    <CalendarDays size={16} className="text-indigo-700" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-indigo-700">{tahun}</p>
                            </TreaCard>

                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Memiliki Jabatan</p>
                                    <BadgeCheck size={16} className="text-emerald-700" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-emerald-700">{jumlahDenganJabatan}</p>
                            </TreaCard>

                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">Jabatan Kosong</p>
                                    <BadgeMinus size={16} className="text-amber-700" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-amber-700">{jumlahTanpaJabatan}</p>
                            </TreaCard>
                        </div>
                        <TreaToolbar
                            variant="embedded"
                            search={
                                <div className="w-full sm:w-80">
                                    <TreaInput
                                        id="search"
                                        name="search"
                                        value={search}
                                        label="Cari Data"
                                        onChange={setSearch}
                                        placeholder="Cari nama, NIP, jabatan, atau tahun..."
                                        icon={Search}
                                        clearable
                                        compact
                                        aria-label="Cari nama, NIP, jabatan, atau tahun"
                                        floatLabel
                                    />
                                </div>
                            }
                            result={
                                search && (
                                    <span>
                                        <strong>{filteredList.length}</strong> dari {list.length} hasil
                                    </span>
                                )
                            }
                        />

                        {/* Table */}
                        <div className="max-h-[66vh] overflow-auto">
                            <table className="min-w-full text-xs">
                                <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                                    <tr>
                                        <th className="w-14 px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-500">No</th>
                                        <th className="w-28 px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-500">Tahun</th>
                                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-slate-500">Nama Lengkap</th>
                                        <th className="w-48 px-4 py-3 text-left font-semibold uppercase tracking-wider text-slate-500">NIP</th>
                                        <th className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-slate-500">Jabatan Pokok</th>
                                        <th className="w-24 px-4 py-3 text-center font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredList.length === 0 ? (
                                        <tr>
                                            <td colSpan={6}>
                                                <TreaEmptyState
                                                    size="sm"
                                                    icon={Search}
                                                    title="Data tidak ditemukan"
                                                    description="Coba gunakan nama, NIP, jabatan, atau tahun yang berbeda."
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredList.map((row, idx) => (
                                            <tr key={row.id} className="group transition-colors hover:bg-indigo-50/40">
                                                <td className="border-l-2 border-transparent px-4 py-3 text-center text-slate-400 transition-colors group-hover:border-indigo-500">
                                                    {idx + 1}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <TreaBadge tone="primary" variant="outline">
                                                        {row.tahun}
                                                    </TreaBadge>
                                                </td>

                                                <td className="px-4 py-3 font-medium text-slate-800">{row.nama}</td>

                                                <td className="px-4 py-3">
                                                    <code className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-semibold tracking-tight text-slate-600">
                                                        {row.nip}
                                                    </code>
                                                </td>

                                                <td className="px-4 py-3">
                                                    {row.jabatan ? (
                                                        <TreaBadge tone="success" variant="outline">
                                                            <BadgeCheck size={11} />
                                                            {row.jabatan}
                                                        </TreaBadge>
                                                    ) : (
                                                        <span className="text-slate-400">Belum diisi</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                                                        <Link
                                                            href={route('bud.edit', row.id)}
                                                            className="p-2 text-amber-600 transition hover:bg-amber-50"
                                                            title="Ubah Data"
                                                        >
                                                            <Pencil size={13} />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => setModalDelete({ open: true, id: row.id, nama: row.nama })}
                                                            className="border-l border-slate-200 p-2 text-red-500 transition hover:bg-red-50"
                                                            title="Hapus Data"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                            <span>Master referensi Pejabat Bendahara Umum Daerah</span>
                            <span>
                                Ditampilkan: <strong className="font-semibold text-slate-600">{filteredList.length}</strong> data
                            </span>
                        </div>
                    </TreaCard>
                )}
            </TreaPage>

            {/* Delete Modal */}
            <TreaDialog
                open={modalDelete.open}
                onClose={() => !deleting && setModalDelete({ open: false, id: null, nama: '' })}
                title="Konfirmasi Hapus"
                subtitle="Tindakan ini tidak dapat dibatalkan."
                icon={AlertTriangle}
                tone="danger"
                size="sm"
                loading={deleting}
                loadingLabel="Menghapus data pejabat BUD..."
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton
                            type="button"
                            onClick={() => setModalDelete({ open: false, id: null, nama: '' })}
                            variant="secondary"
                            size="sm"
                            disabled={deleting}
                        >
                            Batal
                        </TreaButton>
                        <TreaButton type="button" onClick={handleDelete} variant="danger" size="sm" loading={deleting} loadingLabel="Menghapus...">
                            Ya, Hapus
                        </TreaButton>
                    </div>
                }
            >
                <p className="text-xs leading-5 text-trea-muted">Apakah Anda yakin ingin menghapus data pejabat BUD?</p>
                <span className="mt-3 block rounded-lg bg-trea-section px-3 py-2 text-xs font-semibold text-trea-heading">{modalDelete.nama}</span>
            </TreaDialog>
        </>
    );
}
