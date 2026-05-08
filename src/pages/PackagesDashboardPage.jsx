import React, { useState, useEffect } from 'react';
import { fetchAllPackages } from '../services/packageService';

const STATUSES = ['ALL', 'PENDING', 'ASSIGNED_TO_LOCKER', 'DELIVERED_TO_LOCKER', 'PICKED_UP'];

const STATUS_STYLE = {
    PENDING:             { bg: '#fef3c7', color: '#b45309' },
    ASSIGNED_TO_LOCKER:  { bg: '#e0f2fe', color: '#0369a1' },
    DELIVERED_TO_LOCKER: { bg: '#dcfce7', color: '#15803d' },
    PICKED_UP:           { bg: '#f3e8ff', color: '#7e22ce' },
};

export default function PackagesDashboardPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchAllPackages()
            .then(setPackages)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const visible = filter === 'ALL' ? packages : packages.filter(p => p.status === filter);

    const counts = STATUSES.reduce((acc, s) => {
        acc[s] = s === 'ALL' ? packages.length : packages.filter(p => p.status === s).length;
        return acc;
    }, {});

    return (
        <div style={styles.page}>
            <main style={styles.main}>
                <div style={styles.shell}>
                    <div style={styles.pageTitle}>
                        <div style={styles.titleIcon}><GridIcon /></div>
                        <div>
                            <h1 style={styles.h1}>Packages Dashboard</h1>
                            <p style={styles.subtitle}>All packages and their current status.</p>
                        </div>
                    </div>

                    <div style={styles.filterBar}>
                        {STATUSES.map(s => (
                            <button
                                key={s}
                                style={{
                                    ...styles.filterBtn,
                                    ...(filter === s ? styles.filterBtnActive : {}),
                                }}
                                onClick={() => setFilter(s)}
                            >
                                {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
                                <span style={{
                                    ...styles.filterCount,
                                    ...(filter === s ? styles.filterCountActive : {}),
                                }}>{counts[s]}</span>
                            </button>
                        ))}
                    </div>

                    {loading && <p style={styles.hint}>Loading…</p>}
                    {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
                    {!loading && !error && visible.length === 0 && (
                        <div style={styles.emptyCard}>No packages with status "{filter}".</div>
                    )}

                    {!loading && !error && visible.length > 0 && (
                        <div style={styles.tableWrap}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        {['Tracking Number', 'Description', 'Dimensions', 'Receiver', 'Status'].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((pkg, i) => {
                                        const sc = STATUS_STYLE[pkg.status] || { bg: '#f3f4f6', color: '#374151' };
                                        const dims = [pkg.length, pkg.width, pkg.height].filter(Boolean);
                                        return (
                                            <tr key={pkg.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                                <td style={styles.tdMono}>{pkg.trackingNumber}</td>
                                                <td style={styles.td}>{pkg.description || <span style={styles.none}>—</span>}</td>
                                                <td style={styles.td}>
                                                    {dims.length === 3
                                                        ? <span style={styles.mono}>{dims.join(' × ')} cm</span>
                                                        : <span style={styles.none}>—</span>}
                                                </td>
                                                <td style={styles.td}>
                                                    {pkg.receiverFirstName
                                                        ? `${pkg.receiverFirstName} ${pkg.receiverLastName}`
                                                        : <span style={styles.unclaimed}>Unclaimed</span>}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{ ...styles.badge, backgroundColor: sc.bg, color: sc.color }}>
                                                        {pkg.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
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

function GridIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
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
    shell: { width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '24px' },
    pageTitle: { display: 'flex', alignItems: 'center', gap: '14px' },
    titleIcon: {
        width: 44, height: 44, borderRadius: '12px',
        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    h1: { fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1.2 },
    subtitle: { fontSize: '0.88rem', color: '#6b7280' },
    filterBar: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    filterBtn: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
        backgroundColor: '#fff', color: '#374151', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
    },
    filterBtnActive: {
        backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#15803d',
    },
    filterCount: {
        fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f3f4f6',
        color: '#6b7280', borderRadius: '20px', padding: '1px 7px',
    },
    filterCountActive: { backgroundColor: '#bbf7d0', color: '#15803d' },
    hint: { color: '#9ca3af', fontFamily: 'Outfit, sans-serif' },
    emptyCard: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
        textAlign: 'center', color: '#9ca3af', fontFamily: 'Outfit, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    tableWrap: {
        backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflowX: 'auto',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700,
        color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
        backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6',
        fontFamily: 'Outfit, sans-serif',
    },
    td: {
        padding: '13px 18px', fontSize: '0.9rem', color: '#374151',
        borderBottom: '1px solid #f9fafb', fontFamily: 'Outfit, sans-serif',
        verticalAlign: 'middle',
    },
    tdMono: {
        padding: '13px 18px', fontSize: '0.82rem', color: '#111827',
        borderBottom: '1px solid #f9fafb', fontFamily: 'DM Mono, monospace',
        letterSpacing: '0.04em', verticalAlign: 'middle',
    },
    badge: {
        fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px',
        padding: '3px 9px', letterSpacing: '0.03em', whiteSpace: 'nowrap',
    },
    none: { color: '#d1d5db' },
    mono: { fontFamily: 'DM Mono, monospace', fontSize: '0.82rem' },
    unclaimed: { color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' },
};
