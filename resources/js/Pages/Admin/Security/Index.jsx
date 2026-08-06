import TreaBadge from '@/components/ui/TreaBadge';
import TreaCard from '@/components/ui/TreaCard';
import TreaPage from '@/components/ui/TreaPage';
import TreaPageHeader from '@/components/ui/TreaPageHeader';
import { Head } from '@inertiajs/react';
import { Activity, ShieldAlert, UserCheck, UserRoundCog, UserX, UsersRound } from 'lucide-react';

function Stat({ label, value, icon: Icon, tone = 'indigo' }) {
    const tones = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        amber: 'bg-amber-50 text-amber-600',
    };
    return (
        <TreaCard>
            <div className="flex items-center gap-4">
                <div className={`rounded-xl p-3 ${tones[tone]}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                    <div className="text-xs text-slate-500">{label}</div>
                </div>
            </div>
        </TreaCard>
    );
}

function formatBytes(bytes) {
    if (bytes === null || bytes === undefined) return 'Tidak tersedia';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index += 1;
    }
    return `${value.toFixed(index ? 1 : 0)} ${units[index]}`;
}

export default function Index({ accounts, activity, recentFailures, recentPermissionChanges, systemHealth }) {
    return (
        <>
            <Head title="Dashboard Keamanan" />
            <TreaPage size="wide">
                <TreaPageHeader
                    title="Dashboard Keamanan"
                    subtitle="Ringkasan akun dan aktivitas keamanan dalam tujuh hari terakhir."
                    icon={ShieldAlert}
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat label="Total akun" value={accounts.total} icon={UsersRound} />
                    <Stat label="Akun aktif" value={accounts.active} icon={UserCheck} tone="emerald" />
                    <Stat label="Akun nonaktif" value={accounts.inactive} icon={UserX} tone="rose" />
                    <Stat label="Aktivitas gagal (7 hari)" value={activity.failed_7_days} icon={ShieldAlert} tone="amber" />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <Stat label="Superadmin" value={accounts.superadmin} icon={UserRoundCog} />
                    <Stat label="Admin" value={accounts.admin} icon={UserRoundCog} />
                    <Stat label="Operator" value={accounts.operator} icon={UserRoundCog} />
                </div>
                <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
                    <TreaCard className="lg:col-span-2">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="font-bold text-slate-800">Kesehatan Sistem</h2>
                            <span className="text-xs text-slate-400">
                                Database: {formatBytes(systemHealth.database_size)} · Retensi log: {systemHealth.activity_logs.retention_days} hari
                            </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {systemHealth.checks.map((check) => (
                                <div key={check.name} className="rounded-xl border border-slate-100 p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-slate-700">{check.name}</span>
                                        <TreaBadge tone={check.status === 'healthy' ? 'success' : check.status === 'warning' ? 'warning' : 'danger'}>
                                            {check.status}
                                        </TreaBadge>
                                    </div>
                                    <p className="mt-1 text-[11px] text-slate-400">{check.detail}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <span className="text-slate-400">Environment</span>
                                <div className="font-semibold">{systemHealth.runtime.environment}</div>
                            </div>
                            <div>
                                <span className="text-slate-400">Debug</span>
                                <div className={systemHealth.runtime.debug ? 'font-semibold text-rose-600' : 'font-semibold text-emerald-600'}>
                                    {systemHealth.runtime.debug ? 'Aktif' : 'Nonaktif'}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-400">Session / Queue</span>
                                <div className="font-semibold">
                                    {systemHealth.runtime.session_driver} / {systemHealth.runtime.queue_connection}
                                </div>
                            </div>
                            <div>
                                <span className="text-slate-400">Activity log</span>
                                <div className="font-semibold">
                                    {systemHealth.activity_logs.total} total · {systemHealth.activity_logs.expired} melewati retensi
                                </div>
                            </div>
                        </div>
                    </TreaCard>
                    <TreaCard>
                        <h2 className="mb-4 font-bold text-slate-800">Aktivitas per Modul</h2>
                        <div className="space-y-3">
                            {activity.by_module.map((item) => (
                                <div key={item.module} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                    <span className="text-sm text-slate-600">{item.module}</span>
                                    <TreaBadge tone="primary">{item.total}</TreaBadge>
                                </div>
                            ))}
                        </div>
                        {!activity.by_module.length && <p className="text-sm text-slate-400">Belum ada aktivitas dalam tujuh hari terakhir.</p>}
                    </TreaCard>
                    <TreaCard>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800">Aktivitas Gagal Terbaru</h2>
                            <TreaBadge tone="danger">{activity.failed_logins_7_days} login gagal</TreaBadge>
                        </div>
                        <div className="divide-y">
                            {recentFailures.map((log) => (
                                <div key={log.id} className="py-3">
                                    <div className="flex justify-between gap-3">
                                        <code className="text-xs text-rose-600">{log.action}</code>
                                        <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {log.user_name ?? 'Sistem'} · {log.module}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {!recentFailures.length && <p className="text-sm text-slate-400">Tidak ada aktivitas gagal.</p>}
                    </TreaCard>
                    <TreaCard className="lg:col-span-2">
                        <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
                            <Activity size={16} /> Perubahan Permission Terbaru
                        </h2>
                        <div className="divide-y">
                            {recentPermissionChanges.map((log) => (
                                <div key={log.id} className="flex flex-col justify-between gap-1 py-3 sm:flex-row">
                                    <div>
                                        <code className="text-xs text-indigo-600">{log.action}</code>
                                        <p className="text-xs text-slate-500">{log.description}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {log.user_name} · {new Date(log.created_at).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {!recentPermissionChanges.length && <p className="text-sm text-slate-400">Belum ada perubahan permission.</p>}
                    </TreaCard>
                </div>
            </TreaPage>
        </>
    );
}
