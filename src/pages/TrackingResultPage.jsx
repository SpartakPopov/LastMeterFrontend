import React from 'react';
import PackageInfo from '../components/PackageInfo';
import LoadingSpinner from '../components/LoadingSpinner';
import packageImage from '../assets/package.png';
export default function TrackingResultPage({ trackingNumber, packageData, loading, error, onBack, onSearch }) {
    return (
        <div style={styles.page}>
            {/* Top nav */}
            <header style={styles.header}>
                <button onClick={onBack} style={styles.backBtn}>
                    <ChevronLeftIcon />
                    <span>Back</span>
                </button>
                <div style={styles.logo}>
                    <span style={styles.logoText}>LastMeter</span>
                </div>
            </header>

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
                        <PackageInfo pkg={packageData} />
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

function SmallPackageIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
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
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    logoIcon: {
        width: 30,
        height: 30,
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontWeight: 700,
        fontSize: '1rem',
        color: '#15803d',
        letterSpacing: '-0.01em',
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
};