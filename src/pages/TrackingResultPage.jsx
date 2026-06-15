import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import PackageInfo from '../components/PackageInfo';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TrackingResultPage({ trackingNumber, packageData, loading, error }) {
    const [showQr, setShowQr] = useState(false);
    const [qrUrl, setQrUrl] = useState('');

    useEffect(() => {
        if (trackingNumber) {
            QRCode.toDataURL(trackingNumber, { width: 256, margin: 2 })
                .then(url => setQrUrl(url))
                .catch(() => {});
        }
    }, [trackingNumber]);

    return (
        <div style={styles.page}>
            <main style={styles.main}>
                <div style={styles.container}>
                    {loading && <LoadingSpinner />}

                    {error && !loading && (
                        <div style={styles.errorCard}>
                            <span style={styles.errorIcon}><AlertIcon /></span>
                            <div>
                                <p style={styles.errorTitle}>Package not found</p>
                                <p style={styles.errorMessage}>{error}</p>
                            </div>
                        </div>
                    )}

                    {packageData && !loading && (
                        <>
                            <PackageInfo pkg={packageData} />
                            <div style={styles.qrRow}>
                                <button style={styles.qrBtn} onClick={() => setShowQr(true)}>
                                    <QrIcon /> Show QR Code
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {showQr && (
                <div style={styles.overlay} onClick={() => setShowQr(false)}>
                    <div style={styles.qrModal} onClick={e => e.stopPropagation()}>
                        <p style={styles.qrLabel}>Tracking Number</p>
                        <p style={styles.qrTracking}>{trackingNumber}</p>
                        {qrUrl && <img src={qrUrl} alt="QR code" style={styles.qrImage} />}
                        <button style={styles.closeBtn} onClick={() => setShowQr(false)}>Close</button>
                    </div>
                </div>
            )}
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

function SmallPackageIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
        </svg>
    );
}

function QrIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01M21 14v1M21 18v1M14 21h1M18 21h1" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '8px 14px',
        borderRadius: '10px',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.88rem',
        fontWeight: 600,
        cursor: 'pointer',
        border: 'none',
        transition: 'background-color 0.15s',
    },
    main: {
        flex: 1,
        padding: '24px 16px 40px',
        display: 'flex',
        justifyContent: 'center',
    },
    container: {
        width: '100%',
        maxWidth: '560px',
    },
    errorCard: {
        backgroundColor: '#fff5f5',
        border: '1px solid #fecaca',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
    },
    errorIcon: {
        flexShrink: 0,
        marginTop: '2px',
    },
    errorTitle: {
        fontWeight: 600,
        color: '#991b1b',
        fontSize: '0.95rem',
        marginBottom: '4px',
    },
    errorMessage: {
        color: '#b91c1c',
        fontSize: '0.88rem',
        lineHeight: 1.5,
    },

    logoImage: {
        width: 40,
        height: 40,
        objectFit: 'contain',
    },
    qrRow: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '16px',
    },
    qrBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '10px 22px', borderRadius: '10px',
        border: '1.5px solid #e5e7eb', backgroundColor: '#fff',
        color: '#374151', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    },
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    },
    qrModal: {
        backgroundColor: '#fff', borderRadius: '20px', padding: '32px 28px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        minWidth: '280px',
    },
    qrLabel: {
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: '#9ca3af',
        fontFamily: 'Outfit, sans-serif', margin: 0,
    },
    qrTracking: {
        fontSize: '0.88rem', fontFamily: 'DM Mono, monospace',
        color: '#111827', letterSpacing: '0.04em', margin: 0,
    },
    qrImage: {
        width: 200, height: 200, borderRadius: '8px',
        border: '1px solid #f3f4f6',
    },
    closeBtn: {
        marginTop: '4px', padding: '9px 28px', borderRadius: '10px',
        border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb',
        color: '#374151', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
    },
};
