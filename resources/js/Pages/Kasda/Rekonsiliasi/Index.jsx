import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaEmptyState from '@/components/ui/TreaEmptyState';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import TreaToolbar from '@/components/ui/TreaToolbar';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Eye, FileText, Plus, Printer, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const formatIDR = (val) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function Index({ title, list = [] }) {
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const filteredList = list.filter((row) => {
        const kw = search.toLowerCase();
        const tanggalFormatted = formatTanggal(row.periode_rekon).toLowerCase();
        return (
            tanggalFormatted.includes(kw) ||
            String(row.selisih).includes(kw) ||
            String(row.saldo_bank_akhir).includes(kw) ||
            String(row.saldo_buku_akhir).includes(kw)
        );
    });

    const handleDelete = (id, tanggal) => {
        setDeleteTarget({ id, tanggal });
    };

    const confirmDelete = () => {
        if (!deleteTarget || deleting) return;

        setDeleting(true);
        router.delete(route('kasda.rekon.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title={title} />
            <TreaDialog
                open={Boolean(deleteTarget)}
                onClose={() => !deleting && setDeleteTarget(null)}
                title="Hapus berita acara?"
                subtitle={deleteTarget ? `Periode ${formatTanggal(deleteTarget.tanggal)} akan dihapus permanen.` : ''}
                icon={Trash2}
                size="sm"
                loading={deleting}
                loadingLabel="Menghapus berita acara..."
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton type="button" variant="secondary" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                            Batal
                        </TreaButton>
                        <TreaButton type="button" variant="danger" size="sm" onClick={confirmDelete} loading={deleting} loadingLabel="Menghapus...">
                            Hapus
                        </TreaButton>
                    </div>
                }
            >
                <p className="text-xs leading-5 text-slate-500">
                    Seluruh rincian penjelasan yang terhubung dengan berita acara ini juga akan dihapus.
                </p>
            </TreaDialog>

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Berita Acara Rekonsiliasi"
                    subtitle="Kelola dokumen berita acara rekonsiliasi Kasda."
                    actions={
                        <TreaButton href={route('kasda.rekon.create')} as={Link}>
                            <Plus size={13} />
                            Tambah Berita Acara
                        </TreaButton>
                    }
                />
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
                                    placeholder="Cari periode, saldo, atau selisih..."
                                    icon={Search}
                                    size="sm"
                                    clearable
                                    floatLabel
                                />
                            </div>
                        }
                        result={
                            <span>
                                <strong>{filteredList.length}</strong> {search ? 'hasil ditemukan' : 'berita acara'}
                            </span>
                        }
                    />

                    {/* Table */}
                    {list.length === 0 ? (
                        <TreaEmptyState
                            icon={FileText}
                            title="Belum ada berita acara rekonsiliasi"
                            description="Tambahkan berita acara pertama untuk memulai proses rekonsiliasi."
                            action={
                                <TreaButton href={route('kasda.rekon.create')} as={Link} size="sm">
                                    <Plus size={13} />
                                    Tambah Berita Acara
                                </TreaButton>
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full whitespace-nowrap text-xs">
                                <thead className="bg-slate-50/75">
                                    <tr>
                                        <th className="w-12 px-4 py-2.5 text-center font-semibold uppercase tracking-wider text-slate-500">No</th>
                                        <th className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-500">
                                            Tanggal Periode
                                        </th>
                                        <th className="px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-slate-500">Saldo Buku</th>
                                        <th className="px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-slate-500">Saldo Bank</th>
                                        <th className="px-4 py-2.5 text-right font-semibold uppercase tracking-wider text-slate-500">Selisih</th>
                                        <th className="w-28 px-4 py-2.5 text-center font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredList.map((row, idx) => {
                                        const isBalance = parseFloat(row.selisih) === 0;
                                        return (
                                            <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                                                <td className="px-4 py-2.5 text-center text-slate-400">{idx + 1}</td>
                                                <td className="px-4 py-2.5 font-semibold text-slate-800">{formatTanggal(row.periode_rekon)}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                                                    Rp {formatIDR(row.saldo_buku_akhir)}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-600">
                                                    Rp {formatIDR(row.saldo_bank_akhir)}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    {isBalance ? (
                                                        <TreaBadge tone="success">
                                                            <CheckCircle2 size={12} />
                                                            Balance
                                                        </TreaBadge>
                                                    ) : (
                                                        <TreaBadge tone="warning">
                                                            <AlertTriangle size={12} />
                                                            Rp {formatIDR(row.selisih)}
                                                        </TreaBadge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <div className="inline-flex items-center gap-1">
                                                        <TreaButton
                                                            href={route('kasda.rekon.show', row.id)}
                                                            as={Link}
                                                            icon={Eye}
                                                            iconOnly
                                                            variant="ghost"
                                                            size="xs"
                                                            aria-label="Lihat detail"
                                                        />
                                                        <TreaButton
                                                            href={route('kasda.rekon.print', row.id)}
                                                            as="a"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            icon={Printer}
                                                            iconOnly
                                                            variant="ghost"
                                                            size="xs"
                                                            aria-label="Cetak PDF"
                                                        />
                                                        <TreaButton
                                                            type="button"
                                                            onClick={() => handleDelete(row.id, row.periode_rekon)}
                                                            icon={Trash2}
                                                            iconOnly
                                                            variant="ghost"
                                                            size="xs"
                                                            aria-label="Hapus berita acara"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </TreaCard>
            </TreaPage>
        </>
    );
}
