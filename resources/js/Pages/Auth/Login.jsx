import TreaButton from '@/components/ui/TreaButton';
import TreaCheckbox from '@/components/ui/TreaCheckbox';
import TreaDropdown from '@/components/ui/TreaDropdown';
import TreaInput from '@/components/ui/TreaInput';
import { useTreaToast } from '@/components/ui/TreaToast';
import GuestLayout from '@/layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { CalendarDays, Lock, LogIn, UserRound } from 'lucide-react';
import { useEffect } from 'react';

const currentYear = new Date().getFullYear();
const tahunOptions = Array.from({ length: 4 }, (_, index) => {
    const tahun = String(currentYear - 1 + index);

    return { label: tahun, value: tahun };
});

export default function Login({ status }) {
    const toast = useTreaToast();
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
        tahun: String(currentYear),
    });

    useEffect(() => {
        if (status) toast.success(status);
    }, [status, toast]);

    const submit = (event) => {
        event.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Trea" />

            <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] px-5 py-10">
                <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200/40 blur-3xl" />

                <div className="relative w-full max-w-[420px]">
                    <header className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-trea-midnight shadow-lg shadow-slate-900/10">
                            <img src="/trea.png" alt="" className="h-7 w-7 object-contain" />
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Trea</h1>
                        <p className="mt-1.5 text-sm text-slate-400">A tool.</p>
                    </header>

                    <form
                        onSubmit={submit}
                        className="space-y-4 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.28)] backdrop-blur sm:p-8"
                    >
                        <TreaInput
                            id="username"
                            name="username"
                            type="text"
                            label="Username"
                            value={data.username}
                            onChange={(value) => setData('username', value.toLowerCase())}
                            placeholder="Masukkan username"
                            icon={UserRound}
                            autoComplete="username"
                            autoFocus
                            error={errors.username}
                            required
                            size="lg"
                        />

                        <TreaInput
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            value={data.password}
                            onChange={(value) => setData('password', value)}
                            placeholder="Masukkan password"
                            icon={Lock}
                            autoComplete="current-password"
                            error={errors.password}
                            required
                            size="lg"
                        />

                        <TreaDropdown
                            id="tahun"
                            name="tahun"
                            label="Tahun Anggaran"
                            value={data.tahun}
                            onChange={(value) => setData('tahun', value)}
                            options={tahunOptions}
                            optionLabel="label"
                            optionValue="value"
                            icon={CalendarDays}
                            error={errors.tahun}
                            required
                            size="lg"
                        />

                        <div className="py-1">
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                                <TreaCheckbox checked={data.remember} onCheckedChange={(checked) => setData('remember', checked)} />
                                Ingat saya
                            </label>
                        </div>

                        <TreaButton type="submit" icon={LogIn} size="lg" fullWidth loading={processing} loadingLabel="Memproses...">
                            Masuk
                        </TreaButton>
                    </form>
                </div>
            </main>
        </GuestLayout>
    );
}
