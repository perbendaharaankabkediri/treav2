import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaCheckbox from '@/components/ui/TreaCheckbox';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaInput from '@/components/ui/TreaInput';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { useTreaToast } from '@/components/ui/TreaToast';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useMemo, useState } from 'react';

const actionLabels = {
    view: 'Lihat data',
    create: 'Tambah data',
    update: 'Ubah data',
    delete: 'Hapus data',
    manage: 'Kelola',
    print: 'Cetak',
    export: 'Export',
    execute: 'Jalankan proses',
    undo: 'Batalkan proses',
    activate: 'Aktif/nonaktifkan',
    'reset-password': 'Reset kata sandi',
    'assign-skpd': 'Tetapkan SKPD',
    'assign-operator': 'Tetapkan Operator',
    'manage-admin': 'Kelola Admin',
};

export default function Form({ account, roles, skpds, permissions = [], rolePermissions = {}, canManageAccountPermissions = false }) {
    const editing = Boolean(account);
    const toast = useTreaToast();
    const [skpdSearch, setSkpdSearch] = useState('');
    const { data, setData, post, put, processing, errors } = useForm({
        name: account?.name ?? '',
        username: account?.username ?? '',
        password: '',
        password_confirmation: '',
        role: account?.roles?.[0]?.name ?? roles[0] ?? 'operator',
        ...(canManageAccountPermissions ? { permissions: account?.permissions?.map((permission) => permission.name) ?? [] } : {}),
        skpd_codes: account?.skpd_assignments?.map((item) => item.kode_skpd) ?? [],
    });
    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onError: (validationErrors) => {
                const message = Object.values(validationErrors)[0] ?? 'Akun gagal disimpan. Periksa kembali data yang diisi.';

                toast.error(message);
            },
        };

        if (editing) {
            put(route('administrasi.akun.update', account.id), options);
        } else {
            post(route('administrasi.akun.store'), options);
        }
    };
    const toggleSkpd = (code) =>
        setData('skpd_codes', data.skpd_codes.includes(code) ? data.skpd_codes.filter((item) => item !== code) : [...data.skpd_codes, code]);
    const inheritedPermissions = rolePermissions[data.role] ?? [];
    const availablePermissions = useMemo(() => {
        const allowed =
            data.role === 'operator'
                ? permissions.filter(
                      (permission) =>
                          inheritedPermissions.includes(permission.name) ||
                          [
                              'dashboard.view',
                              'icsa-rekon.view',
                              'icsa-rekon.print',
                              'icsa-rekon.export',
                              'icsa-rekap.view',
                              'laporan.export',
                              'bendahara.view',
                          ].includes(permission.name),
                  )
                : permissions.filter((permission) => !['roles.manage', 'permissions.manage', 'users.manage-admin'].includes(permission.name));

        return allowed.reduce((groups, permission) => {
            const group = permission.name.split('.')[0];
            groups[group] = [...(groups[group] ?? []), permission.name];
            return groups;
        }, {});
    }, [data.role, inheritedPermissions, permissions]);
    const changeRole = (role) => {
        setData((current) => ({
            ...current,
            role,
            ...(canManageAccountPermissions
                ? { permissions: current.permissions.filter((permission) => !(rolePermissions[role] ?? []).includes(permission)) }
                : {}),
        }));
    };
    const togglePermission = (permission) =>
        setData(
            'permissions',
            data.permissions.includes(permission) ? data.permissions.filter((item) => item !== permission) : [...data.permissions, permission],
        );
    const visibleSkpds = useMemo(() => {
        const keyword = skpdSearch.trim().toLowerCase();
        return keyword ? skpds.filter((skpd) => `${skpd.kode_skpd} ${skpd.skpd}`.toLowerCase().includes(keyword)) : skpds;
    }, [skpdSearch, skpds]);
    const allVisibleSelected = visibleSkpds.length > 0 && visibleSkpds.every((skpd) => data.skpd_codes.includes(skpd.kode_skpd));
    const toggleVisible = () =>
        setData(
            'skpd_codes',
            allVisibleSelected
                ? data.skpd_codes.filter((code) => !visibleSkpds.some((skpd) => skpd.kode_skpd === code))
                : [...new Set([...data.skpd_codes, ...visibleSkpds.map((skpd) => skpd.kode_skpd)])],
        );

    return (
        <>
            <Head title={editing ? 'Edit Akun' : 'Tambah Akun'} />
            <TreaPage size="form">
                <TreaPageHeader title={editing ? 'Edit Akun' : 'Tambah Akun'} subtitle="Tentukan identitas, role, dan lingkup SKPD pengguna." />
                <TreaCard>
                    <form onSubmit={submit} noValidate className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TreaInput label="Nama" value={data.name} onChange={(value) => setData('name', value)} error={errors.name} required />
                            <TreaInput
                                label="Username"
                                value={data.username}
                                onChange={(value) => setData('username', value.toLowerCase())}
                                error={errors.username}
                                autoComplete="username"
                                required
                            />
                            {!editing && (
                                <>
                                    <TreaInput
                                        type="password"
                                        label="Kata Sandi"
                                        value={data.password}
                                        onChange={(value) => setData('password', value)}
                                        error={errors.password}
                                        required
                                    />
                                    <TreaInput
                                        type="password"
                                        label="Konfirmasi Kata Sandi"
                                        value={data.password_confirmation}
                                        onChange={(value) => setData('password_confirmation', value)}
                                        error={errors.password_confirmation}
                                        required
                                    />
                                </>
                            )}
                            <TreaDropdown
                                name="role"
                                label="Role"
                                value={data.role}
                                options={roles}
                                onChange={changeRole}
                                error={errors.role}
                                required
                            />
                        </div>
                        {canManageAccountPermissions && (
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
                                <div className="mb-4">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">Permission khusus akun</div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Permission ini ditambahkan khusus untuk akun. Permission bertanda “Dari role” sudah aktif otomatis.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(availablePermissions).map(([group, items]) => (
                                        <section key={group}>
                                            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                                {group.replaceAll('-', ' ')}
                                            </h3>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {items.map((permission) => {
                                                    const inherited = inheritedPermissions.includes(permission);
                                                    return (
                                                        <label
                                                            key={permission}
                                                            className={`flex items-center gap-2 rounded-lg border p-2.5 ${inherited ? 'cursor-default bg-slate-50' : 'cursor-pointer bg-white hover:bg-slate-50'}`}
                                                        >
                                                            <TreaCheckbox
                                                                checked={inherited || data.permissions.includes(permission)}
                                                                disabled={inherited}
                                                                onCheckedChange={() => !inherited && togglePermission(permission)}
                                                            />
                                                            <span className="min-w-0">
                                                                <span className="block text-xs font-medium text-slate-700">
                                                                    {actionLabels[permission.split('.').at(-1)] ?? permission.split('.').at(-1)}
                                                                    {inherited && (
                                                                        <span className="ml-2 text-[10px] font-semibold text-indigo-500">
                                                                            Dari role
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <span className="block truncate font-mono text-[10px] text-slate-400">
                                                                    {permission}
                                                                </span>
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                                {(errors.permissions || errors['permissions.0']) && (
                                    <p className="mt-2 text-xs text-red-500">{errors.permissions || errors['permissions.0']}</p>
                                )}
                            </div>
                        )}
                        {data.role === 'operator' && (
                            <div>
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">SKPD yang dapat diakses</div>
                                        <div className="text-[11px] text-slate-400">
                                            {data.skpd_codes.length} dari {skpds.length} dipilih
                                        </div>
                                    </div>
                                    <TreaButton type="button" size="xs" variant="secondary" onClick={toggleVisible}>
                                        {allVisibleSelected ? 'Batal pilih hasil' : 'Pilih semua hasil'}
                                    </TreaButton>
                                </div>
                                <TreaInput
                                    value={skpdSearch}
                                    onChange={setSkpdSearch}
                                    placeholder="Cari kode atau nama SKPD"
                                    clearable
                                    className="mb-2"
                                />
                                <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border p-3">
                                    {visibleSkpds.map((skpd) => (
                                        <label
                                            key={skpd.kode_skpd}
                                            className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50"
                                        >
                                            <TreaCheckbox
                                                className="mt-1"
                                                checked={data.skpd_codes.includes(skpd.kode_skpd)}
                                                onCheckedChange={() => toggleSkpd(skpd.kode_skpd)}
                                            />
                                            <span>
                                                <span className="font-mono text-xs text-slate-500">{skpd.kode_skpd}</span>
                                                <span className="ml-2 text-sm text-slate-700">{skpd.skpd}</span>
                                            </span>
                                        </label>
                                    ))}
                                    {!visibleSkpds.length && <p className="p-4 text-center text-xs text-slate-400">SKPD tidak ditemukan.</p>}
                                </div>
                                {(errors.skpd_codes || errors['skpd_codes.0']) && (
                                    <p className="mt-1 text-xs text-red-500">{errors.skpd_codes || errors['skpd_codes.0']}</p>
                                )}
                            </div>
                        )}
                        <div className="flex justify-end gap-2 border-t pt-4">
                            <TreaButton as={Link} href={route('administrasi.akun.index')} variant="secondary" icon={ArrowLeft}>
                                Kembali
                            </TreaButton>
                            <TreaButton type="submit" loading={processing} icon={Save}>
                                Simpan
                            </TreaButton>
                        </div>
                    </form>
                </TreaCard>
            </TreaPage>
        </>
    );
}
