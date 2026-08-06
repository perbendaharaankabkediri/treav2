import TreaFlashToast from '@/components/ui/TreaFlashToast';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';

export default function AppLayout({ children }) {
    const { auth, tahunAnggaran } = usePage().props;
    const { url } = usePage();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [activityOpen, setActivityOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
        setProfileOpen(false);
        setActivityOpen(false);
    }, [url]);

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setMobileOpen((value) => !value);
            return;
        }

        setCollapsed((value) => !value);
    };

    return (
        <div className={['trea-layout', collapsed ? 'sidebar-collapsed' : ''].join(' ')}>
            <TreaFlashToast />
            <AppTopbar
                user={auth?.user}
                fiscalYear={tahunAnggaran}
                collapsed={collapsed}
                profileOpen={profileOpen}
                activityOpen={activityOpen}
                onToggleSidebar={toggleSidebar}
                onToggleProfile={() => {
                    setActivityOpen(false);
                    setProfileOpen((value) => !value);
                }}
                onToggleActivity={() => {
                    setProfileOpen(false);
                    setActivityOpen((value) => !value);
                }}
            />

            <AppSidebar currentUrl={url} collapsed={collapsed} mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

            <button
                type="button"
                className={`trea-overlay ${mobileOpen ? 'visible' : ''}`}
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
            />

            <div className="trea-content-shell">
                <main className="trea-content">
                    <div key={url} className="trea-page-transition">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
