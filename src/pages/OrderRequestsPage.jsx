import React, { useState, useEffect } from 'react';
import {
    getAllOrderRequests,
    approveOrderRequest,
    rejectOrderRequest,
    fulfillOrderRequest,
} from '../services/orderRequestService';

const STATUS_COLORS = {
    PENDING:  { bg: '#fef3c7', color: '#b45309' },
    APPROVED: { bg: '#dcfce7', color: '#15803d' },
    REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
    ORDERED:  { bg: '#e0f2fe', color: '#0369a1' },
};

export default function OrderRequestsPage({ onBack }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionModal, setActionModal] = useState(null);

    async function reload() {
        setLoading(true);
        try {
            setRequests(await getAllOrderRequests());
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { reload(); }, []);

    function handleAction(req, type) {
        setActionModal({ req, type });
    }

    async function handleModalSubmit(id, type, payload) {
        try {
            if (type === 'approve') await approveOrderRequest(id, payload.notes);
            else if (type === 'reject') await rejectOrderRequest(id, payload.notes);
            else if (type === 'fulfill') await fulfillOrderRequest(id, payload.trackingNumbers);
            setActionModal(null);
            await reload();
        } catch (e) {
            setActionModal(prev => ({ ...prev, error: e.message }));
        }
    }

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <button onClick={onBack} style={styles.backBtn}>
                    <ChevronLeftIcon /> <span>Back</span>
                </button>
                <span style={styles.logoText}>LastMeter</span>
            </header>

            <main style={styles.main}>
                <div style={styles.shell}>
                    <div style={styles.pageTitle}>
                        <div style={styles.titleIcon}><ClipboardIcon /></div>
                        <div>
                            <h1 style={styles.h1}>Order Requests</h1>
                            <p style={styles.subtitle}>Manage incoming order requests from users.</p>
                        </div>
                    </div>

                    {loading && <p style={styles.hint}>Loading…</p>}
                    {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
                    {!loading && !error && requests.length === 0 && (
                        <div style={styles.emptyCard}>No order requests yet.</div>
                    )}

                    {!loading && !error && requests.length > 0 && (
                        <div style={styles.list}>
                            {requests.map(req => (
                                <RequestCard
                                    key={req.id}
                                    req={req}
                                    onAction={(type) => handleAction(req, type)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {actionModal && (
                <ActionModal
                    req={actionModal.req}
                    type={actionModal.type}
                    error={actionModal.error}
                    onSubmit={(payload) => handleModalSubmit(actionModal.req.id, actionModal.type, payload)}
                    onClose={() => setActionModal(null)}
                />
            )}
        </div>
    );
}

function RequestCard({ req, onAction }) {
    const sc = STATUS_COLORS[req.status] || { bg: '#f3f4f6', color: '#374151' };
    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <div style={styles.cardMeta}>
                    <span style={styles.reqId}>#{req.id}</span>
                    <span style={{ ...styles.badge, backgroundColor: sc.bg, color: sc.color }}>{req.status}</span>
                </div>
                <div style={styles.users}>
                    <span style={styles.userLabel}>From:</span>
                    <span style={styles.userName}>{req.requestedByFirstName} {req.requestedByLastName}</span>
                    <span style={styles.userSep}>→</span>
                    <span style={styles.userLabel}>For:</span>
                    <span style={styles.userName}>{req.requestedForFirstName} {req.requestedForLastName}</span>
                </div>
            </div>

            <div style={styles.cardBody}>
                {req.description && <p style={styles.desc}>{req.description}</p>}
                {req.productLinks && (
                    <div style={styles.links}>
                        <strong>Links:</strong>
                        {req.productLinks.split('\n').filter(l => l.trim()).map((link, i) => (
                            <a key={i} href={link.trim()} target="_blank" rel="noreferrer" style={styles.link}>
                                {link.trim()}
                            </a>
                        ))}
                    </div>
                )}
                <p style={styles.qty}><strong>Qty:</strong> {req.quantity}</p>
                {req.managerNotes && (
                    <p style={styles.notes}><strong>Notes:</strong> {req.managerNotes}</p>
                )}
            </div>

            <div style={styles.cardActions}>
                {req.status === 'PENDING' && (
                    <>
                        <button style={styles.approveBtn} onClick={() => onAction('approve')}>Approve</button>
                        <button style={styles.rejectBtn} onClick={() => onAction('reject')}>Reject</button>
                    </>
                )}
                {req.status === 'APPROVED' && (
                    <button style={styles.fulfillBtn} onClick={() => onAction('fulfill')}>
                        Place Order & Add Tracking
                    </button>
                )}
            </div>
        </div>
    );
}

function ActionModal({ req, type, error, onSubmit, onClose }) {
    const [notes, setNotes] = useState('');
    const [trackingInputs, setTrackingInputs] = useState(['']);

    function addTracking() {
        setTrackingInputs(prev => [...prev, '']);
    }

    function removeTracking(i) {
        setTrackingInputs(prev => prev.filter((_, idx) => idx !== i));
    }

    function updateTracking(i, val) {
        setTrackingInputs(prev => prev.map((v, idx) => idx === i ? val : v));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (type === 'fulfill') {
            const nums = trackingInputs.map(t => t.trim()).filter(Boolean);
            if (nums.length === 0) return;
            onSubmit({ trackingNumbers: nums });
        } else {
            onSubmit({ notes });
        }
    }

    const titles = { approve: 'Approve Request', reject: 'Reject Request', fulfill: 'Place Order' };
    const isFulfill = type === 'fulfill';

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>{titles[type]}</h2>
                <p style={styles.modalSub}>
                    Request #{req.id} — for <strong>{req.requestedForFirstName} {req.requestedForLastName}</strong>
                </p>

                <form onSubmit={handleSubmit} style={styles.modalForm}>
                    {!isFulfill && (
                        <label style={styles.modalField}>
                            <span style={styles.fieldLabel}>
                                {type === 'approve' ? 'Notes (optional)' : 'Reason (optional)'}
                            </span>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={3}
                                style={styles.textarea}
                                placeholder="Add a note for the user…"
                            />
                        </label>
                    )}

                    {isFulfill && (
                        <div style={styles.trackingSection}>
                            <span style={styles.fieldLabel}>Tracking Numbers</span>
                            <p style={styles.trackingHint}>
                                Add one tracking number per package (e.g. one from Amazon, one from Alibaba).
                            </p>
                            {trackingInputs.map((val, i) => (
                                <div key={i} style={styles.trackingRow}>
                                    <input
                                        type="text"
                                        value={val}
                                        onChange={e => updateTracking(i, e.target.value)}
                                        placeholder={`Tracking #${i + 1}`}
                                        style={styles.trackingInput}
                                        required={i === 0}
                                    />
                                    {trackingInputs.length > 1 && (
                                        <button type="button" style={styles.removeBtn} onClick={() => removeTracking(i)}>✕</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" style={styles.addTrackingBtn} onClick={addTracking}>
                                + Add another package
                            </button>
                        </div>
                    )}

                    {error && (
                        <div style={styles.modalError}>
                            <AlertIcon />
                            <span>{error}</span>
                        </div>
                    )}

                    <div style={styles.modalActions}>
                        <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            style={type === 'reject' ? styles.rejectBtnPrimary : styles.approveBtnPrimary}
                        >
                            {isFulfill ? 'Create Packages' : type === 'approve' ? 'Approve' : 'Reject'}
                        </button>
                    </div>
                </form>
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

function AlertIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

function ClipboardIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
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
    shell: { width: '100%', maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '24px' },
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
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    card: {
        backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    },
    cardHeader: {
        padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', flexDirection: 'column', gap: '6px',
    },
    cardMeta: { display: 'flex', alignItems: 'center', gap: '10px' },
    reqId: { fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', fontWeight: 700, color: '#374151' },
    badge: {
        fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px',
        padding: '2px 8px', letterSpacing: '0.05em',
    },
    users: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
    userLabel: { fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'Outfit, sans-serif' },
    userName: { fontSize: '0.88rem', fontWeight: 600, color: '#374151', fontFamily: 'Outfit, sans-serif' },
    userSep: { color: '#d1d5db', fontSize: '0.85rem' },
    cardBody: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' },
    desc: { fontSize: '0.92rem', color: '#374151', margin: 0, fontFamily: 'Outfit, sans-serif' },
    links: { fontSize: '0.82rem', color: '#6b7280', margin: 0, fontFamily: 'Outfit, sans-serif', display: 'flex', flexDirection: 'column', gap: '8px' },
    link: { color: '#2563eb', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif', wordBreak: 'break-all', textDecoration: 'underline' },
    qty: { fontSize: '0.82rem', color: '#6b7280', margin: 0, fontFamily: 'Outfit, sans-serif' },
    notes: { fontSize: '0.82rem', color: '#6b7280', margin: 0, fontFamily: 'Outfit, sans-serif', fontStyle: 'italic' },
    cardActions: {
        padding: '12px 20px', borderTop: '1px solid #f3f4f6',
        display: 'flex', gap: '10px',
    },
    approveBtn: {
        padding: '8px 20px', borderRadius: '8px', border: 'none',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
    },
    rejectBtn: {
        padding: '8px 20px', borderRadius: '8px', border: '1.5px solid #fecaca',
        backgroundColor: '#fff5f5', color: '#b91c1c',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
    },
    fulfillBtn: {
        padding: '8px 20px', borderRadius: '8px', border: 'none',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
    },
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    },
    modal: {
        backgroundColor: '#fff', borderRadius: '20px', padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '90%', maxWidth: '480px',
        display: 'flex', flexDirection: 'column', gap: '16px',
    },
    modalTitle: { fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 },
    modalSub: { fontSize: '0.88rem', color: '#6b7280', margin: 0, fontFamily: 'Outfit, sans-serif' },
    modalForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
    modalField: { display: 'flex', flexDirection: 'column', gap: '6px' },
    fieldLabel: {
        fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: '#6b7280', fontFamily: 'Outfit, sans-serif',
    },
    textarea: {
        width: '100%', padding: '10px 14px', borderRadius: '10px',
        border: '1.5px solid #e5e7eb', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.92rem', color: '#111827', resize: 'vertical',
        boxSizing: 'border-box', outline: 'none',
    },
    trackingSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
    trackingHint: { fontSize: '0.8rem', color: '#9ca3af', margin: 0, fontFamily: 'Outfit, sans-serif' },
    trackingRow: { display: 'flex', gap: '8px', alignItems: 'center' },
    trackingInput: {
        flex: 1, padding: '9px 14px', borderRadius: '10px',
        border: '1.5px solid #e5e7eb', fontFamily: 'DM Mono, monospace',
        fontSize: '0.88rem', color: '#111827', outline: 'none',
        letterSpacing: '0.04em',
    },
    removeBtn: {
        padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem',
    },
    addTrackingBtn: {
        padding: '8px 14px', borderRadius: '8px', border: '1.5px dashed #d1fae5',
        backgroundColor: '#f0fdf4', color: '#15803d', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start',
    },
    modalError: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px',
        backgroundColor: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px',
        color: '#b91c1c', fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif',
    },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    cancelBtn: {
        padding: '9px 20px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
        backgroundColor: '#fff', color: '#374151', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
    },
    approveBtnPrimary: {
        padding: '9px 24px', borderRadius: '10px', border: 'none',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
    },
    rejectBtnPrimary: {
        padding: '9px 24px', borderRadius: '10px', border: 'none',
        backgroundColor: '#ef4444', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
    },
};
