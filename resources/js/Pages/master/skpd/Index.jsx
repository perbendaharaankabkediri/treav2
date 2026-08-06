import TreaBadge from '@/components/ui/TreaBadge';
import TreaCard from '@/components/ui/TreaCard';
import TreaDataTable from '@/components/ui/TreaDataTable';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import TreaToolbar from '@/components/ui/TreaToolbar';
import { Head } from '@inertiajs/react';
import { Building2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Index({ title, list = [] }) {
    const [search, setSearch] = useState('');

    const filteredList = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return list;
        }

        return list.filter((row) => {
            const kode = String(row.kode_skpd ?? '').toLowerCase();
            const nama = String(row.skpd ?? '').toLowerCase();

            return kode.includes(keyword) || nama.includes(keyword);
        });
    }, [list, search]);

    const columns = useMemo(
        () => [
            {
                key: 'number',
                header: 'No',
                body: (_row, options) => options.rowIndex + 1,
                align: 'center',
                style: { width: '4rem' },
                bodyClassName: 'text-slate-400',
            },
            {
                field: 'kode_skpd',
                header: 'Kode SKPD',
                sortable: true,
                style: { width: '13rem' },
                body: (row) => (
                    <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono font-semibold tracking-tight text-slate-600">
                        {row.kode_skpd}
                    </span>
                ),
            },
            {
                field: 'skpd',
                header: 'Nama SKPD',
                sortable: true,
                bodyClassName: 'font-medium text-slate-800',
            },
        ],
        [],
    );

    return (
        <>
            <Head title={title} />

            <TreaPage size="wide">
                <TreaPageHeader
                    title="Master SKPD"
                    subtitle="Referensi seluruh Satuan Kerja Perangkat Daerah yang digunakan dalam aplikasi."
                    actions={
                        <TreaBadge tone="primary" variant="outline" size="md">
                            {list.length} SKPD
                        </TreaBadge>
                    }
                />
                <TreaCard variant="transparent" padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                                    placeholder="Cari kode atau nama SKPD..."
                                    icon={Search}
                                    clearable
                                    compact
                                    aria-label="Cari kode atau nama SKPD"
                                    floatLabel
                                />
                            </div>
                        }
                        result={
                            search && (
                                <span>
                                    Menampilkan <strong>{filteredList.length}</strong> dari {list.length} SKPD untuk pencarian “{search}”.
                                </span>
                            )
                        }
                    />

                    {/* Table */}
                    <TreaDataTable
                        variant="embedded"
                        data={filteredList}
                        dataKey={(row) => row.id ?? row.kode_skpd}
                        columns={columns}
                        scrollable
                        scrollHeight="68vh"
                        emptyIcon={Building2}
                        emptyTitle={search ? 'SKPD tidak ditemukan' : 'Data SKPD belum tersedia'}
                        emptyDescription={
                            search ? 'Coba gunakan kode atau nama SKPD yang berbeda.' : 'Data akan tampil setelah master SKPD tersedia.'
                        }
                    />

                    {/* Footer */}
                    <div className="flex flex-col gap-1 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                        <span>Master referensi Satuan Kerja Perangkat Daerah</span>
                        <span>
                            Ditampilkan: <strong className="font-semibold text-slate-600">{filteredList.length}</strong> data
                        </span>
                    </div>
                </TreaCard>
            </TreaPage>
        </>
    );
}
