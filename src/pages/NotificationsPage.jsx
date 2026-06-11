import React, { useState, useEffect } from 'react';
import { fetchAllNotifications, markNotificationRead } from '../services/notificationService';

export default function NotificationsPage({ userId, onViewPackage, onUnreadCountChange }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllNotifications(userId);
            setNotifications(data);
        } catch (e) {
            setError(e.message || 'Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    }

    async function handleClick(notification) {
        if (!notification.read) {
            try {
                await markNotificationRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
                onUnreadCountChange?.();
            } catch {
                // Navigate even if mark-as-read fails
            }
        }
        if (notification.trackingNumber) {
            onViewPackage(notification.trackingNumber);
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={styles.page}>
            <main style={styles.main}>
                <div style={styles.shell}>
                    <div style={styles.pageTitle}>
                        <div style={styles.titleIcon}><BellIconLg /></div>
                        <div>
                            <h1 style={styles.h1}>Notifications</h1>
                            <p style={styles.subtitle}>
                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                                    : 'All caught up'}
                            </p>
                        </div>
                    </div>

                    {loading && (
                        <div style={styles.stateCard}>
                            <p style={styles.stateText}>Loading notifications…</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div style={{ ...styles.stateCard, borderLeft: '4px solid #ef4444' }}>
                            <p style={{ ...styles.stateText, color: '#b91c1c' }}>{error}</p>
                            <button style={styles.retryBtn} onClick={load}>Try again</button>
                        </div>
                    )}

                    {!loading && !error && notifications.length === 0 && (
                        <div style={styles.stateCard}>
                            <div style={styles.emptyIconWrap}><BellSlashIcon /></div>
                            <p style={styles.stateText}>No notifications yet.</p>
                            <p style={styles.stateHint}>
                                You'll be notified here when a package is delivered to your locker.
                            </p>
                        </div>
                    )}

                    {!loading && !error && notifications.length > 0 && (
                        <div style={styles.list}>
                            {notifications.map(n => (
                                <NotificationCard key={n.id} notification={n} onClick={handleClick} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function NotificationCard({ notification, onClick }) {
    const [hovered, setHovered] = useState(false);
    const { read, title, message, pickupInstructions, createdAt } = notification;

    const date = new Date(createdAt).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <button
            style={{
                ...styles.card,
                ...(read ? {} : styles.cardUnread),
                ...(hovered ? styles.cardHover : {}),
            }}
            onClick={() => onClick(notification)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {!read && <div style={styles.unreadBar} />}
            <div style={styles.cardBody}>
                <div style={styles.cardHeader}>
                    <span style={{ ...styles.cardTitle, ...(read ? styles.titleRead : {}) }}>
                        {title}
                    </span>
                    <span style={styles.cardDate}>{date}</span>
                </div>
                <p style={styles.cardMessage}>{message}</p>
                {pickupInstructions && (
                    <div style={styles.instructionsBox}>
                        <span style={styles.instructionsLabel}>Pickup instructions</span>
                        <p style={styles.instructionsText}>{pickupInstructions}</p>
                    </div>
                )}
                <div style={styles.cardFooter}>
                    {!read && <span style={styles.newBadge}>New</span>}
                    <span style={styles.viewLink}>View package details →</span>
                </div>
            </div>
        </button>
    );
}

function BellIconLg() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function BellSlashIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f9fafb' },
    main: { display: 'flex', justifyContent: 'center', padding: '36px 28px 60px' },
    shell: { width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '24px' },

    pageTitle: { display: 'flex', alignItems: 'center', gap: '14px' },
    titleIcon: {
        width: 44, height: 44, borderRadius: '12px',
        background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    h1: {
        fontSize: '1.5rem', fontWeight: 700, color: '#111827',
        marginBottom: '2px', lineHeight: 1.2, fontFamily: 'Outfit, sans-serif',
        margin: 0,
    },
    subtitle: { fontSize: '0.88rem', color: '#6b7280', fontFamily: 'Outfit, sans-serif', margin: '2px 0 0' },

    stateCard: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '44px 28px',
        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    stateText: { fontSize: '0.95rem', color: '#374151', fontFamily: 'Outfit, sans-serif', margin: 0 },
    stateHint: { fontSize: '0.85rem', color: '#9ca3af', fontFamily: 'Outfit, sans-serif', margin: 0 },
    emptyIconWrap: { marginBottom: '4px' },
    retryBtn: {
        marginTop: '8px', padding: '8px 20px', borderRadius: '10px',
        backgroundColor: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600,
    },

    list: { display: 'flex', flexDirection: 'column', gap: '10px' },

    card: {
        backgroundColor: '#fff', borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
        padding: 0, overflow: 'hidden', position: 'relative', display: 'flex',
        transition: 'box-shadow 0.15s, transform 0.1s',
    },
    cardUnread: {
        backgroundColor: '#fff7ed',
        boxShadow: '0 2px 12px rgba(234,88,12,0.1)',
    },
    cardHover: {
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        transform: 'translateY(-1px)',
    },
    unreadBar: {
        width: 4, backgroundColor: '#ea580c', flexShrink: 0, alignSelf: 'stretch',
    },
    cardBody: {
        padding: '16px 20px', flex: 1,
        display: 'flex', flexDirection: 'column', gap: '8px',
    },
    cardHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px',
    },
    cardTitle: {
        fontSize: '0.95rem', fontWeight: 700, color: '#111827',
        fontFamily: 'Outfit, sans-serif', lineHeight: 1.3,
    },
    titleRead: { color: '#6b7280', fontWeight: 600 },
    cardDate: {
        fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Outfit, sans-serif',
        flexShrink: 0, paddingTop: '2px',
    },
    cardMessage: {
        fontSize: '0.88rem', color: '#374151', margin: 0,
        fontFamily: 'Outfit, sans-serif', lineHeight: 1.5,
    },
    instructionsBox: {
        backgroundColor: '#fff', borderRadius: '10px', padding: '10px 14px',
        border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '4px',
    },
    instructionsLabel: {
        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: '#9ca3af', fontFamily: 'Outfit, sans-serif',
    },
    instructionsText: {
        fontSize: '0.85rem', color: '#4b5563', margin: 0,
        fontFamily: 'Outfit, sans-serif', lineHeight: 1.5,
    },
    cardFooter: {
        display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px',
    },
    newBadge: {
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
        backgroundColor: '#ffedd5', color: '#c2410c',
        borderRadius: '6px', padding: '2px 8px',
        fontFamily: 'Outfit, sans-serif',
    },
    viewLink: {
        fontSize: '0.82rem', color: '#ea580c',
        fontFamily: 'Outfit, sans-serif', fontWeight: 600,
    },
};
