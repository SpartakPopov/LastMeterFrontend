import React, { useState } from 'react';
import UserSearchDropdown from '../components/UserSearchDropdown';
import { getAllOrderRequests } from '../services/orderRequestService';

const STATUS_STYLE = {
    PENDING:  { bg: '#fef3c7', color: '#b45309' },
    APPROVED: { bg: '#dcfce7', color: '#15803d' },
    REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
    ORDERED:  { bg: '#e0f2fe', color: '#0369a1' },
};

export default function MyOrdersPage() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [allOrders, setAllOrders] = useState([]);
    const [view, setView] = useState('for');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fetched, setFetched] = useState(false);

    async function handleUserSelect(user) {
        setSelectedUser(user);
        if (!user) { setAllOrders([]); setFetched(false); return; }
        setLoading(true);
        setError(null);
        setFetched(false);
        try {
            const all = await getAllOrderRequests();
            setAllOrders(all.filter(o => o.requestedForId === user.id || o.requestedById === user.id));
            setFetched(true);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    const orders = view === 'for'
        ? allOrders.filter(o => selectedUser && o.requestedForId === selectedUser.id)
        : allOrders.filter(o => selectedUser && o.requestedById === selectedUser.id);

    return (
        <div style={styles.page}>
            <main style={styles.main}>
                <div style={styles.shell}>
                    <div style={styles.pageTitle}>
                        <div style={styles.titleIcon}><ListIcon /></div>
                        <div>
                            <h1 style={styles.h1}>My Orders</h1>
                            <p style={styles.subtitle}>Select a user to view their order requests.</p>
                        </div>
                    </div>

                    <div style={styles.selectorCard}>
                        <label style={styles.selectorLabel}>View orders for</label>
                        <div style={styles.selectorInput}>
                            <UserSearchDropdown
                                value={selectedUser}
                                onChange={handleUserSelect}
                                placeholder="Search a user by name…"
                            />
                        </div>
                    </div>

                    {fetched && !loading && (
                        <div style={styles.tabs}>
                            <button
                                style={{ ...styles.tab, ...(view === 'for' ? styles.tabActive : {}) }}
                                onClick={() => setView('for')}
                            >
                                Addressed For Me
                            </button>
                            <button
                                style={{ ...styles.tab, ...(view === 'by' ? styles.tabActive : {}) }}
                                onClick={() => setView('by')}
                            >
                                Ordered
                            </button>
                        </div>
                    )}

                    {loading && <p style={styles.hint}>Loading…</p>}
                    {error && <p style={{ color: '#b91c1c', fontFamily: 'Outfit, sans-serif' }}>{error}</p>}

                    {fetched && !loading && orders.length === 0 && (
                        <div style={styles.emptyCard}>
                            No {view === 'for' ? 'orders addressed to' : 'orders placed by'} <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>.
                        </div>
                    )}

                    {fetched && !loading && orders.length > 0 && (
                        <div style={styles.list}>
                            {orders.map(order => <OrderCard key={order.id} order={order} />)}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function OrderCard({ order }) {
    const sc = STATUS_STYLE[order.status] || { bg: '#f3f4f6', color: '#374151' };
    return (
        <div style={styles.card}>
            <div style={styles.cardTop}>
                <div style={styles.cardMeta}>
                    <span style={styles.orderId}>#{order.id}</span>
                    <span style={{ ...styles.badge, backgroundColor: sc.bg, color: sc.color }}>{order.status}</span>
                </div>
                <div style={styles.userRow}>
                    <span style={styles.userLabel}>Requested by:</span>
                    <span style={styles.userName}>{order.requestedByFirstName} {order.requestedByLastName}</span>
                    <span style={styles.arrow}>→</span>
                    <span style={styles.userLabel}>For:</span>
                    <span style={styles.userName}>{order.requestedForFirstName} {order.requestedForLastName}</span>
                </div>
            </div>

            <div style={styles.cardBody}>
                {order.description && <p style={styles.desc}>{order.description}</p>}
                {order.productLinks && (
                    <div style={styles.linksBlock}>
                        <span style={styles.fieldLabel}>Links</span>
                        <div style={styles.links}>
                            {order.productLinks.split('\n').filter(l => l.trim()).map((link, i) => (
                                <a key={i} href={link.trim()} target="_blank" rel="noreferrer" style={styles.link}>
                                    {link.trim()}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                <div style={styles.metaRow}>
                    <span style={styles.metaItem}><span style={styles.metaKey}>Qty:</span> {order.quantity}</span>
                    {order.managerNotes && (
                        <span style={styles.metaItem}><span style={styles.metaKey}>Note:</span> {order.managerNotes}</span>
                    )}
                </div>
            </div>

            <div style={styles.cardFooter}>
                <span style={styles.date}>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
        </div>
    );
}

function ChevronLeftIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

function ListIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' },
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px', backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 10,
    },
    backBtn: {
        display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px',
        borderRadius: '10px', backgroundColor: '#f3f4f6', color: '#374151',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600,
        cursor: 'pointer', border: 'none',
    },
    logoText: { fontWeight: 700, fontSize: '1rem', color: '#15803d', letterSpacing: '-0.01em' },
    main: { flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 28px 60px' },
    shell: { width: '100%', maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '24px' },
    pageTitle: { display: 'flex', alignItems: 'center', gap: '14px' },
    titleIcon: {
        width: 44, height: 44, borderRadius: '12px',
        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    h1: { fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1.2 },
    subtitle: { fontSize: '0.88rem', color: '#6b7280' },
    selectorCard: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '20px 24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '8px',
    },
    selectorLabel: {
        fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: '#6b7280', fontFamily: 'Outfit, sans-serif',
    },
    selectorInput: { maxWidth: '400px' },
    tabs: {
        display: 'flex', gap: '8px',
        backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '4px', alignSelf: 'flex-start',
    },
    tab: {
        padding: '8px 20px', borderRadius: '9px', border: 'none', cursor: 'pointer',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600,
        color: '#6b7280', backgroundColor: 'transparent', transition: 'all 0.15s',
    },
    tabActive: {
        backgroundColor: '#fff', color: '#15803d',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    },
    hint: { color: '#9ca3af', fontFamily: 'Outfit, sans-serif' },
    emptyCard: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '28px',
        textAlign: 'center', color: '#6b7280', fontFamily: 'Outfit, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontSize: '0.95rem',
    },
    list: { display: 'flex', flexDirection: 'column', gap: '14px' },
    card: {
        backgroundColor: '#fff', borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden',
    },
    cardTop: {
        padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', flexDirection: 'column', gap: '6px',
    },
    cardMeta: { display: 'flex', alignItems: 'center', gap: '10px' },
    orderId: { fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', fontWeight: 700, color: '#374151' },
    badge: { fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px', padding: '2px 8px', letterSpacing: '0.05em' },
    userRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
    userLabel: { fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'Outfit, sans-serif' },
    userName: { fontSize: '0.88rem', fontWeight: 600, color: '#374151', fontFamily: 'Outfit, sans-serif' },
    arrow: { color: '#d1d5db', fontSize: '0.85rem' },
    cardBody: { padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '10px' },
    desc: { fontSize: '0.92rem', color: '#374151', margin: 0, fontFamily: 'Outfit, sans-serif' },
    linksBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
    fieldLabel: { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', fontFamily: 'Outfit, sans-serif' },
    links: { display: 'flex', flexDirection: 'column', gap: '4px' },
    link: { color: '#2563eb', fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif', wordBreak: 'break-all', textDecoration: 'underline' },
    metaRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
    metaItem: { fontSize: '0.85rem', color: '#6b7280', fontFamily: 'Outfit, sans-serif' },
    metaKey: { fontWeight: 600, color: '#374151' },
    cardFooter: {
        padding: '10px 20px', borderTop: '1px solid #f9fafb',
        backgroundColor: '#fafafa',
    },
    date: { fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'Outfit, sans-serif' },
};
