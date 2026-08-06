import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDataTable from '@/components/ui/TreaDataTable';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Eye, Search, X } from 'lucide-react';
import { useState } from 'react';

export default function Index({ logs, filters, options }) {
    const [form, setForm] = useState({
        action: filters.action ?? '',
        module: filters.module ?? '',
        status: filters.status ?? '',
        user_id: filters.user_id ?? '',
        kode_skpd: filters.kode_skpd ?? '',
        role: filters.role ?? '',
        search: filters.search ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
    });
    const [selectedLog, setSelectedLog] = useState(null);
    const [filtering, setFiltering] = useState(false);
    const submit = (event) => {
        event.preventDefault();
        if (filtering) return;
        router.get(route('administrasi.log-aktivitas.index'), form, {
            preserveState: true,
            onStart: () => setFiltering(true),
            onFinish: () => setFiltering(false),
        });
    };
    const field = (name, value) => setForm((current) => ({ ...current, [name]: value }));
    const columns = [
        {
            field: 'created_at',
            header: 'Waktu',
            body: (log) => <span className="whitespace-nowrap text-xs text-slate-500">{new Date(log.created_at).toLocaleString('id-ID')}</span>,
        },
        {
            key: 'user',
            header: 'Pengguna',
            body: (log) => (
                <div>
                    <div className="font-medium text-slate-700">{log.user_name ?? 'Sistem'}</div>
                    <div className="text-xs text-slate-400">{log.role_name ?? '-'}</div>
                </div>
            ),
        },
        {
            key: 'activity',
            header: 'Modul / Aksi',
            body: (log) => (
                <div>
                    <div className="text-xs font-semibold text-slate-600">{log.module}</div>
                    <code className="text-[11px] text-indigo-600">{log.action}</code>
                </div>
            ),
        },
        {
            field: 'description',
            header: 'Keterangan',
            body: (log) => (
                <div className="max-w-md text-xs text-slate-600">
                    {log.description ?? '-'}
                    {log.kode_skpd && <div className="mt-1 text-slate-400">SKPD: {log.kode_skpd}</div>}
                </div>
            ),
        },
        {
            field: 'status',
            header: 'Status',
            body: (log) => <TreaBadge tone={log.status === 'success' ? 'success' : 'danger'}>{log.status}</TreaBadge>,
        },
        {
            key: 'detail',
            header: '',
            body: (log) => (
                <TreaButton size="xs" variant="secondary" icon={Eye} iconOnly aria-label="Lihat detail log" onClick={() => setSelectedLog(log)} />
            ),
        },
    ];

    return (
        <>
            <Head title="Log Aktivitas" />
            <TreaPage size="wide">
                <TreaPageHeader
                    title="Log Aktivitas"
                    subtitle="Jejak audit autentikasi, perubahan akun, permission, dan aktivitas aplikasi."
                    actions={
                        <TreaButton as="a" href={route('administrasi.log-aktivitas.export', form)} icon={Download} variant="secondary">
                            Export CSV
                        </TreaButton>
                    }
                />
                <TreaCard className="mb-5">
                    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <TreaInput
                            value={form.search}
                            onChange={(value) => field('search', value)}
                            placeholder="Deskripsi, pengguna, atau request ID"
                            icon={Search}
                            clearable
                            className="sm:col-span-2 lg:col-span-4"
                        />
                        <TreaDropdown
                            value={form.module}
                            onChange={(value) => field('module', value ?? '')}
                            options={options.modules}
                            placeholder="Semua modul"
                            showClear
                        />
                        <TreaDropdown
                            value={form.action}
                            onChange={(value) => field('action', value ?? '')}
                            options={options.actions}
                            placeholder="Semua aksi"
                            showClear
                        />
                        <TreaDropdown
                            value={form.user_id}
                            onChange={(value) => field('user_id', value ?? '')}
                            options={options.users}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Semua pengguna"
                            filter
                            showClear
                        />
                        <TreaDropdown
                            value={form.status}
                            onChange={(value) => field('status', value ?? '')}
                            options={[
                                { label: 'Berhasil', value: 'success' },
                                { label: 'Gagal', value: 'failed' },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Semua status"
                            showClear
                        />
                        <TreaDropdown
                            value={form.role}
                            onChange={(value) => field('role', value ?? '')}
                            options={options.roles}
                            placeholder="Semua role"
                            showClear
                        />
                        <TreaInput value={form.kode_skpd} onChange={(value) => field('kode_skpd', value)} placeholder="Kode SKPD" clearable />
                        <TreaInput type="date" value={form.date_from} onChange={(value) => field('date_from', value)} ariaLabel="Tanggal awal" />
                        <TreaInput type="date" value={form.date_to} onChange={(value) => field('date_to', value)} ariaLabel="Tanggal akhir" />
                        <div className="flex gap-2">
                            <TreaButton type="submit" icon={Search} fullWidth loading={filtering} loadingLabel="Memuat...">
                                Filter
                            </TreaButton>
                            <TreaButton
                                as={Link}
                                href={route('administrasi.log-aktivitas.index')}
                                variant="secondary"
                                icon={X}
                                iconOnly
                                aria-label="Reset filter"
                                disabled={filtering}
                            />
                        </div>
                    </form>
                </TreaCard>
                <TreaCard padding="none" className="overflow-hidden">
                    <TreaDataTable
                        variant="embedded"
                        data={logs.data}
                        dataKey="id"
                        columns={columns}
                        loading={filtering}
                        paginator={false}
                        emptyTitle="Log aktivitas tidak ditemukan"
                        emptyDescription="Coba ubah atau bersihkan filter pencarian."
                    />
                    {logs.links?.length > 3 && (
                        <div className={`flex flex-wrap justify-center gap-1 border-t p-4 ${filtering ? 'pointer-events-none opacity-50' : ''}`}>
                            {logs.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    onStart={() => setFiltering(true)}
                                    onFinish={() => setFiltering(false)}
                                    className={`rounded px-3 py-1.5 text-xs ${link.active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </TreaCard>
            </TreaPage>
            <TreaDialog
                open={Boolean(selectedLog)}
                onClose={() => setSelectedLog(null)}
                title="Detail Aktivitas"
                subtitle={selectedLog?.request_id ? `Request ID: ${selectedLog.request_id}` : ''}
                icon={Eye}
                size="xl"
                scrollable
            >
                {selectedLog && (
                    <div className="space-y-5 text-sm">
                        <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <span className="text-xs text-slate-400">Pengguna</span>
                                <div className="font-medium">{selectedLog.user_name ?? 'Sistem'}</div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400">Role</span>
                                <div className="font-medium">{selectedLog.role_name ?? '-'}</div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400">Modul</span>
                                <div className="font-medium">{selectedLog.module}</div>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400">Waktu</span>
                                <div className="font-medium">{new Date(selectedLog.created_at).toLocaleString('id-ID')}</div>
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 text-xs font-semibold uppercase text-slate-400">Aksi</div>
                            <code className="text-indigo-600">{selectedLog.action}</code>
                            <p className="mt-2 text-slate-600">{selectedLog.description ?? '-'}</p>
                        </div>
                        <ChangeComparison oldValues={selectedLog.old_values} newValues={selectedLog.new_values} />
                        {selectedLog.metadata && <JsonBlock title="Metadata" value={selectedLog.metadata} />}
                    </div>
                )}
            </TreaDialog>
        </>
    );
}

function ChangeComparison({ oldValues, newValues }) {
    if (!oldValues && !newValues) return null;
    const keys = [...new Set([...Object.keys(oldValues ?? {}), ...Object.keys(newValues ?? {})])];
    const rows = keys.map((key) => ({
        key,
        before: JSON.stringify(oldValues?.[key] ?? null),
        after: JSON.stringify(newValues?.[key] ?? null),
    }));
    const columns = [
        { field: 'key', header: 'Field', bodyClassName: 'font-mono' },
        { field: 'before', header: 'Sebelum', bodyClassName: 'max-w-xs break-all text-rose-600' },
        { field: 'after', header: 'Sesudah', bodyClassName: 'max-w-xs break-all text-emerald-700' },
    ];

    return (
        <div>
            <div className="mb-2 text-xs font-semibold uppercase text-slate-400">Perubahan Data</div>
            <TreaDataTable variant="embedded" data={rows} dataKey="key" columns={columns} paginator={false} size="small" />
        </div>
    );
}

function JsonBlock({ title, value }) {
    return (
        <div>
            <div className="mb-2 text-xs font-semibold uppercase text-slate-400">{title}</div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(value, null, 2)}</pre>
        </div>
    );
}
