import React from 'react';
import StatusBadge from './StatusBadge';
import InfoRow from './InfoRow';

function formatDateTime(dt) {
    if (!dt) return null;
    return new Date(dt).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function SectionCard({ title, icon, children }) {
    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>{icon}</span>
                <h3 style={styles.cardTitle}>{title}</h3>
            </div>
            <div style={styles.cardBody}>{children}</div>
        </div>
    );
}

export default function PackageInfo({ pkg }) {
    const dimensions =
        pkg.length && pkg.width && pkg.height
            ? `${pkg.length} × ${pkg.width} × ${pkg.height} cm`
            : null;

    const receiverName =
        [pkg.receiverFirstName, pkg.receiverLastName].filter(Boolean).join(' ') || null;

    return (
        <div style={styles.wrapper}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <p style={styles.trackingLabel}>Tracking number</p>
                    <p style={styles.trackingNumber}>{pkg.trackingNumber}</p>
                </div>
                <StatusBadge status={pkg.status} />
            </div>

            {/* Package details */}
            <SectionCard title="Package Details" icon={<BoxIcon />}>
                <InfoRow label="Description" value={pkg.description} />
                <InfoRow label="Dimensions" value={dimensions} />
                <InfoRow label="Package ID" value={pkg.id} mono />
            </SectionCard>

            {/* Recipient */}
            <SectionCard title="Recipient" icon={<PersonIcon />}>
                <InfoRow label="Name" value={receiverName} />
                <InfoRow label="Email" value={pkg.receiverEmail} />
            </SectionCard>

            {/* Location */}
            <SectionCard title="Delivery Location" icon={<LocationIcon />}>
                <InfoRow label="Building" value={pkg.buildingName} />
                <InfoRow label="Address" value={pkg.buildingAddress} />
                <InfoRow label="Locker" value={pkg.lockerNumber} />
            </SectionCard>

            {/* Timeline */}
            <SectionCard title="Timeline" icon={<ClockIcon />}>
                <InfoRow label="Delivered at" value={formatDateTime(pkg.deliveredAt)} />
                <InfoRow label="Picked up at" value={formatDateTime(pkg.pickedUpAt)} />
            </SectionCard>
        </div>
    );
}

/* ── SVG icons ── */
function BoxIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
        </svg>
    );
}

function PersonIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
    );
}

function LocationIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

/* ── Styles ── */
const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
    },
    header: {
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        flexWrap: 'wrap',
    },
    trackingLabel: {
        fontSize: '0.75rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#9ca3af',
        marginBottom: '4px',
    },
    trackingNumber: {
        fontFamily: 'DM Mono, monospace',
        fontSize: '1.05rem',
        fontWeight: 500,
        color: '#111827',
        letterSpacing: '0.04em',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 22px',
        borderBottom: '1px solid #f0fdf4',
        backgroundColor: '#f0fdf4',
        color: '#16a34a',
    },
    cardIcon: {
        display: 'flex',
        alignItems: 'center',
        color: '#16a34a',
    },
    cardTitle: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#15803d',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    cardBody: {
        padding: '4px 22px 4px',
    },
};