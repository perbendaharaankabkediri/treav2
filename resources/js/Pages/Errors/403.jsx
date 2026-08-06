import { Head, Link } from '@inertiajs/react';
import { ShieldX } from 'lucide-react';

export default function Forbidden() {
    return (
        <>
            <Head title="Akses Ditolak" />
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
                <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                        <ShieldX size={28} />
                    </span>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">403</p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900">Akses tidak tersedia</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        Akun Anda tidak memiliki izin untuk membuka halaman atau menjalankan tindakan ini.
                    </p>
                    <Link
                        href={route('dashboard')}
                        className="mt-7 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                        Kembali ke dashboard
                    </Link>
                </section>
            </main>
        </>
    );
}
