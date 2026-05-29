import React from 'react';

export default function InfoRow({ label, value, mono = false }) {
    if (value === undefined || value === null || value === '') return null;

    return (
        <div style={styles.row}>
            <span style={styles.label}>{label}</span>
            <span style={{ ...styles.value, fontFamily: mono ? 'DM Mono, monospace' : 'Outfit, sans-serif' }}>
                {value}
            </span>
        </div>
    );
}

const styles = {
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid #f3f4f6',
    },
    label: {
        fontSize: '0.82rem',
        fontWeight: 500,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        flexShrink: 0,
        paddingTop: '1px',
    },
    value: {
        fontSize: '0.92rem',
        fontWeight: 500,
        color: '#111827',
        textAlign: 'right',
    },
};