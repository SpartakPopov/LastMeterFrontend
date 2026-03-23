import React from 'react';
import SearchBar from '../components/SearchBar';

export default function HomePage({ onSearch, loading }) {
    return (
        <div style={styles.page}>
            {/* Background blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />

            <div style={styles.content}>
                <div style={styles.logoMark}>
                    <PackageLogoIcon />
                </div>
                <h1 style={styles.title}>Track Your Package</h1>
                <p style={styles.subtitle}>
                    Enter your tracking number below to get real-time delivery updates.
                </p>
                <SearchBar onSearch={onSearch} loading={loading} />
                <p style={styles.hint}>e.g. TRK-2024-00123</p>
            </div>

            <footer style={styles.footer}>
                <span>LastMeter Delivery</span>
            </footer>
        </div>
    );
}

function PackageLogoIcon() {
    return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f9fafb',
    },
    blob1: {
        position: 'absolute',
        top: '-120px',
        right: '-80px',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    blob2: {
        position: 'absolute',
        bottom: '-100px',
        left: '-60px',
        width: '340px',
        height: '340px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
        maxWidth: '560px',
        zIndex: 1,
    },
    logoMark: {
        width: 72,
        height: 72,
        borderRadius: '22px',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(34,197,94,0.35)',
        marginBottom: '4px',
    },
    title: {
        fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
        fontWeight: 700,
        color: '#111827',
        textAlign: 'center',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
    },
    subtitle: {
        fontSize: '1rem',
        color: '#6b7280',
        textAlign: 'center',
        maxWidth: '360px',
        lineHeight: 1.55,
        marginBottom: '4px',
    },
    hint: {
        fontSize: '0.78rem',
        color: '#9ca3af',
        marginTop: '-4px',
        fontFamily: 'DM Mono, monospace',
    },
    footer: {
        position: 'absolute',
        bottom: '20px',
        fontSize: '0.78rem',
        color: '#d1d5db',
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    },
};