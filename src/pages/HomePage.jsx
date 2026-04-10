import React from 'react';
import SearchBar from '../components/SearchBar';
import packageImage from '../assets/package.png';

export default function HomePage({ onSearch, loading, onCreatePackage }) {
    return (
        <div style={styles.page}>
            {/* Background blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />

            <div style={styles.content}>
                <div style={styles.logoMark}>
                    <img src={packageImage} style={styles.logoImage}></img>
                </div>
                <h1 style={styles.title}>Track Your Package</h1>
                <p style={styles.subtitle}>
                    Enter your tracking number below to get delivery updates
                </p>
                <SearchBar onSearch={onSearch} loading={loading} />
                <button onClick={onCreatePackage} style={styles.createBtn}>
                    + Create Package
                </button>
            </div>

        </div>
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
    logoImage: {
        width: 40,
        height: 40,
        objectFit: 'contain',
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
    createBtn: {
        marginTop: '4px',
        padding: '10px 22px',
        borderRadius: '10px',
        border: '1.5px solid #d1fae5',
        backgroundColor: '#f0fdf4',
        color: '#15803d',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
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