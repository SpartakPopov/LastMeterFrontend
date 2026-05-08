import React, { useState } from 'react';
import { createOrderRequest } from '../services/orderRequestService';
import UserSearchDropdown from '../components/UserSearchDropdown';

export default function CreateOrderRequestPage() {
    const [requestedBy, setRequestedBy] = useState(null);
    const [requestedFor, setRequestedFor] = useState(null);
    const [sameUser, setSameUser] = useState(true);
    const [form, setForm] = useState({ productLinks: '', quantity: '1', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!requestedBy) { setError('Please select who is making the request.'); return; }
        if (!sameUser && !requestedFor) { setError('Please select who the order is for.'); return; }
        setLoading(true);
        setError(null);
        try {
            await createOrderRequest({
                requestedById: requestedBy.id,
                requestedForId: sameUser ? requestedBy.id : requestedFor.id,
                productLinks: form.productLinks || null,
                quantity: form.quantity ? Number(form.quantity) : 1,
                description: form.description || null,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const isValid = requestedBy && form.quantity && Number(form.quantity) > 0;

    return (
        <div style={styles.page}>
            <main style={styles.main}>
                <div style={styles.shell}>
                    <div style={styles.pageTitle}>
                        <div style={styles.titleIcon}><ShoppingIcon /></div>
                        <div>
                            <h1 style={styles.h1}>New Order Request</h1>
                            <p style={styles.subtitle}>Submit a request for an item to be ordered and delivered.</p>
                        </div>
                    </div>

                    {success ? (
                        <div style={styles.successCard}>
                            <span style={styles.successIconWrap}><CheckIcon /></span>
                            <div>
                                <p style={styles.successTitle}>Request submitted</p>
                                <p style={styles.successMsg}>
                                    Your order request has been sent. An admin will review it shortly.
                                </p>
                                <button style={styles.newBtn} onClick={() => {
                                    setSuccess(false);
                                    setRequestedBy(null);
                                    setRequestedFor(null);
                                    setSameUser(true);
                                    setForm({ productLinks: '', quantity: '1', description: '' });
                                }}>
                                    Submit another
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={styles.form} noValidate>
                            <div style={styles.grid}>
                                <div style={styles.column}>
                                    <SectionCard title="Who" icon={<PersonIcon />}>
                                        <label style={styles.field}>
                                            <span style={styles.fieldLabel}>Requested by <span style={styles.required}>*</span></span>
                                            <UserSearchDropdown
                                                value={requestedBy}
                                                onChange={(u) => { setRequestedBy(u); if (sameUser) setRequestedFor(u); }}
                                                placeholder="Search your name…"
                                            />
                                        </label>

                                        <label style={styles.checkRow}>
                                            <input
                                                type="checkbox"
                                                checked={sameUser}
                                                onChange={e => {
                                                    setSameUser(e.target.checked);
                                                    if (e.target.checked) setRequestedFor(null);
                                                }}
                                                style={styles.checkbox}
                                            />
                                            <span style={styles.checkLabel}>Order is for me</span>
                                        </label>

                                        {!sameUser && (
                                            <label style={styles.field}>
                                                <span style={styles.fieldLabel}>Order for <span style={styles.required}>*</span></span>
                                                <UserSearchDropdown
                                                    value={requestedFor}
                                                    onChange={setRequestedFor}
                                                    placeholder="Search recipient name…"
                                                />
                                            </label>
                                        )}
                                    </SectionCard>
                                </div>

                                <div style={styles.column}>
                                    <SectionCard title="Order Details" icon={<LinkIcon />}>
                                        <label style={styles.field}>
                                            <span style={styles.fieldLabel}>Product link(s)</span>
                                            <textarea
                                                name="productLinks"
                                                value={form.productLinks}
                                                onChange={handleChange}
                                                placeholder={"https://amazon.com/...\nhttps://alibaba.com/..."}
                                                rows={4}
                                                style={styles.textarea}
                                            />
                                        </label>
                                        <label style={styles.field}>
                                            <span style={styles.fieldLabel}>Quantity <span style={styles.required}>*</span></span>
                                            <input
                                                type="number"
                                                name="quantity"
                                                value={form.quantity}
                                                onChange={handleChange}
                                                min={1}
                                                style={styles.input}
                                            />
                                        </label>
                                        <label style={styles.field}>
                                            <span style={styles.fieldLabel}>Description</span>
                                            <input
                                                type="text"
                                                name="description"
                                                value={form.description}
                                                onChange={handleChange}
                                                placeholder="e.g. Blue, size M, model XYZ"
                                                style={styles.input}
                                            />
                                        </label>
                                    </SectionCard>
                                </div>
                            </div>

                            {error && (
                                <div style={styles.errorCard}>
                                    <AlertIcon />
                                    <p style={styles.errorMsg}>{error}</p>
                                </div>
                            )}

                            <div style={styles.actions}>
                                <button type="button" onClick={() => window.history.back()} style={styles.cancelBtn} disabled={loading}>
                                    Cancel
                                </button>
                                <button type="submit" style={{ ...styles.submitBtn, opacity: (!isValid || loading) ? 0.5 : 1 }} disabled={!isValid || loading}>
                                    {loading ? 'Submitting…' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
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

function ChevronLeftIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

function ShoppingIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
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

function LinkIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
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
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' },
    column: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { backgroundColor: '#fff', borderRadius: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
    cardHeader: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 22px',
        borderBottom: '1px solid #f0fdf4', backgroundColor: '#f0fdf4',
        borderRadius: '18px 18px 0 0',
    },
    cardIcon: { display: 'flex', alignItems: 'center', color: '#16a34a' },
    cardTitle: { fontSize: '0.85rem', fontWeight: 600, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' },
    cardBody: { padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    fieldLabel: { fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280' },
    required: { color: '#ef4444' },
    input: {
        width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', color: '#111827',
        backgroundColor: '#fafafa', outline: 'none', boxSizing: 'border-box',
    },
    textarea: {
        width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', color: '#111827',
        backgroundColor: '#fafafa', outline: 'none', boxSizing: 'border-box',
        resize: 'vertical', lineHeight: 1.6,
    },
    checkRow: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
    checkbox: { width: 16, height: 16, accentColor: '#16a34a', cursor: 'pointer' },
    checkLabel: { fontSize: '0.9rem', color: '#374151', fontFamily: 'Outfit, sans-serif', fontWeight: 500 },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    cancelBtn: {
        padding: '10px 22px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
        backgroundColor: '#fff', color: '#374151', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer',
    },
    submitBtn: {
        padding: '10px 28px', borderRadius: '10px', border: 'none',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.92rem', fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 2px 8px rgba(34,197,94,0.35)', transition: 'opacity 0.15s',
    },
    errorCard: {
        display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff5f5',
        border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px',
    },
    errorMsg: { color: '#b91c1c', fontSize: '0.88rem', margin: 0 },
    successCard: {
        backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px',
        padding: '28px', display: 'flex', gap: '16px', alignItems: 'flex-start',
    },
    successIconWrap: { flexShrink: 0, marginTop: '2px' },
    successTitle: { fontWeight: 700, color: '#15803d', fontSize: '1rem', marginBottom: '6px' },
    successMsg: { color: '#166534', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '14px' },
    newBtn: {
        padding: '8px 20px', borderRadius: '8px', border: 'none',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
    },
};
