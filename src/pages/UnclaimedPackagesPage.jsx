import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { fetchUnassignedPackages } from '../services/packageService';

export default function UnclaimedPackagesPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrModal, setQrModal] = useState(null);

    useEffect(() => {
        fetchUnassignedPackages()
            .then(setPackages)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={styles.page}>
            <main style={styles.main}>
                <div style={styles.shell}>
                    <div style={styles.pageTitle}>
                        <div style={styles.titleIcon}><InboxIcon /></div>
                        <div>
                            <h1 style={styles.h1}>Unclaimed Packages</h1>
                            <p style={styles.subtitle}>Packages that haven't been assigned to a recipient yet.</p>
                        </div>
                    </div>

                    {loading && <p style={styles.hint}>Loading…</p>}
                    {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
                    {!loading && !error && packages.length === 0 && (
                        <div style={styles.emptyCard}>No unclaimed packages at the moment.</div>
                    )}

                    {!loading && !error && packages.length > 0 && (
                        <div style={styles.grid}>
                            {packages.map(pkg => (
                                <PackageCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    onShowQR={() => setQrModal(pkg.trackingNumber)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {qrModal && (
                <QRModal trackingNumber={qrModal} onClose={() => setQrModal(null)} />
            )}
        </div>
    );
}

function PackageCard({ pkg, onShowQR }) {
    return (
        <div style={styles.card}>
            <div style={styles.cardTop}>
                <span style={styles.trackingNum}>{pkg.trackingNumber}</span>
                <span style={styles.statusBadge}>UNCLAIMED</span>
            </div>
            {pkg.description && <p style={styles.desc}>{pkg.description}</p>}
            <div style={styles.dims}>
                {[pkg.length, pkg.width, pkg.height].filter(Boolean).length > 0 && (
                    <span style={styles.dimText}>
                        {[pkg.length, pkg.width, pkg.height].filter(Boolean).join(' × ')} cm
                    </span>
                )}
            </div>
            <button style={styles.qrBtn} onClick={onShowQR}>
                <QRIcon /> Get QR Code
            </button>
        </div>
    );
}

function QRModal({ trackingNumber, onClose }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, trackingNumber, { width: 220, margin: 2 });
        }
    }, [trackingNumber]);

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Tracking QR Code</h2>
                <p style={styles.modalSubtitle}>{trackingNumber}</p>
                <canvas ref={canvasRef} style={styles.qrCanvas} />
                <p style={styles.modalHint}>Scan this code to track the package</p>
                <button style={styles.closeBtn} onClick={onClose}>Close</button>
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

function InboxIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
    );
}

function QRIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17h0M17 14h3" />
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
    shell: { width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '28px' },
    pageTitle: { display: 'flex', alignItems: 'center', gap: '14px' },
    titleIcon: {
        width: 44, height: 44, borderRadius: '12px',
        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    h1: { fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1.2 },
    subtitle: { fontSize: '0.88rem', color: '#6b7280' },
    hint: { color: '#9ca3af', fontFamily: 'Outfit, sans-serif' },
    emptyCard: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
        textAlign: 'center', color: '#9ca3af', fontFamily: 'Outfit, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
    card: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '10px',
    },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    trackingNum: {
        fontFamily: 'DM Mono, monospace', fontSize: '0.88rem', fontWeight: 600,
        color: '#111827', letterSpacing: '0.04em',
    },
    statusBadge: {
        fontSize: '0.7rem', fontWeight: 700, color: '#b45309',
        backgroundColor: '#fef3c7', borderRadius: '6px', padding: '2px 8px',
        letterSpacing: '0.05em',
    },
    desc: { fontSize: '0.88rem', color: '#6b7280', fontFamily: 'Outfit, sans-serif', margin: 0 },
    dims: { minHeight: 16 },
    dimText: { fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'DM Mono, monospace' },
    qrBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '4px', padding: '9px 0', borderRadius: '10px',
        border: '1.5px solid #d1fae5', backgroundColor: '#f0fdf4', color: '#15803d',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
    },
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    },
    modal: {
        backgroundColor: '#fff', borderRadius: '20px', padding: '36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxWidth: '320px', width: '90%',
    },
    modalTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 },
    modalSubtitle: { fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: '#6b7280', margin: 0 },
    qrCanvas: { borderRadius: '12px', border: '1px solid #f3f4f6' },
    modalHint: { fontSize: '0.8rem', color: '#9ca3af', margin: 0, textAlign: 'center' },
    closeBtn: {
        marginTop: '4px', padding: '9px 28px', borderRadius: '10px', border: 'none',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer',
    },
};
