import TreaBadge from '@/components/ui/TreaBadge';
import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaDataTable from '@/components/ui/TreaDataTable';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { KeyRound, Pencil, Plus, Power, Search, UsersRound, X } from 'lucide-react';
import { useState } from 'react';

export default function Index({ users, filters = {}, options = {} }) {
    const permissions = usePage().props.auth?.user?.permissions ?? [];
    const currentUser = usePage().props.auth?.user;
    const errors = usePage().props.errors ?? {};
    const [resetTarget, setResetTarget] = useState(null);
    const [statusTarget, setStatusTarget] = useState(null);
    const [filterForm, setFilterForm] = useState({
        search: filters.search ?? '',
        role: filters.role ?? '',
        status: filters.status ?? '',
        kode_skpd: filters.kode_skpd ?? '',
    });
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [resetting, setResetting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [filtering, setFiltering] = useState(false);
    const can = (permission) => permissions.includes(permission);

    const toggleStatus = () => {
        if (!statusTarget || updatingStatus) return;

        setUpdatingStatus(true);
        router.patch(
            route('administrasi.akun.toggle-active', statusTarget.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setStatusTarget(null),
                onFinish: () => setUpdatingStatus(false),
            },
        );
    };

    const resetPassword = (event) => {
        event.preventDefault();
        setResetting(true);
        router.put(
            route('administrasi.akun.reset-password', resetTarget.id),
            {
                password,
                password_confirmation: passwordConfirmation,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setResetTarget(null);
                    setPassword('');
                    setPasswordConfirmation('');
                },
                onFinish: () => setResetting(false),
            },
        );
    };
    const columns = [
        {
            key: 'account',
            header: 'Akun',
            body: (user) => (
                <div>
                    <div className="font-semibold text-slate-700">{user.name}</div>
                    <div className="text-xs text-slate-400">@{user.username}</div>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            body: (user) => {
                const role = user.roles?.[0]?.name;
                return <TreaBadge tone={role === 'superadmin' ? 'danger' : role === 'admin' ? 'primary' : 'neutral'}>{role}</TreaBadge>;
            },
        },
        {
            key: 'skpd',
            header: 'Penugasan SKPD',
            body: (user) =>
                user.roles?.[0]?.name === 'operator' ? (
                    <>
                        <TreaBadge tone="neutral">{user.skpd_assignments?.length ?? 0} SKPD</TreaBadge>
                        <div className="mt-1 max-w-xs truncate text-xs text-slate-400">
                            {user.skpd_assignments?.map((item) => item.kode_skpd).join(', ')}
                        </div>
                    </>
                ) : (
                    <span className="text-xs text-slate-500">Semua SKPD</span>
                ),
        },
        {
            key: 'status',
            header: 'Status',
            body: (user) => <TreaBadge tone={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Aktif' : 'Nonaktif'}</TreaBadge>,
        },
        {
            key: 'actions',
            header: 'Aksi',
            alignHeader: 'right',
            body: (user) => {
                const role = user.roles?.[0]?.name;
                const protectedAccount = role === 'superadmin' || user.id === currentUser.id;
                return (
                    <div className="flex justify-end gap-2">
                        {can('users.update') && !protectedAccount && (
                            <TreaButton as={Link} href={route('administrasi.akun.edit', user.id)} size="xs" variant="secondary" icon={Pencil}>
                                Edit
                            </TreaButton>
                        )}
                        {can('users.reset-password') && !protectedAccount && (
                            <TreaButton size="xs" variant="secondary" icon={KeyRound} onClick={() => setResetTarget(user)}>
                                Reset
                            </TreaButton>
                        )}
                        {can('users.activate') && !protectedAccount && (
                            <TreaButton size="xs" variant={user.is_active ? 'danger' : 'success'} icon={Power} onClick={() => setStatusTarget(user)}>
                                {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </TreaButton>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Manajemen Akun" />
            <TreaPage size="wide">
                <TreaPageHeader
                    title="Manajemen Akun"
                    subtitle="Kelola role, status akun, kata sandi, dan penugasan SKPD."
                    actions={
                        can('users.create') && (
                            <TreaButton as={Link} href={route('administrasi.akun.create')} icon={Plus}>
                                Tambah Akun
                            </TreaButton>
                        )
                    }
                />
                <TreaCard className="mb-5">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (filtering) return;
                            router.get(route('administrasi.akun.index'), filterForm, {
                                preserveState: true,
                                onStart: () => setFiltering(true),
                                onFinish: () => setFiltering(false),
                            });
                        }}
                        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
                    >
                        <TreaInput
                            value={filterForm.search}
                            onChange={(value) => setFilterForm({ ...filterForm, search: value })}
                            placeholder="Cari nama atau username"
                            icon={Search}
                            clearable
                            className="lg:col-span-2"
                        />
                        <TreaDropdown
                            value={filterForm.role}
                            onChange={(value) => setFilterForm({ ...filterForm, role: value ?? '' })}
                            options={options.roles ?? []}
                            placeholder="Semua role"
                            showClear
                        />
                        <TreaDropdown
                            value={filterForm.status}
                            onChange={(value) => setFilterForm({ ...filterForm, status: value ?? '' })}
                            options={[
                                { label: 'Aktif', value: 'active' },
                                { label: 'Nonaktif', value: 'inactive' },
                            ]}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Semua status"
                            showClear
                        />
                        <div className="flex gap-2">
                            <TreaButton type="submit" icon={Search} fullWidth loading={filtering} loadingLabel="Memuat...">
                                Filter
                            </TreaButton>
                            <TreaButton
                                as={Link}
                                href={route('administrasi.akun.index')}
                                variant="secondary"
                                icon={X}
                                iconOnly
                                aria-label="Reset filter"
                            />
                        </div>
                        <TreaDropdown
                            value={filterForm.kode_skpd}
                            onChange={(value) => setFilterForm({ ...filterForm, kode_skpd: value ?? '' })}
                            options={options.skpds ?? []}
                            optionLabel="skpd"
                            optionValue="kode_skpd"
                            placeholder="Semua penugasan SKPD"
                            filter
                            showClear
                            className="sm:col-span-2 lg:col-span-5"
                        />
                    </form>
                </TreaCard>
                <TreaCard padding="none" className="overflow-hidden">
                    <TreaDataTable
                        variant="embedded"
                        data={users.data}
                        dataKey="id"
                        columns={columns}
                        loading={filtering}
                        paginator={false}
                        emptyIcon={UsersRound}
                        emptyTitle="Belum ada akun"
                        emptyDescription="Belum ada akun yang dapat dikelola dengan filter ini."
                    />
                    {users.links?.length > 3 && (
                        <div className={`flex flex-wrap justify-center gap-1 border-t p-4 ${filtering ? 'pointer-events-none opacity-50' : ''}`}>
                            {users.links.map((link, index) => (
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
                open={Boolean(resetTarget)}
                onClose={() => setResetTarget(null)}
                title="Reset Kata Sandi"
                subtitle={resetTarget ? `Tetapkan kata sandi baru untuk ${resetTarget.name}.` : ''}
                icon={KeyRound}
                loading={resetting}
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton variant="secondary" onClick={() => setResetTarget(null)}>
                            Batal
                        </TreaButton>
                        <TreaButton type="submit" form="reset-password-form" icon={KeyRound} loading={resetting} loadingLabel="Mereset...">
                            Reset
                        </TreaButton>
                    </div>
                }
            >
                <form id="reset-password-form" onSubmit={resetPassword}>
                    <div className="mt-5 space-y-4">
                        <TreaInput
                            type="password"
                            label="Kata sandi baru"
                            value={password}
                            onChange={setPassword}
                            autoComplete="new-password"
                            error={errors.password}
                            autoFocus
                        />
                        <TreaInput
                            type="password"
                            label="Konfirmasi kata sandi"
                            value={passwordConfirmation}
                            onChange={setPasswordConfirmation}
                            autoComplete="new-password"
                        />
                    </div>
                </form>
            </TreaDialog>
            <TreaDialog
                open={Boolean(statusTarget)}
                onClose={() => !updatingStatus && setStatusTarget(null)}
                title={statusTarget?.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                subtitle={statusTarget?.is_active ? 'Seluruh sesi aktif pengguna akan dihentikan.' : 'Pengguna akan dapat masuk kembali ke aplikasi.'}
                icon={Power}
                tone={statusTarget?.is_active ? 'danger' : 'success'}
                loading={updatingStatus}
                loadingLabel="Memperbarui status akun..."
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton variant="secondary" onClick={() => setStatusTarget(null)} disabled={updatingStatus}>
                            Batal
                        </TreaButton>
                        <TreaButton
                            variant={statusTarget?.is_active ? 'danger' : 'success'}
                            onClick={toggleStatus}
                            loading={updatingStatus}
                            loadingLabel="Memproses..."
                        >
                            Konfirmasi
                        </TreaButton>
                    </div>
                }
            >
                <p className="text-sm text-slate-600">
                    Anda akan {statusTarget?.is_active ? 'menonaktifkan' : 'mengaktifkan'} akun <strong>{statusTarget?.name}</strong>.
                </p>
            </TreaDialog>
        </>
    );
}
