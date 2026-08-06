import TreaButton from '@/components/ui/TreaButton';
import TreaCard from '@/components/ui/TreaCard';
import TreaCheckbox from '@/components/ui/TreaCheckbox';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { useTreaToast } from '@/components/ui/TreaToast';
import { Head, useForm } from '@inertiajs/react';
import { Save, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const actionLabels = {
    view: 'Lihat data',
    create: 'Tambah data',
    update: 'Ubah data',
    delete: 'Hapus data',
    manage: 'Kelola',
    print: 'Cetak',
    export: 'Export',
    import: 'Import',
    execute: 'Jalankan proses',
    undo: 'Batalkan proses',
    activate: 'Aktif/nonaktifkan',
    'reset-password': 'Reset kata sandi',
    'assign-skpd': 'Tetapkan SKPD',
    'assign-operator': 'Tetapkan Operator',
    'manage-admin': 'Kelola Admin',
};

function RoleMatrix({ role, permissions, locked }) {
    const toast = useTreaToast();
    const allowed = role.name === 'operator' ? locked.operator_allowed : permissions.filter((permission) => !locked.admin.includes(permission));
    const { data, setData, put, processing, errors, isDirty, setDefaults } = useForm({
        permissions: role.permissions.map((permission) => permission.name).filter((permission) => allowed.includes(permission)),
    });
    const [confirming, setConfirming] = useState(false);
    const grouped = allowed.reduce((result, permission) => {
        const group = permission.split('.')[0];
        result[group] = [...(result[group] ?? []), permission];
        return result;
    }, {});
    const toggle = (permission) =>
        setData(
            'permissions',
            data.permissions.includes(permission) ? data.permissions.filter((item) => item !== permission) : [...data.permissions, permission],
        );
    const toggleGroup = (items) => {
        const allSelected = items.every((permission) => data.permissions.includes(permission));
        setData(
            'permissions',
            allSelected ? data.permissions.filter((permission) => !items.includes(permission)) : [...new Set([...data.permissions, ...items])],
        );
    };
    const save = () =>
        put(route('administrasi.role-permission.update', role.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDefaults('permissions', data.permissions);
                setConfirming(false);
            },
            onError: (validationErrors) => {
                const message = Object.values(validationErrors)[0] ?? 'Permission gagal disimpan. Periksa kembali pilihan akses.';

                toast.error(message);
            },
        });

    return (
        <TreaCard>
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold capitalize text-slate-800">{role.name}</h2>
                    <p className="text-xs text-slate-400">
                        {data.permissions.length} permission aktif {isDirty && <span className="font-semibold text-amber-600">• belum disimpan</span>}
                    </p>
                </div>
                <TreaButton size="sm" icon={Save} loading={processing} disabled={!isDirty} onClick={() => setConfirming(true)}>
                    Simpan
                </TreaButton>
            </div>
            {Object.keys(errors).length > 0 && <p className="mb-3 text-xs text-red-500">{Object.values(errors)[0]}</p>}
            <div className="space-y-4">
                {Object.entries(grouped).map(([group, items]) => (
                    <section key={group}>
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{group.replaceAll('-', ' ')}</h3>
                            <TreaButton type="button" size="xs" variant="ghost" onClick={() => toggleGroup(items)}>
                                {items.every((permission) => data.permissions.includes(permission)) ? 'Batalkan semua' : 'Pilih semua'}
                            </TreaButton>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {items.map((permission) => (
                                <label
                                    key={permission}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50"
                                >
                                    <TreaCheckbox checked={data.permissions.includes(permission)} onCheckedChange={() => toggle(permission)} />
                                    <span>
                                        <span className="block text-xs font-medium text-slate-700">
                                            {actionLabels[permission.split('.').at(-1)] ?? permission.split('.').at(-1)}
                                        </span>
                                        <span className="font-mono text-[10px] text-slate-400">{permission}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
            <TreaDialog
                open={confirming}
                onClose={() => setConfirming(false)}
                title={`Simpan permission ${role.name}?`}
                subtitle="Perubahan akan langsung memengaruhi akses seluruh pengguna dengan role ini."
                icon={ShieldCheck}
                tone="warning"
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton variant="secondary" onClick={() => setConfirming(false)}>
                            Batal
                        </TreaButton>
                        <TreaButton icon={Save} onClick={save} loading={processing}>
                            Simpan Perubahan
                        </TreaButton>
                    </div>
                }
            >
                <p className="text-sm text-slate-600">
                    Role <strong className="capitalize">{role.name}</strong> akan memiliki <strong>{data.permissions.length}</strong> permission.
                </p>
            </TreaDialog>
        </TreaCard>
    );
}

export default function Index({ permissions, roles, locked }) {
    return (
        <>
            <Head title="Role & Permission" />
            <TreaPage size="wide">
                <TreaPageHeader
                    title="Role & Permission"
                    subtitle="Atur akses Admin dan Operator dalam batas keamanan masing-masing role."
                    icon={ShieldCheck}
                />
                <TreaCard className="mb-5 border-indigo-100 bg-indigo-50/60 text-sm text-indigo-800">
                    Permission sensitif Superadmin tidak ditampilkan sebagai pilihan. Operator hanya dapat diberi akses baca, cetak, dan export yang
                    sudah masuk daftar aman.
                </TreaCard>
                <div className="grid items-start gap-5 lg:grid-cols-2">
                    {roles.map((role) => (
                        <RoleMatrix key={role.id} role={role} permissions={permissions} locked={locked} />
                    ))}
                </div>
            </TreaPage>
        </>
    );
}
