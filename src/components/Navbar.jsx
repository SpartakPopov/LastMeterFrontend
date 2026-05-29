import React, { useState, useEffect } from 'react';

export const SIDEBAR_W = 240;
export const TOPBAR_H = 56;

const NAV_ITEMS = [
    { key: 'home',               label: 'Track Package',       icon: SearchIcon },
    { key: 'create',             label: 'Create Package',      icon: BoxIcon },
    { key: 'createOrderRequest', label: 'New Order Request',   icon: ShoppingIcon },
    { key: 'myOrders',           label: 'My Orders',           icon: ListIcon },
    { key: 'unclaimed',          label: 'Unclaimed Packages',  icon: InboxIcon },
    { key: 'orderRequests',      label: 'Order Requests',      icon: ClipboardIcon },
    { key: 'dashboard',          label: 'Packages Dashboard',  icon: GridIcon },
];

export default function Navbar({ currentPage, onNavigate }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function onResize() {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setOpen(false);
        }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    function navigate(key) {
        onNavigate(key);
        setOpen(false);
    }

    const activeKey = currentPage === 'result' ? 'home' : currentPage;

    if (isMobile) {
        return (
            <>
                <div style={styles.topBar}>
                    <span style={styles.logoText}>LastMeter</span>
                    <button style={styles.burgerBtn} onClick={() => setOpen(o => !o)} aria-label="Menu">
                        {open ? <XIcon /> : <BurgerIcon />}
                    </button>
                </div>

                {open && <div style={styles.overlay} onClick={() => setOpen(false)} />}

                <div style={{ ...styles.drawer, transform: open ? 'translateX(0)' : 'translateX(-100%)' }}>
                    <div style={styles.drawerLogo}>
                        <span style={styles.logoText}>LastMeter</span>
                    </div>
                    <NavList activeKey={activeKey} navigate={navigate} />
                </div>
            </>
        );
    }

    return (
        <div style={styles.sidebar}>
            <div style={styles.sidebarLogo}>
                <div style={styles.logoMark}>LM</div>
                <span style={styles.logoText}>LastMeter</span>
            </div>
            <NavList activeKey={activeKey} navigate={navigate} />
        </div>
    );
}

function NavList({ activeKey, navigate }) {
    return (
        <nav style={styles.nav}>
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                const active = activeKey === key;
                return (
                    <button
                        key={key}
                        style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
                        onClick={() => navigate(key)}
                    >
                        <span style={{ ...styles.navIcon, ...(active ? styles.navIconActive : {}) }}>
                            <Icon />
                        </span>
                        <span style={active ? styles.navLabelActive : styles.navLabel}>{label}</span>
                        {active && <div style={styles.activeBar} />}
                    </button>
                );
            })}
        </nav>
    );
}

/* ── Icons ── */
function SearchIcon() {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function BoxIcon() {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
}
function ShoppingIcon() {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
}
function ListIcon() {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
}
function InboxIcon() {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
}
function ClipboardIcon() {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function GridIcon() {
    return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function BurgerIcon() {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function XIcon() {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

const styles = {
    /* ── Desktop sidebar ── */
    sidebar: {
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: SIDEBAR_W,
        backgroundColor: '#fff',
        borderRight: '1px solid #f3f4f6',
        boxShadow: '1px 0 8px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
        zIndex: 50,
    },
    sidebarLogo: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '20px 18px 16px',
        borderBottom: '1px solid #f3f4f6',
    },
    logoMark: {
        width: 32, height: 32, borderRadius: '9px',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em',
        fontFamily: 'Outfit, sans-serif', flexShrink: 0,
    },
    logoText: {
        fontWeight: 700, fontSize: '1rem', color: '#15803d', letterSpacing: '-0.01em',
        fontFamily: 'Outfit, sans-serif',
    },
    nav: {
        padding: '10px 10px',
        display: 'flex', flexDirection: 'column', gap: '2px',
        flex: 1, overflowY: 'auto',
    },
    navItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 10px', borderRadius: '10px', border: 'none',
        backgroundColor: 'transparent', cursor: 'pointer',
        width: '100%', textAlign: 'left', position: 'relative',
        transition: 'background-color 0.12s',
    },
    navItemActive: {
        backgroundColor: '#f0fdf4',
    },
    navIcon: { color: '#9ca3af', display: 'flex', alignItems: 'center', flexShrink: 0 },
    navIconActive: { color: '#16a34a' },
    navLabel: {
        fontSize: '0.88rem', fontWeight: 500, color: '#6b7280',
        fontFamily: 'Outfit, sans-serif',
    },
    navLabelActive: {
        fontSize: '0.88rem', fontWeight: 700, color: '#15803d',
        fontFamily: 'Outfit, sans-serif',
    },
    activeBar: {
        position: 'absolute', right: 0, top: '20%', bottom: '20%',
        width: 3, borderRadius: '2px', backgroundColor: '#16a34a',
    },

    /* ── Mobile top bar ── */
    topBar: {
        position: 'fixed', top: 0, left: 0, right: 0, height: TOPBAR_H,
        backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 50,
    },
    burgerBtn: {
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#374151', display: 'flex', alignItems: 'center', padding: '4px',
    },

    /* ── Mobile drawer ── */
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 60, transition: 'opacity 0.2s',
    },
    drawer: {
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
        backgroundColor: '#fff', boxShadow: '4px 0 20px rgba(0,0,0,0.12)',
        zIndex: 70, display: 'flex', flexDirection: 'column',
        transition: 'transform 0.25s ease',
    },
    drawerLogo: {
        padding: '16px 18px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center',
        height: TOPBAR_H, boxSizing: 'border-box',
    },
};
