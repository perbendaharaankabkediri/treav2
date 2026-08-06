import AppMenu from './AppMenu';

export default function AppSidebar({ currentUrl, collapsed, mobileOpen, onNavigate }) {
    const effectivelyCollapsed = collapsed && !mobileOpen;

    return (
        <aside className={['trea-sidebar', effectivelyCollapsed ? 'collapsed' : '', mobileOpen ? 'mobile-open' : ''].join(' ')}>
            <AppMenu currentUrl={currentUrl} collapsed={effectivelyCollapsed} onNavigate={onNavigate} />
        </aside>
    );
}
