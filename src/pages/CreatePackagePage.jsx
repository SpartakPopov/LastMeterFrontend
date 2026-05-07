import React, { useState } from 'react';
import { createPackage } from '../services/packageService';
import StatusBadge from '../components/StatusBadge';
import UserSearchDropdown from '../components/UserSearchDropdown';

export default function CreatePackagePage({ onBack, onCreated }) {
    const [form, setForm] = useState({
        trackingNumber: '',
        description: '',
        length: '',
        width: '',
        height: '',
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const pkg = await createPackage({
                trackingNumber: form.trackingNumber,
                receiverId: selectedUser ? selectedUser.id : null,
                description: form.description || null,
                length: form.length ? Number(form.length) : null,
                width: form.width ? Number(form.width) : null,
                height: form.height ? Number(form.height) : null,
                status: 'PENDING',
            });
            setSuccess(true);
            if (onCreated) onCreated(pkg);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const isValid = form.trackingNumber.trim();

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <button onClick={onBack} style={styles.backBtn}>
                    <ChevronLeftIcon />
                    <span>Back</span>
                </button>
                <span style={styles.logoText}>LastMeter</span>
            </header>

            <main style={styles.main}>
                <div style={styles.shell}>
                    {/* Page title */}
                    <div style={styles.pageTitle}>
                        <div style={styles.titleIcon}><BoxIcon /></div>
                        <div>
                            <h1 style={styles.h1}>Create Package</h1>
                            <p style={styles.subtitle}>Fill in the tracking number and recipient details below.</p>
                        </div>
                    </div>

                    {success ? (
                        <div style={styles.successCard}>
                            <span style={styles.successIconWrap}><CheckIcon /></span>
                            <div>
                                <p style={styles.successTitle}>Package created successfully</p>
                                <p style={styles.successMsg}>
                                    Tracking number <span style={styles.mono}>{form.trackingNumber}</span> has been registered with status <strong>PENDING</strong>.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={styles.form} noValidate>
                            <div style={styles.grid}>
                                {/* Left column */}
                                <div style={styles.column}>
                                    <SectionCard title="Tracking" icon={<BarcodeIcon />}>
                                        <Field
                                            label="Tracking Number"
                                            name="trackingNumber"
                                            value={form.trackingNumber}
                                            onChange={handleChange}
                                            placeholder="e.g. LM-20240001"
                                            mono
                                            required
                                        />
                                        <div style={styles.statusRow}>
                                            <span style={styles.fieldLabel}>Status</span>
                                            <StatusBadge status="PENDING" />
                                        </div>
                                    </SectionCard>

                                    <SectionCard title="Details" icon={<BoxIcon />}>
                                        <Field
                                            label="Description"
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="e.g. Fragile electronics"
                                        />
                                        <div style={styles.threeCol}>
                                            <Field
                                                label="Length (cm)"
                                                name="length"
                                                type="number"
                                                value={form.length}
                                                onChange={handleChange}
                                                placeholder="0"
                                            />
                                            <Field
                                                label="Width (cm)"
                                                name="width"
                                                type="number"
                                                value={form.width}
                                                onChange={handleChange}
                                                placeholder="0"
                                            />
                                            <Field
                                                label="Height (cm)"
                                                name="height"
                                                type="number"
                                                value={form.height}
                                                onChange={handleChange}
                                                placeholder="0"
                                            />
                                        </div>
                                    </SectionCard>
                                </div>

                                {/* Right column */}
                                <div style={styles.column}>
                                    <SectionCard title="Recipient" icon={<PersonIcon />}>
                                        <label style={styles.field}>
                                            <span style={styles.fieldLabel}>Receiver (optional)</span>
                                            <UserSearchDropdown
                                                value={selectedUser}
                                                onChange={setSelectedUser}
                                                placeholder="Type a name to search…"
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
                                <button type="button" onClick={onBack} style={styles.cancelBtn} disabled={loading}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.submitBtn} disabled={!isValid || loading}>
                                    {loading ? 'Creating…' : 'Create Package'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}

/* ── Sub-components ── */

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

function Field({ label, name, value, onChange, placeholder, type = 'text', mono = false, required = false }) {
    return (
        <label style={styles.field}>
            <span style={styles.fieldLabel}>
                {label}
                {required && <span style={styles.required}> *</span>}
            </span>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                style={{ ...styles.input, ...(mono ? styles.inputMono : {}) }}
            />
        </label>
    );
}

/* ── Icons ── */

function ChevronLeftIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

function BoxIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
        </svg>
    );
}

function BarcodeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5v14M7 5v14M11 5v14M15 5v6M19 5v6M15 15v4M19 15v4M17 17h-2" />
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

function CheckIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-5" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

/* ── Styles ── */
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
        padding: '14px 28px',
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
    logoText: {
        fontWeight: 700,
        fontSize: '1rem',
        color: '#15803d',
        letterSpacing: '-0.01em',
    },
    main: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '36px 28px 60px',
    },
    shell: {
        width: '100%',
        maxWidth: '960px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
    },
    pageTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    },
    titleIcon: {
        width: 44,
        height: 44,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    h1: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '2px',
        lineHeight: 1.2,
    },
    subtitle: {
        fontSize: '0.88rem',
        color: '#6b7280',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        alignItems: 'start',
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
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
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    fieldLabel: {
        fontSize: '0.78rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#6b7280',
    },
    required: {
        color: '#ef4444',
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1.5px solid #e5e7eb',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.95rem',
        color: '#111827',
        backgroundColor: '#fafafa',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s, box-shadow 0.15s',
    },
    inputMono: {
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.92rem',
        letterSpacing: '0.04em',
    },
    nameRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    threeCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
    },
    statusRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0 2px',
        borderTop: '1px solid #f3f4f6',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
    },
    cancelBtn: {
        padding: '10px 22px',
        borderRadius: '10px',
        border: '1.5px solid #e5e7eb',
        backgroundColor: '#ffffff',
        color: '#374151',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.92rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
    submitBtn: {
        padding: '10px 28px',
        borderRadius: '10px',
        border: 'none',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        color: '#ffffff',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.92rem',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(34,197,94,0.35)',
        opacity: 1,
        transition: 'opacity 0.15s',
    },
    errorCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#fff5f5',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '14px 18px',
    },
    errorMsg: {
        color: '#b91c1c',
        fontSize: '0.88rem',
    },
    successCard: {
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
    },
    successIconWrap: {
        flexShrink: 0,
        marginTop: '2px',
    },
    successTitle: {
        fontWeight: 700,
        color: '#15803d',
        fontSize: '1rem',
        marginBottom: '6px',
    },
    successMsg: {
        color: '#166534',
        fontSize: '0.9rem',
        lineHeight: 1.6,
    },
    mono: {
        fontFamily: 'DM Mono, monospace',
        fontSize: '0.88em',
        letterSpacing: '0.04em',
    },
};
