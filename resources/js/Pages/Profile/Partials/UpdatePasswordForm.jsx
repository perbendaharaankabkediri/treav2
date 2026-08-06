import TreaButton from '@/components/ui/TreaButton';
import TreaInput from '@/components/ui/TreaInput';
import { useTreaToast } from '@/components/ui/TreaToast';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const toast = useTreaToast();
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Password berhasil diperbarui.');
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-sm font-semibold text-trea-heading">
                    Perbarui Kata Sandi
                </h2>

                <p className="mt-1 text-xs leading-5 text-trea-muted">
                    Gunakan kata sandi yang panjang dan unik untuk menjaga keamanan akun.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <TreaInput
                        id="current_password"
                        name="current_password"
                        label="Kata Sandi Saat Ini"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(value) => setData('current_password', value)}
                        type="password"
                        autoComplete="current-password"
                        error={errors.current_password}
                        required
                        floatLabel
                    />

                <TreaInput
                        id="password"
                        name="password"
                        label="Kata Sandi Baru"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(value) => setData('password', value)}
                        type="password"
                        autoComplete="new-password"
                        error={errors.password}
                        required
                        floatLabel
                    />

                <TreaInput
                        id="password_confirmation"
                        name="password_confirmation"
                        label="Konfirmasi Kata Sandi"
                        value={data.password_confirmation}
                        onChange={(value) => setData('password_confirmation', value)}
                        type="password"
                        autoComplete="new-password"
                        error={errors.password_confirmation}
                        required
                        floatLabel
                    />

                <div className="flex items-center gap-4">
                    <TreaButton type="submit" loading={processing} loadingLabel="Menyimpan...">Simpan</TreaButton>

                </div>
            </form>
        </section>
    );
}
