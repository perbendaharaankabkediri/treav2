import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AppMenuItem from './AppMenuItem';

export default function AppMenuCategory({ item, active, isOpen, collapsed, onToggle, activeRoute, onNavigate, onDevelopment }) {
    const Icon = item.icon;
    const buttonRef = useRef(null);
    const flyoutRef = useRef(null);
    const [flyoutPosition, setFlyoutPosition] = useState(null);

    const closeFlyout = () => setFlyoutPosition(null);

    const handleCategoryClick = () => {
        if (!collapsed) {
            onToggle();
            return;
        }

        if (flyoutPosition) {
            closeFlyout();
            return;
        }

        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) {
            setFlyoutPosition({
                top: Math.min(rect.top, window.innerHeight - 190),
                left: rect.right + 8,
            });
        }
    };

    useEffect(() => {
        if (!collapsed) closeFlyout();
    }, [collapsed]);

    useEffect(() => {
        if (!flyoutPosition) return undefined;

        const handlePointerDown = (event) => {
            if (buttonRef.current?.contains(event.target) || flyoutRef.current?.contains(event.target)) return;
            closeFlyout();
        };

        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('resize', closeFlyout);
        window.addEventListener('scroll', closeFlyout, true);

        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('resize', closeFlyout);
            window.removeEventListener('scroll', closeFlyout, true);
        };
    }, [flyoutPosition]);

    const children = item.children.map((child) => (
        <AppMenuItem
            key={child.routeName || child.label}
            item={child}
            active={child.routeName ? activeRoute(child.routeName) : false}
            collapsed={false}
            nested
            onNavigate={() => {
                closeFlyout();
                onNavigate?.();
            }}
            onDevelopment={(developmentItem) => {
                closeFlyout();
                onDevelopment(developmentItem);
                onNavigate?.();
            }}
        />
    ));

    return (
        <div className="trea-menu-category">
            <button
                ref={buttonRef}
                type="button"
                className={`trea-menu-item trea-menu-category-trigger ${active ? 'active-parent' : ''}`}
                title={collapsed ? item.label : undefined}
                aria-expanded={collapsed ? Boolean(flyoutPosition) : isOpen}
                onClick={handleCategoryClick}
            >
                <Icon className="trea-menu-item-icon" size={17} strokeWidth={1.8} />
                <span className="trea-menu-item-text">{item.label}</span>
                <ChevronDown className={`trea-menu-category-chevron ${isOpen ? 'open' : ''}`} size={14} />
            </button>

            {!collapsed && isOpen && <div className="trea-menu-children">{children}</div>}

            {collapsed &&
                flyoutPosition &&
                createPortal(
                    <div
                        ref={flyoutRef}
                        className="trea-menu-flyout"
                        style={{
                            top: flyoutPosition.top,
                            left: flyoutPosition.left,
                        }}
                    >
                        <div className="trea-menu-flyout-title">{item.label}</div>
                        <div className="space-y-1">{children}</div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
