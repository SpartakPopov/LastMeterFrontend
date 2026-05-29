import React from 'react';

const STATUS_CONFIG = {
    PENDING: {
        label: 'Pending',
        bg: '#fef9c3',
        color: '#854d0e',
        dot: '#eab308',
    },
    IN_TRANSIT: {
        label: 'In Transit',
        bg: '#dbeafe',
        color: '#1e3a8a',
        dot: '#3b82f6',
    },
    DELIVERED: {
        label: 'Delivered',
        bg: '#dcfce7',
        color: '#14532d',
        dot: '#22c55e',
    },
    PICKED_UP: {
        label: 'Picked Up',
        bg: '#f3e8ff',
        color: '#581c87',
        dot: '#a855f7',
    },
    FAILED: {
        label: 'Failed',
        bg: '#fee2e2',
        color: '#7f1d1d',
        dot: '#ef4444',
    },
};

const styles = {
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        flexShrink: 0,
    },
};

export default function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || {
        label: status ?? 'Unknown',
        bg: '#f3f4f6',
        color: '#374151',
        dot: '#9ca3af',
    };

    return (
        <span
            style={{
                ...styles.badge,
                backgroundColor: config.bg,
                color: config.color,
            }}
        >
            <span style={{ ...styles.dot, backgroundColor: config.dot }} />
            {config.label}
        </span>
    );
}