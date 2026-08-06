import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDataTable from '@/components/ui/TreaDataTable';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import TreaToolbar from '@/components/ui/TreaToolbar';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, BadgeCheck, Building2, Pencil, Plus, Search, Trash2, UserCheck, UserRoundCog, Users } from 'lucide-react';
import { useState } from 'react';

export default function Index({ title, list = [] }) {
    const { tahun, auth } = usePage().props;
    const canManage = auth?.user?.permissions?.includes('bendahara.manage') ?? false;
    const [search, setSearch] = useState('');
    const [modalDelete, setModalDelete] = useState({ open: false, id: null, nama: '' });
    const [deleting, setDeleting] = useState(false);

    const filtered = list.filter((row) => {
        const kw = search.toLowerCase();
        return (
            row.nama?.toLowerCase().includes(kw) ||
            row.nip?.toLowerCase().includes(kw) ||
            row.skpd?.skpd?.toLowerCase().includes(kw) ||
            row.jenis?.bendahara?.toLowerCase().includes(kw)
        );
    });

    const handleDelete = () => {
        if (!modalDelete.id || deleting) return;

        setDeleting(true);
        router.delete(route('bendahara.destroy', modalDelete.id), {
            onSuccess: () => setModalDelete({ open: false, id: null, nama: '' }),
            onFinish: () => setDeleting(false),
        });
    };

    const columns = [
        {
            key: 'number',
            header: 'No',
            body: (_row, options) => options.rowIndex + 1,
            align: 'center',
            style: { width: '3.5rem' },
            bodyClassName: 'text-slate-400',
        },
        {
            field: 'nama',
            header: 'Nama Lengkap',
            sortable: true,
            bodyClassName: 'font-medium text-slate-800',
        },
        {
            field: 'nip',
            header: 'NIP',
            sortable: true,
            style: { width: '11rem' },
            body: (row) => <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">{row.nip}</code>,
        },
        {
            key: 'skpd',
            header: 'SKPD',
            body: (row) => row.skpd?.skpd || '-',
            bodyClassName: 'text-slate-600',
        },
        {
            key: 'jenis',
            header: 'Jenis Bendahara',
            style: { width: '13rem' },
            body: (row) => (
                <div>
                    <TreaBadge tone={row.jenis_bendahara === '001' ? 'success' : 'primary'} variant="outline" icon={BadgeCheck}>
                        {row.jenis?.bendahara || '-'}
                    </TreaBadge>
                    {row.bidang_bendahara && <div className="mt-1.5 text-[11px] text-slate-400">{row.bidang_bendahara}</div>}
                </div>
            ),
        },
        ...(canManage
            ? [
                  {
                      key: 'actions',
                      header: 'Aksi',
                      align: 'center',
                      style: { width: '6rem' },
                      body: (row) => (
                          <div className="flex items-center justify-center gap-1">
                              <TreaButton
                                  as={Link}
                                  href={route('bendahara.edit', row.id)}
                                  variant="ghost"
                                  size="xs"
                                  iconOnly
                                  icon={Pencil}
                                  aria-label={`Ubah ${row.nama}`}
                                  title="Ubah Data"
                              />
                              <TreaButton
                                  onClick={() => setModalDelete({ open: true, id: row.id, nama: row.nama })}
                                  variant="ghost"
                                  size="xs"
                                  iconOnly
                                  icon={Trash2}
                                  className="text-trea-danger hover:bg-[var(--trea-danger-soft)] hover:text-trea-danger"
                                  aria-label={`Hapus ${row.nama}`}
                                  title="Hapus Data"
                              />
                          </div>
                      ),
                  },
              ]
            : []),
    ];

    return (
        <>
            <Head title={title} />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Master Bendahara"
                    subtitle="Kelola data bendahara SKPD untuk tahun anggaran aktif."
                    actions={
                        canManage ? (
                            <TreaButton href={route('bendahara.create')} as={Link}>
                                <Plus size={13} />
                                Tambah Bendahara
                            </TreaButton>
                        ) : null
                    }
                />
                {list.length === 0 ? (
                    /* Empty state */
                    <TreaCard
                        variant="transparent"
                        padding="none"
                        className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm"
                    >
                        <Users size={32} className="mx-auto mb-3 text-slate-300" />
                        <h3 className="mb-1 text-sm font-semibold text-slate-700">Data Belum Tersedia</h3>
                        <p className="mb-5 text-xs text-slate-400">Data Bendahara untuk Tahun Anggaran {tahun} belum diinput.</p>
                        {canManage && (
                            <TreaButton href={route('bendahara.create')} as={Link}>
                                <Plus size={13} />
                                Tambah Bendahara
                            </TreaButton>
                        )}
                    </TreaCard>
                ) : (
                    <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="grid gap-3 border-b border-slate-100 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Total Bendahara</p>
                                    <Users size={16} className="text-slate-400" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-800">{list.length}</p>
                            </TreaCard>
                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">Bendahara Pengeluaran</p>
                                    <UserCheck size={16} className="text-emerald-700" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-emerald-700">
                                    {list.filter((row) => row.jenis_bendahara === '001').length}
                                </p>
                            </TreaCard>
                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-indigo-700">BPP</p>
                                    <UserRoundCog size={16} className="text-indigo-700" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-indigo-700">
                                    {list.filter((row) => row.jenis_bendahara === '002').length}
                                </p>
                            </TreaCard>
                            <TreaCard variant="transparent" padding="none" className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">SKPD Terwakili</p>
                                    <Building2 size={16} className="text-slate-500" />
                                </div>
                                <p className="mt-3 text-2xl font-bold text-slate-700">
                                    {new Set(list.map((row) => row.kode_skpd).filter(Boolean)).size}
                                </p>
                            </TreaCard>
                        </div>
                        <TreaToolbar
                            variant="embedded"
                            search={
                                <div className="w-full sm:w-72">
                                    <TreaInput
                                        id="search"
                                        name="search"
                                        value={search}
                                        label="Cari Data"
                                        onChange={setSearch}
                                        placeholder="Cari nama, NIP, atau SKPD..."
                                        icon={Search}
                                        clearable
                                        compact
                                        aria-label="Cari nama, NIP, atau SKPD"
                                        floatLabel
                                    />
                                </div>
                            }
                            result={
                                search && (
                                    <span>
                                        <strong>{filtered.length}</strong> dari {list.length} hasil
                                    </span>
                                )
                            }
                        />

                        {/* Tabel */}
                        <TreaDataTable
                            variant="embedded"
                            data={filtered}
                            dataKey="id"
                            columns={columns}
                            scrollable
                            scrollHeight="66vh"
                            paginator
                            rows={10}
                            emptyIcon={Search}
                            emptyTitle="Data tidak ditemukan"
                            emptyDescription="Coba gunakan nama, NIP, jenis bendahara, atau SKPD yang berbeda."
                        />
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
                loadingLabel="Menghapus data bendahara..."
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton
                            onClick={() => setModalDelete({ open: false, id: null, nama: '' })}
                            variant="secondary"
                            size="sm"
                            disabled={deleting}
                        >
                            Batal
                        </TreaButton>
                        <TreaButton onClick={handleDelete} variant="danger" size="sm" loading={deleting} loadingLabel="Menghapus...">
                            Ya, Hapus
                        </TreaButton>
                    </div>
                }
            >
                <p className="text-xs leading-5 text-trea-muted">Apakah Anda yakin ingin menghapus data bendahara?</p>
                <span className="mt-3 block rounded-lg bg-trea-section px-3 py-2 text-xs font-semibold text-trea-heading">{modalDelete.nama}</span>
            </TreaDialog>
        </>
    );
}
