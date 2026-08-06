import { Head, Link } from '@inertiajs/react';
import { LayoutDashboard, LogIn } from 'lucide-react';

export default function Welcome({ auth, tahun }) {
    const currentYear = tahun || new Date().getFullYear();

    return (
        <>
            <Head title="Selamat Datang" />

            <div className="relative min-h-screen overflow-hidden bg-[#060b17] font-sans text-slate-400 antialiased">
                {/* Grid background */}
                <div
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
                        `,
                        backgroundSize: '48px 48px',
                        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)',
                    }}
                />

                {/* Blue glow */}
                <div
                    className="pointer-events-none absolute z-0"
                    style={{
                        top: '-160px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '700px',
                        height: '400px',
                        background: 'radial-gradient(ellipse at center, rgba(30,58,138,0.22) 0%, transparent 70%)',
                    }}
                />

                <div className="relative z-10">
                    {/* Topbar */}
                    <nav className="flex h-[46px] items-center justify-between border-b border-white/[0.05] bg-[#0f172a]/80 px-6 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-[#1E3A8A]">
                                <img
                                    src="/trea.png"
                                    alt="Logo"
                                    className="h-4 w-4 object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = '<span class="text-[10px] font-black text-white">T</span>';
                                    }}
                                />
                            </div>
                            <span className="text-[13px] font-bold tracking-[4px] text-white">TREA</span>
                        </div>

                        <div className="flex items-center gap-1">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#1e40af]"
                                >
                                    <LayoutDashboard size={13} />
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                                >
                                    <LogIn size={13} />
                                    Masuk
                                </Link>
                            )}
                        </div>
                    </nav>

                    {/* Hero */}
                    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
                        {/* Badge T.A. */}
                        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/10 px-3 py-1">
                            <span className="h-[5px] w-[5px] shrink-0 animate-pulse rounded-full bg-blue-400" />
                            <span className="text-[11px] font-semibold tracking-wide text-blue-300">T.A. {currentYear}</span>
                        </div>

                        <h1 className="mb-4 text-[clamp(28px,5vw,42px)] font-bold leading-[1.15] tracking-tight text-white">
                            Trea<span className="text-blue-400">sury</span>
                        </h1>

                        <p className="mx-auto mb-8 max-w-md text-[14px] leading-[1.75] text-slate-500">"tools"</p>

                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-5 py-2 text-[12.5px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1e40af]"
                                >
                                    <LayoutDashboard size={14} />
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-5 py-2 text-[12.5px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1e40af]"
                                >
                                    <LogIn size={14} />
                                    Masuk
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-auto max-w-xl px-6">
                        <div className="h-px bg-white/[0.04]" />
                    </div>
                </div>
            </div>
        </>
    );
}
