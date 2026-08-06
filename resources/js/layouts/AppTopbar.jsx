import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    CalendarDays,
    CheckCheck,
    ChevronDown,
    CircleAlert,
    History,
    Info,
    Loader2,
    LogOut,
    Menu,
    Settings,
    UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';

function initials(name = '') {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();
}

function roleLabel(role) {
    const labels = {
        superadmin: 'Superadmin',
        admin: 'Admin',
        operator: 'Operator',
    };

    return labels[role] ?? 'Pengguna';
}

export default function AppTopbar({ user, fiscalYear, collapsed, profileOpen, activityOpen, onToggleSidebar, onToggleProfile, onToggleActivity }) {
    const { props, url } = usePage();
    const { activityCenter, activityUnreadCount = 0 } = props;
    const [activeTab, setActiveTab] = useState('notifications');
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityRequestedUrl, setActivityRequestedUrl] = useState(null);
    const [markingReadId, setMarkingReadId] = useState(null);
    const [markingAllRead, setMarkingAllRead] = useState(false);
    const notifications = activityCenter?.notifications ?? [];
    const logs = activityCenter?.logs ?? [];
    const unreadCount = activityCenter?.unread_count ?? activityUnreadCount;

    useEffect(() => {
        if (!activityOpen || activityCenter !== undefined || activityLoading || activityRequestedUrl === url) {
            return;
        }

        setActivityRequestedUrl(url);
        router.reload({
            only: ['activityCenter'],
            preserveScroll: true,
            onStart: () => setActivityLoading(true),
            onFinish: () => setActivityLoading(false),
        });
    }, [activityCenter, activityLoading, activityOpen, activityRequestedUrl, url]);

    const markRead = (item) => {
        if (!item.read_at && !markingReadId && !markingAllRead) {
            setMarkingReadId(item.id);
            router.patch(
                route('notifications.read', item.id),
                {},
                {
                    preserveScroll: true,
                    only: ['activityCenter', 'activityUnreadCount'],
                    onFinish: () => setMarkingReadId(null),
                },
            );
        }
    };

    const markAllRead = () => {
        if (markingAllRead || markingReadId) return;

        setMarkingAllRead(true);
        router.patch(
            route('notifications.read-all'),
            {},
            {
                preserveScroll: true,
                only: ['activityCenter', 'activityUnreadCount'],
                onFinish: () => setMarkingAllRead(false),
            },
        );
    };

    return (
        <header className="trea-topbar">
            <div className="trea-brand">
                <img src="/trea.png" alt="TREA" className="trea-brand-logo" />
                <span className="trea-brand-name">TREA</span>
            </div>

            <button type="button" className="trea-icon-button" onClick={onToggleSidebar} aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}>
                <Menu size={20} />
            </button>

            <div className="trea-topbar-actions">
                <div className="trea-fiscal-year">
                    <CalendarDays size={16} />
                    <span>T.A. {fiscalYear ?? new Date().getFullYear()}</span>
                    <ChevronDown size={14} />
                </div>

                <div className="relative">
                    <button
                        type="button"
                        className="trea-icon-button relative"
                        aria-label={`Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ''}`}
                        aria-expanded={activityOpen}
                        onClick={onToggleActivity}
                    >
                        <Bell size={19} />
                        {unreadCount > 0 && <span className="trea-notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                    </button>

                    {activityOpen && (
                        <div className="trea-activity-center">
                            <div className="trea-activity-header">
                                <div>
                                    <div className="font-bold text-slate-800">Pusat Aktivitas</div>
                                    <div className="text-xs text-slate-400">Notifikasi penting dan jejak aktivitas terbaru</div>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        className="trea-activity-read-all"
                                        onClick={markAllRead}
                                        disabled={markingAllRead || Boolean(markingReadId)}
                                        aria-busy={markingAllRead || undefined}
                                    >
                                        {markingAllRead ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                                        {markingAllRead ? 'Memproses...' : 'Baca semua'}
                                    </button>
                                )}
                            </div>

                            <div className="trea-activity-tabs">
                                <button
                                    type="button"
                                    className={activeTab === 'notifications' ? 'active' : ''}
                                    onClick={() => setActiveTab('notifications')}
                                >
                                    <Bell size={14} /> Notifikasi
                                    {unreadCount > 0 && <span>{unreadCount}</span>}
                                </button>
                                <button type="button" className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
                                    <History size={14} /> Log Aktivitas
                                </button>
                            </div>

                            <div className="trea-activity-list">
                                {activityLoading ? (
                                    <div className="flex items-center justify-center gap-2 px-5 py-10 text-xs text-slate-400" role="status">
                                        <Loader2 size={15} className="animate-spin" />
                                        Memuat aktivitas...
                                    </div>
                                ) : activeTab === 'notifications' ? (
                                    notifications.length ? (
                                        notifications.map((item) => (
                                            <button
                                                type="button"
                                                key={item.id}
                                                className={`trea-activity-item ${item.read_at ? '' : 'unread'}`}
                                                onClick={() => markRead(item)}
                                                disabled={markingAllRead || (Boolean(markingReadId) && markingReadId !== item.id)}
                                                aria-busy={markingReadId === item.id || undefined}
                                            >
                                                {markingReadId === item.id ? (
                                                    <span className={`trea-severity-icon ${item.severity}`}>
                                                        <Loader2 size={16} className="animate-spin" />
                                                    </span>
                                                ) : (
                                                    <SeverityIcon severity={item.severity} />
                                                )}
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-start justify-between gap-3">
                                                        <span className="font-semibold text-slate-700">{item.title}</span>
                                                        <span className="whitespace-nowrap text-[10px] text-slate-400">
                                                            {relativeTime(item.created_at)}
                                                        </span>
                                                    </span>
                                                    <span className="mt-1 block text-xs leading-5 text-slate-500">{item.message}</span>
                                                    <span className="mt-1 block text-[10px] text-slate-400">
                                                        {item.actor ?? 'Sistem'} · {item.module}
                                                    </span>
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <ActivityEmpty text="Belum ada notifikasi penting." />
                                    )
                                ) : logs.length ? (
                                    logs.map((item) => (
                                        <div key={item.id} className="trea-activity-item">
                                            <span className={`trea-log-status ${item.status}`} />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-start justify-between gap-3">
                                                    <code className="text-[11px] font-semibold text-indigo-600">{item.action}</code>
                                                    <span className="whitespace-nowrap text-[10px] text-slate-400">
                                                        {relativeTime(item.created_at)}
                                                    </span>
                                                </span>
                                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                                    {item.description ?? `${item.user_name ?? 'Sistem'} menjalankan aktivitas.`}
                                                </span>
                                                <span className="mt-1 block text-[10px] text-slate-400">
                                                    {item.user_name ?? 'Sistem'} · {item.module}
                                                </span>
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <ActivityEmpty text="Belum ada aktivitas terbaru." />
                                )}
                            </div>

                            {activeTab === 'logs' && activityCenter?.can_view_all_logs && (
                                <Link href={route('administrasi.log-aktivitas.index')} className="trea-activity-footer">
                                    Lihat semua log aktivitas
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                <button type="button" className="trea-icon-button" aria-label="Pengaturan">
                    <Settings size={19} />
                </button>

                <div className="relative">
                    <button type="button" className="trea-user-button" onClick={onToggleProfile} aria-expanded={profileOpen}>
                        <span className="trea-user-avatar">{initials(user?.name)}</span>

                        <span className="trea-user-meta">
                            <span className="trea-user-name block">{user?.name ?? 'Pengguna'}</span>
                            <span className="trea-user-role block">{roleLabel(user?.role)}</span>
                        </span>

                        <ChevronDown size={14} className="text-slate-400" />
                    </button>

                    {profileOpen && (
                        <div className="trea-profile-menu">
                            <Link href={route('profile.edit')} className="trea-profile-link">
                                <UserRound size={16} />
                                Profil Saya
                            </Link>

                            <Link href={route('logout')} method="post" as="button" className="trea-profile-link text-red-600">
                                <LogOut size={16} />
                                Keluar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function SeverityIcon({ severity }) {
    const Icon = severity === 'critical' ? CircleAlert : severity === 'warning' ? AlertTriangle : Info;
    return (
        <span className={`trea-severity-icon ${severity}`}>
            <Icon size={16} />
        </span>
    );
}

function ActivityEmpty({ text }) {
    return <div className="px-5 py-10 text-center text-xs text-slate-400">{text}</div>;
}

function relativeTime(value) {
    const date = new Date(value);
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

    if (seconds < 60) return 'baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mnt`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari`;

    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}
