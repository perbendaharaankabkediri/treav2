import { Link } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Landmark, ShieldCheck } from 'lucide-react';

export default function AuthPage({ eyebrow, title, description, icon: Icon, children, footer, width = 'max-w-[470px]' }) {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
            <section className="relative hidden overflow-hidden bg-trea-midnight px-12 py-10 text-white lg:flex lg:flex-col">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />

                <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                        <img src="/trea.png" alt="" className="h-7 w-7 object-contain" />
                    </div>
                    <div>
                        <p className="text-lg font-bold tracking-[0.2em]">TREA</p>
                        <p className="text-xs text-blue-100/60">Treasury Reconciliation Application</p>
                    </div>
                </div>

                <div className="relative my-auto max-w-xl pb-10">
                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-blue-100">
                        <ShieldCheck size={14} />
                        Sistem Keuangan Pemerintah Daerah
                    </div>
                    <h2 className="text-4xl font-semibold leading-tight tracking-tight">Rekonsiliasi treasury yang lebih tertib dan terpercaya.</h2>
                    <p className="mt-5 max-w-lg text-sm leading-7 text-blue-100/65">
                        Satu ruang kerja untuk memantau, mencocokkan, dan memastikan data perbendaharaan tetap akurat.
                    </p>

                    <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                            <Landmark size={18} className="text-indigo-300" />
                            <p className="mt-3 text-sm font-semibold">Data terpusat</p>
                            <p className="mt-1 text-xs leading-5 text-blue-100/55">Informasi treasury dalam satu sistem.</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                            <BadgeCheck size={18} className="text-emerald-300" />
                            <p className="mt-3 text-sm font-semibold">Akses terkontrol</p>
                            <p className="mt-1 text-xs leading-5 text-blue-100/55">Digunakan oleh petugas yang berwenang.</p>
                        </div>
                    </div>
                </div>

                <p className="relative text-xs text-blue-100/45">Pemerintah Kabupaten Kediri</p>
            </section>

            <main className="relative flex min-h-screen flex-col bg-trea-ground">
                <div className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/75 px-5 backdrop-blur sm:px-8 lg:border-0 lg:bg-transparent">
                    <div className="flex items-center gap-2.5 lg:hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-trea-midnight">
                            <img src="/trea.png" alt="" className="h-5 w-5 object-contain" />
                        </div>
                        <span className="text-sm font-bold tracking-[0.18em] text-slate-800">TREA</span>
                    </div>
                    <span className="hidden lg:block" />
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800"
                    >
                        <ArrowLeft size={14} />
                        Kembali
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
                    <div className={`w-full ${width}`}>
                        <div className="mb-7">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-trea-primary ring-1 ring-indigo-100">
                                <Icon size={22} strokeWidth={1.9} />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-trea-primary">{eyebrow}</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-trea-heading">{title}</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                        </div>

                        {children}

                        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
                    </div>
                </div>
            </main>
        </div>
    );
}
