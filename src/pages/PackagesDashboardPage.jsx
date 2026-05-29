import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllPackages, updatePackage, fetchAllLockers } from '../services/packageService';
import { useToast, ToastContainer } from '../components/Toast';

const STATUSES = ['ALL', 'PENDING', 'ASSIGNED_TO_LOCKER', 'DELIVERED_TO_LOCKER', 'PICKED_UP'];

const STATUS_STYLE = {
    PENDING:             { bg: '#fef3c7', color: '#b45309' },
    ASSIGNED_TO_LOCKER:  { bg: '#e0f2fe', color: '#0369a1' },
    DELIVERED_TO_LOCKER: { bg: '#dcfce7', color: '#15803d' },
    PICKED_UP:           { bg: '#f3e8ff', color: '#7e22ce' },
};

export default function PackagesDashboardPage({ onViewDetails }) {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [editPkg, setEditPkg] = useState(null);
    const { toasts, toast, removeToast } = useToast();

    const reload = useCallback(() => {
        setLoading(true);
        fetchAllPackages()
            .then(setPackages)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { reload(); }, [reload]);

    async function handleSaveEdit(id, data) {
        try {
            await updatePackage(id, data);
            setEditPkg(null);
            reload();
            toast('Package updated successfully.', 'success');
        } catch (e) {
            toast(e.message, 'error');
        }
    }

    const visible = filter === 'ALL' ? packages : packages.filter(p => p.status === filter);

    const counts = STATUSES.reduce((acc, s) => {
        acc[s] = s === 'ALL' ? packages.length : packages.filter(p => p.status === s).length;
        return acc;
    }, {});

    return (
        <div style={styles.page}>
            <main style={styles.main}>
                <div style={styles.shell}>
                    <div style={styles.pageTitle}>
                        <div style={styles.titleIcon}><GridIcon /></div>
                        <div>
                            <h1 style={styles.h1}>Packages Dashboard</h1>
                            <p style={styles.subtitle}>All packages and their current status.</p>
                        </div>
                    </div>

                    <div style={styles.filterBar}>
                        {STATUSES.map(s => (
                            <button
                                key={s}
                                style={{ ...styles.filterBtn, ...(filter === s ? styles.filterBtnActive : {}) }}
                                onClick={() => setFilter(s)}
                            >
                                {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
                                <span style={{ ...styles.filterCount, ...(filter === s ? styles.filterCountActive : {}) }}>
                                    {counts[s]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {loading && <p style={styles.hint}>Loading…</p>}
                    {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
                    {!loading && !error && visible.length === 0 && (
                        <div style={styles.emptyCard}>No packages with status "{filter}".</div>
                    )}

                    {!loading && !error && visible.length > 0 && (
                        <div style={styles.tableWrap}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        {['Tracking Number', 'Description', 'Dimensions', 'Receiver', 'Status', 'Actions'].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((pkg, i) => {
                                        const sc = STATUS_STYLE[pkg.status] || { bg: '#f3f4f6', color: '#374151' };
                                        const dims = [pkg.length, pkg.width, pkg.height].filter(Boolean);
                                        return (
                                            <tr key={pkg.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                                <td style={styles.tdMono}>{pkg.trackingNumber}</td>
                                                <td style={styles.td}>{pkg.description || <span style={styles.none}>—</span>}</td>
                                                <td style={styles.td}>
                                                    {dims.length === 3
                                                        ? <span style={styles.mono}>{dims.join(' × ')} cm</span>
                                                        : <span style={styles.none}>—</span>}
                                                </td>
                                                <td style={styles.td}>
                                                    {pkg.receiverFirstName
                                                        ? `${pkg.receiverFirstName} ${pkg.receiverLastName}`
                                                        : <span style={styles.unclaimed}>Unclaimed</span>}
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{ ...styles.badge, backgroundColor: sc.bg, color: sc.color }}>
                                                        {pkg.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td style={styles.tdAction}>
                                                    <div style={styles.actionGroup}>
                                                        {onViewDetails && (
                                                            <button style={styles.detailsBtn} onClick={() => onViewDetails(pkg.trackingNumber)}>
                                                                <EyeIcon /> Details
                                                            </button>
                                                        )}
                                                        <button style={styles.editBtn} onClick={() => setEditPkg(pkg)}>
                                                            <PencilIcon /> Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {editPkg && (
                <EditModal
                    pkg={editPkg}
                    onSave={(data) => handleSaveEdit(editPkg.id, data)}
                    onClose={() => setEditPkg(null)}
                />
            )}
        </div>
    );
}

const STATUSES_EDIT = ['PENDING', 'ASSIGNED_TO_LOCKER', 'DELIVERED_TO_LOCKER', 'PICKED_UP'];
const LOCKER_STATUSES = ['ASSIGNED_TO_LOCKER', 'DELIVERED_TO_LOCKER'];

function EditModal({ pkg, onSave, onClose }) {
    const [trackingNumber, setTrackingNumber] = useState(pkg.trackingNumber || '');
    const [description, setDescription] = useState(pkg.description || '');
    const [length, setLength] = useState(pkg.length ?? '');
    const [width, setWidth] = useState(pkg.width ?? '');
    const [height, setHeight] = useState(pkg.height ?? '');
    const [status, setStatus] = useState(pkg.status || 'PENDING');
    const [lockerId, setLockerId] = useState(pkg.lockerId ?? '');
    const [lockers, setLockers] = useState([]);
    const [saving, setSaving] = useState(false);

    const needsLocker = LOCKER_STATUSES.includes(status);

    useEffect(() => {
        fetchAllLockers().then(setLockers).catch(() => {});
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!trackingNumber.trim()) return;
        if (needsLocker && !lockerId) return;
        setSaving(true);
        await onSave({
            trackingNumber: trackingNumber.trim(),
            description: description.trim() || null,
            length: length !== '' ? Number(length) : null,
            width: width !== '' ? Number(width) : null,
            height: height !== '' ? Number(height) : null,
            status,
            lockerId: needsLocker && lockerId !== '' ? Number(lockerId) : null,
        });
        setSaving(false);
    }

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Edit Package</h2>
                <p style={styles.modalSub}>Update the package information below.</p>

                <form onSubmit={handleSubmit} style={styles.modalForm}>
                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>Tracking Number *</span>
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={e => setTrackingNumber(e.target.value)}
                            required
                            style={styles.inputMono}
                        />
                    </label>

                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>Description</span>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional description"
                            style={styles.input}
                        />
                    </label>

                    <div>
                        <span style={styles.fieldLabel}>Dimensions (cm)</span>
                        <div style={styles.dimsRow}>
                            <input type="number" value={length} onChange={e => setLength(e.target.value)} placeholder="Length" style={styles.dimInput} min="0" step="0.01" />
                            <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="Width" style={styles.dimInput} min="0" step="0.01" />
                            <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Height" style={styles.dimInput} min="0" step="0.01" />
                        </div>
                    </div>

                    <div style={styles.divider} />

                    <label style={styles.field}>
                        <span style={styles.fieldLabel}>Status</span>
                        <select value={status} onChange={e => { setStatus(e.target.value); setLockerId(''); }} style={styles.select}>
                            {STATUSES_EDIT.map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </label>

                    {needsLocker && (
                        <label style={styles.field}>
                            <span style={styles.fieldLabel}>Assign to Locker *</span>
                            <select value={lockerId} onChange={e => setLockerId(e.target.value)} style={styles.select} required>
                                <option value="">— Select a locker —</option>
                                {lockers.map(l => (
                                    <option key={l.id} value={l.id}>
                                        {l.lockerNumber} · {l.size} · {l.buildingName} ({l.status})
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <div style={styles.modalActions}>
                        <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button type="submit" style={styles.saveBtn} disabled={saving}>
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function GridIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
        </svg>
    );
}

function EyeIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function PencilIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 28px 60px' },
    shell: { width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '24px' },
    pageTitle: { display: 'flex', alignItems: 'center', gap: '14px' },
    titleIcon: {
        width: 44, height: 44, borderRadius: '12px',
        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    h1: { fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1.2 },
    subtitle: { fontSize: '0.88rem', color: '#6b7280' },
    filterBar: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    filterBtn: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
        backgroundColor: '#fff', color: '#374151', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
    },
    filterBtnActive: { backgroundColor: '#f0fdf4', borderColor: '#86efac', color: '#15803d' },
    filterCount: {
        fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f3f4f6',
        color: '#6b7280', borderRadius: '20px', padding: '1px 7px',
    },
    filterCountActive: { backgroundColor: '#bbf7d0', color: '#15803d' },
    hint: { color: '#9ca3af', fontFamily: 'Outfit, sans-serif' },
    emptyCard: {
        backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
        textAlign: 'center', color: '#9ca3af', fontFamily: 'Outfit, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    tableWrap: {
        backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflowX: 'auto',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700,
        color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
        backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6',
        fontFamily: 'Outfit, sans-serif',
    },
    td: {
        padding: '13px 18px', fontSize: '0.9rem', color: '#374151',
        borderBottom: '1px solid #f9fafb', fontFamily: 'Outfit, sans-serif',
        verticalAlign: 'middle',
    },
    tdMono: {
        padding: '13px 18px', fontSize: '0.82rem', color: '#111827',
        borderBottom: '1px solid #f9fafb', fontFamily: 'DM Mono, monospace',
        letterSpacing: '0.04em', verticalAlign: 'middle',
    },
    tdAction: {
        padding: '10px 14px', borderBottom: '1px solid #f9fafb', verticalAlign: 'middle',
    },
    badge: {
        fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px',
        padding: '3px 9px', letterSpacing: '0.03em', whiteSpace: 'nowrap',
    },
    actionGroup: { display: 'flex', alignItems: 'center', gap: '6px' },
    detailsBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', borderRadius: '8px',
        border: '1.5px solid #bfdbfe', backgroundColor: '#eff6ff',
        color: '#1d4ed8', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    editBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '6px 12px', borderRadius: '8px',
        border: '1.5px solid #e5e7eb', backgroundColor: '#fff',
        color: '#374151', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    none: { color: '#d1d5db' },
    mono: { fontFamily: 'DM Mono, monospace', fontSize: '0.82rem' },
    unclaimed: { color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' },

    // Modal
    overlay: {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
    },
    modal: {
        backgroundColor: '#fff', borderRadius: '20px', padding: '32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', width: '90%', maxWidth: '460px',
        display: 'flex', flexDirection: 'column', gap: '20px',
    },
    modalTitle: { fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 },
    modalSub: { fontSize: '0.88rem', color: '#6b7280', margin: 0, fontFamily: 'Outfit, sans-serif' },
    modalForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    fieldLabel: {
        fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.05em', color: '#6b7280', fontFamily: 'Outfit, sans-serif',
        display: 'block', marginBottom: '4px',
    },
    input: {
        width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
        border: '1.5px solid #e5e7eb', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.92rem', color: '#111827', outline: 'none',
    },
    inputMono: {
        width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
        border: '1.5px solid #e5e7eb', fontFamily: 'DM Mono, monospace',
        fontSize: '0.88rem', color: '#111827', outline: 'none', letterSpacing: '0.04em',
    },
    dimsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '6px' },
    dimInput: {
        padding: '10px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', color: '#111827',
        outline: 'none', width: '100%', boxSizing: 'border-box',
    },
    divider: { borderTop: '1px solid #f3f4f6', margin: '4px 0' },
    select: {
        width: '100%', padding: '10px 14px', borderRadius: '10px', boxSizing: 'border-box',
        border: '1.5px solid #e5e7eb', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.92rem', color: '#111827', outline: 'none', backgroundColor: '#fff',
        cursor: 'pointer',
    },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' },
    cancelBtn: {
        padding: '9px 20px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
        backgroundColor: '#fff', color: '#374151', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
    },
    saveBtn: {
        padding: '9px 24px', borderRadius: '10px', border: 'none',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
    },
};
