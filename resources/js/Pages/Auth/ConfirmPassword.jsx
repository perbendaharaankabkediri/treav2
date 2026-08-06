import TreaButton from '@/components/ui/TreaButton';
import TreaInput from '@/components/ui/TreaInput';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Kata Sandi" />

            <div className="mb-4 text-sm leading-6 text-trea-muted">
                Area ini dilindungi. Konfirmasikan kata sandi Anda sebelum melanjutkan.
            </div>

            <form onSubmit={submit}>
                <div className="mt-4">
                    <TreaInput
                        id="password"
                        type="password"
                        name="password"
                        label="Kata Sandi"
                        value={data.password}
                        autoFocus
                        onChange={(value) => setData('password', value)}
                        error={errors.password}
                        required
                        floatLabel
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <TreaButton type="submit" loading={processing} loadingLabel="Memproses...">
                        Konfirmasi
                    </TreaButton>
                </div>
            </form>
        </GuestLayout>
    );
}
