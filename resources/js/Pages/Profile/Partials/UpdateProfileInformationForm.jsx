import TreaButton from '@/components/ui/TreaButton';
import TreaInput from '@/components/ui/TreaInput';
import { useTreaToast } from '@/components/ui/TreaToast';
import { useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({ className = '' }) {
    const toast = useTreaToast();
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing } = useForm({
        name: user.name,
        username: user.username,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            onSuccess: () => toast.success('Informasi profil berhasil diperbarui.'),
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-sm font-semibold text-trea-heading">Informasi Profil</h2>

                <p className="mt-1 text-xs leading-5 text-trea-muted">Perbarui nama dan username akun Anda.</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <TreaInput
                        id="name"
                        name="name"
                        label="Nama"
                        value={data.name}
                        onChange={(value) => setData('name', value)}
                        error={errors.name}
                        required
                        autoFocus
                        autoComplete="name"
                        clearable
                        floatLabel
                    />

                <TreaInput
                        id="username"
                        name="username"
                        label="Username"
                        value={data.username}
                        onChange={(value) => setData('username', value.toLowerCase())}
                        error={errors.username}
                        required
                        autoComplete="username"
                        clearable
                        floatLabel
                    />

                <div className="flex items-center gap-4">
                    <TreaButton type="submit" loading={processing} loadingLabel="Menyimpan...">Simpan</TreaButton>
                </div>
            </form>
        </section>
    );
}
