import { Link } from '@inertiajs/react';

export default function AppMenuItem({ item, active, collapsed, onNavigate, onDevelopment, nested = false }) {
    const Icon = item.icon;

    if (item.development) {
        return (
            <button
                type="button"
                title={collapsed ? item.label : undefined}
                className={`trea-menu-item ${nested ? 'nested' : ''}`}
                onClick={() => onDevelopment?.(item)}
            >
                <Icon className="trea-menu-item-icon" size={17} strokeWidth={1.8} />
                <span className="trea-menu-item-text">{item.label}</span>
            </button>
        );
    }

    return (
        <Link
            href={route(item.routeName)}
            prefetch={!active}
            title={collapsed ? item.label : undefined}
            className={`trea-menu-item ${nested ? 'nested' : ''} ${active ? 'active' : ''}`}
            onClick={onNavigate}
        >
            <Icon className="trea-menu-item-icon" size={17} strokeWidth={1.8} />
            <span className="trea-menu-item-text">{item.label}</span>
        </Link>
    );
}
