import { useTreaToast } from '@/components/ui/TreaToast';
import { usePage } from '@inertiajs/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import AppMenuCategory from './AppMenuCategory';
import AppMenuItem from './AppMenuItem';
import { navigation } from './menu';

let savedScrollTop = 0;

function normalizePath(url) {
    try {
        const path = new URL(url, window.location.origin).pathname;

        return path === '/' ? path : path.replace(/\/+$/, '');
    } catch {
        return '';
    }
}

function routePath(routeName) {
    return normalizePath(route(routeName));
}

export default function AppMenu({ currentUrl, collapsed, onNavigate }) {
    const toast = useTreaToast();
    const menuRef = useRef(null);
    const permissions = usePage().props.auth?.user?.permissions ?? [];
    const currentPath = normalizePath(currentUrl);

    const visibleNavigation = useMemo(() => {
        const can = (item) => !item.permission || permissions.includes(item.permission);

        return navigation
            .map((group) => ({
                ...group,
                items: group.items
                    .filter(can)
                    .map((item) =>
                        item.children
                            ? {
                                  ...item,
                                  children: item.children.filter(can),
                              }
                            : item,
                    )
                    .filter((item) => !item.children || item.children.length > 0),
            }))
            .filter((group) => group.items.length > 0);
    }, [permissions]);

    const activeRoute = (routeName) => {
        const path = routePath(routeName);

        if (!path) return false;
        if (path === '/') return currentPath === '/';

        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    const activeCategory = useMemo(() => {
        for (const group of visibleNavigation) {
            for (const item of group.items) {
                if (item.children?.some((child) => child.routeName && activeRoute(child.routeName))) {
                    return `${group.label}:${item.label}`;
                }
            }
        }
        return null;
    }, [currentPath, visibleNavigation]);

    const [openCategory, setOpenCategory] = useState(activeCategory);

    useEffect(() => {
        if (activeCategory) setOpenCategory(activeCategory);
    }, [activeCategory]);

    useLayoutEffect(() => {
        const menu = menuRef.current;
        if (!menu) return undefined;

        menu.scrollTop = savedScrollTop;

        return () => {
            savedScrollTop = menu.scrollTop;
        };
    }, []);

    const showDevelopmentMessage = (item) => {
        toast.info(`Menu ${item.label} sedang dalam pengembangan.`, {
            title: 'Segera hadir',
            life: 3000,
        });
    };

    return (
        <nav
            ref={menuRef}
            className="trea-sidebar-scroll"
            aria-label="Menu utama"
            onScroll={(event) => {
                savedScrollTop = event.currentTarget.scrollTop;
            }}
        >
            {visibleNavigation.map((group) => (
                <section className="trea-menu-group" key={group.label}>
                    <div className="trea-menu-label">{group.label}</div>

                    <div className="space-y-1">
                        {group.items.map((item) => {
                            const categoryKey = `${group.label}:${item.label}`;

                            if (item.children) {
                                return (
                                    <AppMenuCategory
                                        key={categoryKey}
                                        item={item}
                                        active={item.children.some((child) => child.routeName && activeRoute(child.routeName))}
                                        isOpen={openCategory === categoryKey}
                                        collapsed={collapsed}
                                        activeRoute={activeRoute}
                                        onToggle={() => setOpenCategory((current) => (current === categoryKey ? null : categoryKey))}
                                        onNavigate={onNavigate}
                                        onDevelopment={showDevelopmentMessage}
                                    />
                                );
                            }

                            return (
                                <AppMenuItem
                                    key={item.routeName}
                                    item={item}
                                    active={activeRoute(item.routeName)}
                                    collapsed={collapsed}
                                    onNavigate={onNavigate}
                                    onDevelopment={showDevelopmentMessage}
                                />
                            );
                        })}
                    </div>
                </section>
            ))}
        </nav>
    );
}
