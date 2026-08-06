import TreaButton from '@/components/ui/TreaButton';
import TreaDialog from '@/components/ui/TreaDialog';
import TreaInput from '@/components/ui/TreaInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-sm font-semibold text-trea-heading">Hapus Akun</h2>

                <p className="mt-1 text-xs leading-5 text-trea-muted">
                    Penghapusan akun bersifat permanen. Pastikan data yang masih dibutuhkan telah diamankan sebelum melanjutkan.
                </p>
            </header>

            <TreaButton variant="danger" onClick={confirmUserDeletion}>
                Hapus Akun
            </TreaButton>

            <TreaDialog
                open={confirmingUserDeletion}
                onClose={closeModal}
                title="Hapus akun?"
                subtitle="Tindakan ini akan menghapus akun dan seluruh datanya secara permanen."
                tone="danger"
                size="md"
                footer={
                    <div className="flex justify-end gap-2">
                        <TreaButton variant="secondary" onClick={closeModal}>
                            Batal
                        </TreaButton>
                        <TreaButton type="submit" form="delete-user-form" variant="danger" loading={processing} loadingLabel="Deleting...">
                            Hapus Akun
                        </TreaButton>
                    </div>
                }
            >
                <form id="delete-user-form" onSubmit={deleteUser}>
                    <p className="text-sm leading-6 text-slate-600">
                        Masukkan kata sandi untuk mengonfirmasi penghapusan akun secara permanen.
                    </p>

                    <div className="mt-4">
                        <TreaInput
                            id="password"
                            type="password"
                            name="password"
                            label="Kata Sandi"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(value) => setData('password', value)}
                            error={errors.password}
                            autoFocus
                            required
                            floatLabel
                        />
                    </div>
                </form>
            </TreaDialog>
        </section>
    );
}
