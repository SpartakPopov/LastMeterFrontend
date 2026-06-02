import React, { useState, useEffect, useCallback } from 'react';
import { shortenUrl } from '../utils/shortenUrl';
import {
    getAllOrderRequests,
    approveOrderRequest,
    rejectOrderRequest,
    fulfillOrderRequest,
    getAllOrderGroups,
    createOrderGroup,
    deleteOrderGroup,
    fulfillOrderGroup,
} from '../services/orderRequestService';
import { useToast, ToastContainer } from '../components/Toast';

const STATUS_COLORS = {
    PENDING:  { bg: '#fef3c7', color: '#b45309' },
    APPROVED: { bg: '#dcfce7', color: '#15803d' },
    REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
    ORDERED:  { bg: '#e0f2fe', color: '#0369a1' },
};

const STATUS_ORDER = ['PENDING', 'APPROVED', 'ORDERED', 'REJECTED'];

export default function OrderRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionModal, setActionModal] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState(new Set());
    const [groupModal, setGroupModal] = useState(false);
    const { toasts, toast, removeToast } = useToast();

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            const [reqs, grps] = await Promise.all([getAllOrderRequests(), getAllOrderGroups()]);
            setRequests(reqs);
            setGroups(grps);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { reload(); }, [reload]);

    function toggleSelectMode() {
        setSelectMode(m => !m);
        setSelected(new Set());
    }

    function toggleSelect(id) {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    async function handleCreateGroup(name) {
        try {
            await createOrderGroup(name, [...selected]);
            setGroupModal(false);
            setSelected(new Set());
            setSelectMode(false);
            await reload();
            toast(`Group "${name}" created.`, 'success');
        } catch (e) {
            toast(e.message, 'error');
        }
    }

    async function handleDeleteGroup(id, name) {
        try {
            await deleteOrderGroup(id);
            await reload();
            toast(`Group "${name}" removed.`, 'success');
        } catch (e) {
            toast(e.message, 'error');
        }
    }

    async function handleFulfillGroup(groupId, groupName, packages) {
        try {
            await fulfillOrderGroup(groupId, packages);
            setActionModal(null);
            await reload();
            toast(`Group order placed for "${groupName}".`, 'success');
        } catch (e) {
            setActionModal(prev => ({ ...prev, error: e.message }));
        }
    }

    async function handleModalSubmit(id, type, payload) {
        try {
            if (type === 'approve') await approveOrderRequest(id, payload.notes);
            else if (type === 'reject') await rejectOrderRequest(id, payload.notes);
            else if (type === 'fulfill') await fulfillOrderRequest(id, payload.packages);
            setActionModal(null);
            await reload();
            const messages = {
                approve: `Request #${id} approved.`,
                reject: `Request #${id} rejected.`,
                fulfill: `Order placed for request #${id}.`,
            };
            toast(messages[type], type === 'reject' ? 'error' : 'success');
        } catch (e) {
            setActionModal(prev => ({ ...prev, error: e.message }));
        }
    }

    const filtered = statusFilter === 'ALL'
        ? requests
        : requests.filter(r => r.status === statusFilter);

    // IDs that belong to a group
    const groupedIds = new Set(groups.flatMap(g => g.orderRequests.map(r => r.id)));

    // Filter groups to match status filter
    const filteredGroups = groups.map(g => ({
        ...g,
        orderRequests: statusFilter === 'ALL'
            ? g.orderRequests
            : g.orderRequests.filter(r => r.status === statusFilter),
    })).filter(g => g.orderRequests.length > 0);

    // Ungrouped requests in the filtered set
    const ungrouped = filtered.filter(r => !groupedIds.has(r.id));

    const counts = {};
    for (const r of requests) counts[r.status] = (counts[r.status] || 0) + 1;

    const totalVisible = filteredGroups.length + ungrouped.length;

    return (
        <div style={styles.page}>
            <main style={styles.main}>
                <div style={styles.shell}>
                    <div style={styles.pageTitle}>
                        <div style={styles.titleIcon}><ClipboardIcon /></div>
                        <div>
                            <h1 style={styles.h1}>Order Requests</h1>
                            <p style={styles.subtitle}>Manage incoming order requests from users.</p>
                        </div>
                        <div style={styles.titleActions}>
                            {selectMode && selected.size >= 2 && (
                                <button style={styles.createGroupBtn} onClick={() => setGroupModal(true)}>
                                    Group {selected.size} selected
                                </button>
                            )}
                            <button
                                style={{ ...styles.selectBtn, ...(selectMode ? styles.selectBtnActive : {}) }}
                                onClick={toggleSelectMode}
                            >
                                {selectMode ? 'Cancel' : 'Select'}
                            </button>
                        </div>
                    </div>

                    <div style={styles.filterRow}>
                        {['ALL', ...STATUS_ORDER].map(s => (
                            <button
                                key={s}
                                style={{ ...styles.filterBtn, ...(statusFilter === s ? styles.filterBtnActive : {}) }}
                                onClick={() => setStatusFilter(s)}
                            >
                                {s === 'ALL' ? 'All' : capitalize(s)}
                                {s !== 'ALL' && counts[s] > 0 && (
                                    <span style={{ ...styles.filterCount, ...(statusFilter === s ? styles.filterCountActive : {}) }}>
                                        {counts[s]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {loading && <p style={styles.hint}>Loading…</p>}
                    {error && <p style={{ color: '#b91c1c', fontFamily: 'Outfit, sans-serif' }}>{error}</p>}

                    {!loading && !error && totalVisible === 0 && (
                        <div style={styles.emptyCard}>No order requests found.</div>
                    )}

                    {!loading && !error && (
                        <div style={styles.list}>
                            {filteredGroups.map(group => (
                                <ManualGroup
                                    key={group.id}
                                    group={group}
                                    onAction={(req, type) => setActionModal({ req, type })}
                                    onDelete={() => handleDeleteGroup(group.id, group.name)}
                                    onFulfill={(packages) => handleFulfillGroup(group.id, group.name, packages)}
                                    selectMode={selectMode}
                                    selected={selected}
                                    onToggle={toggleSelect}
                                />
                            ))}
                            {ungrouped.map(req => (
                                <div key={req.id} style={styles.selectRow}>
                                    {selectMode && (
                                        <input
                                            type="checkbox"
                                            checked={selected.has(req.id)}
                                            onChange={() => toggleSelect(req.id)}
                                            style={styles.checkbox}
                                        />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <RequestCard
                                            req={req}
                                            onAction={(type) => setActionModal({ req, type })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {actionModal && (
                <ActionModal
                    req={actionModal.req}
                    type={actionModal.type}
                    error={actionModal.error}
                    onSubmit={(payload) => handleModalSubmit(actionModal.req.id, actionModal.type, payload)}
                    onClose={() => setActionModal(null)}
                />
            )}

            {groupModal && (
                <GroupNameModal
                    count={selected.size}
                    onSubmit={handleCreateGroup}
                    onClose={() => setGroupModal(false)}
                />
            )}
        </div>
    );
}

function ManualGroup({ group, onAction, onDelete, onFulfill, selectMode, selected, onToggle }) {
    const [collapsed, setCollapsed] = useState(false);
    const [fulfillModal, setFulfillModal] = useState(false);

    const allApproved = group.orderRequests.length > 0 &&
        group.orderRequests.every(r => r.status === 'APPROVED');

    return (
        <div style={styles.groupBox}>
            <div style={styles.groupHeader}>
                <button style={styles.groupHeaderBtn} onClick={() => setCollapsed(c => !c)}>
                    <span style={styles.collapseArrow}>{collapsed ? '▶' : '▼'}</span>
                    <div style={styles.groupIcon}><FolderIcon /></div>
                    <div>
                        <span style={styles.groupName}>{group.name}</span>
                        <span style={styles.groupOrderCount}> · {group.orderRequests.length} requests</span>
                    </div>
                </button>
                <div style={styles.groupHeaderRight}>
                    <div style={styles.groupStatusPills}>
                        {countByStatus(group.orderRequests).map(([status, count]) => {
                            const sc = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#374151' };
                            return (
                                <span key={status} style={{ ...styles.statusPill, backgroundColor: sc.bg, color: sc.color }}>
                                    {count} {capitalize(status.toLowerCase())}
                                </span>
                            );
                        })}
                    </div>
                    {allApproved && (
                        <button style={styles.fulfillGroupBtn} onClick={() => setFulfillModal(true)}>
                            Place Group Order
                        </button>
                    )}
                    <button style={styles.ungroupBtn} onClick={onDelete} title="Remove group">
                        Ungroup
                    </button>
                </div>
            </div>

            {fulfillModal && (
                <ActionModal
                    req={{ id: `group "${group.name}"`, requestedForFirstName: group.orderRequests.length + ' people', requestedForLastName: '' }}
                    type="fulfill"
                    onSubmit={(payload) => { onFulfill(payload.packages); setFulfillModal(false); }}
                    onClose={() => setFulfillModal(false)}
                />
            )}

            {!collapsed && (
                <div style={styles.groupBody}>
                    {group.orderRequests.map(req => (
                        <div key={req.id} style={styles.selectRow}>
                            {selectMode && (
                                <input
                                    type="checkbox"
                                    checked={selected.has(req.id)}
                                    onChange={() => onToggle(req.id)}
                                    style={styles.checkbox}
                                />
                            )}
                            <div style={{ flex: 1 }}>
                                <RequestCard
                                    req={req}
                                    onAction={(type) => onAction(req, type)}
                                    nested
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function RequestCard({ req, onAction, nested }) {
    const sc = STATUS_COLORS[req.status] || { bg: '#f3f4f6', color: '#374151' };
    return (
        <div style={{ ...styles.card, ...(nested ? styles.nestedCard : {}) }}>
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
                            <a key={i} href={link.trim()} target="_blank" rel="noreferrer" style={styles.link} title={link.trim()}>
                                {shortenUrl(link.trim())}
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

function GroupNameModal({ count, onSubmit, onClose }) {
    const [name, setName] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit(name.trim());
    }

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={{ ...styles.modal, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Create Group</h2>
                <p style={styles.modalSub}>Grouping {count} selected requests.</p>
                <form onSubmit={handleSubmit} style={styles.modalForm}>
                    <label style={styles.modalField}>
                        <span style={styles.fieldLabel}>Group name</span>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Amazon June order"
                            style={styles.nameInput}
                            autoFocus
                        />
                    </label>
                    <div style={styles.modalActions}>
                        <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button type="submit" style={styles.approveBtnPrimary} disabled={!name.trim()}>
                            Create Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function countByStatus(orders) {
    const map = {};
    for (const o of orders) map[o.status] = (map[o.status] || 0) + 1;
    return STATUS_ORDER.filter(s => map[s]).map(s => [s, map[s]]);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const emptyPkg = () => ({ trackingNumber: '', description: '', length: '', width: '', height: '' });

function ActionModal({ req, type, error, onSubmit, onClose }) {
    const [notes, setNotes] = useState('');
    const [pkgInputs, setPkgInputs] = useState([emptyPkg()]);

    function addPkg() { setPkgInputs(prev => [...prev, emptyPkg()]); }
    function removePkg(i) { setPkgInputs(prev => prev.filter((_, idx) => idx !== i)); }
    function updatePkg(i, field, val) {
        setPkgInputs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (type === 'fulfill') {
            const packages = pkgInputs
                .filter(p => p.trackingNumber.trim())
                .map(p => ({
                    trackingNumber: p.trackingNumber.trim(),
                    description: p.description.trim() || null,
                    length: p.length ? Number(p.length) : null,
                    width: p.width ? Number(p.width) : null,
                    height: p.height ? Number(p.height) : null,
                }));
            if (packages.length === 0) return;
            onSubmit({ packages });
        } else {
            onSubmit({ notes });
        }
    }

    const titles = { approve: 'Approve Request', reject: 'Reject Request', fulfill: 'Place Order' };
    const isFulfill = type === 'fulfill';

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={{ ...styles.modal, maxWidth: isFulfill ? 580 : 480 }} onClick={e => e.stopPropagation()}>
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
                            <span style={styles.fieldLabel}>Packages</span>
                            <p style={styles.trackingHint}>Add one entry per package. Tracking number is required; description and dimensions are optional.</p>
                            {pkgInputs.map((pkg, i) => (
                                <div key={i} style={styles.pkgCard}>
                                    <div style={styles.pkgCardHeader}>
                                        <span style={styles.pkgLabel}>Package {i + 1}</span>
                                        {pkgInputs.length > 1 && (
                                            <button type="button" style={styles.removeBtn} onClick={() => removePkg(i)}>✕ Remove</button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={pkg.trackingNumber}
                                        onChange={e => updatePkg(i, 'trackingNumber', e.target.value)}
                                        placeholder="Tracking number *"
                                        style={styles.trackingInput}
                                        required={i === 0}
                                    />
                                    <input
                                        type="text"
                                        value={pkg.description}
                                        onChange={e => updatePkg(i, 'description', e.target.value)}
                                        placeholder="Description (optional)"
                                        style={styles.pkgInput}
                                    />
                                    <div style={styles.dimsRow}>
                                        <input type="number" value={pkg.length} onChange={e => updatePkg(i, 'length', e.target.value)} placeholder="L (cm)" style={styles.dimInput} />
                                        <input type="number" value={pkg.width} onChange={e => updatePkg(i, 'width', e.target.value)} placeholder="W (cm)" style={styles.dimInput} />
                                        <input type="number" value={pkg.height} onChange={e => updatePkg(i, 'height', e.target.value)} placeholder="H (cm)" style={styles.dimInput} />
                                    </div>
                                </div>
                            ))}
                            <button type="button" style={styles.addTrackingBtn} onClick={addPkg}>
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
                        <button type="submit" style={type === 'reject' ? styles.rejectBtnPrimary : styles.approveBtnPrimary}>
                            {isFulfill ? 'Create Packages' : type === 'approve' ? 'Approve' : 'Reject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
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

function FolderIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    );
}

const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column' },
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
    titleActions: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' },
    selectBtn: {
        padding: '8px 18px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
        backgroundColor: '#fff', color: '#374151', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
    },
    selectBtnActive: {
        backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#111827',
    },
    createGroupBtn: {
        padding: '8px 18px', borderRadius: '8px', border: 'none',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
    },
    filterRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    filterBtn: {
        padding: '7px 16px', borderRadius: '999px', border: '1.5px solid #e5e7eb',
        backgroundColor: '#fff', color: '#6b7280', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px',
    },
    filterBtnActive: {
        backgroundColor: '#111827', borderColor: '#111827', color: '#fff',
    },
    filterCount: {
        fontSize: '0.72rem', fontWeight: 700, borderRadius: '999px',
        padding: '1px 7px', backgroundColor: '#f3f4f6', color: '#374151',
    },
    filterCountActive: { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },

    selectRow: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
    checkbox: { marginTop: '20px', width: 18, height: 18, cursor: 'pointer', flexShrink: 0, accentColor: '#2563eb' },

    // Manual group box
    groupBox: {
        backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        border: '1.5px solid #e0f2fe',
    },
    groupHeader: {
        padding: '14px 20px', backgroundColor: '#f0f9ff',
        borderBottom: '1px solid #e0f2fe',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px',
    },
    groupHeaderBtn: {
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left',
    },
    groupHeaderRight: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
    collapseArrow: { fontSize: '0.7rem', color: '#0369a1', flexShrink: 0 },
    groupIcon: {
        width: 30, height: 30, borderRadius: '8px',
        background: 'linear-gradient(135deg, #bae6fd, #7dd3fc)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    groupName: { fontWeight: 700, color: '#0c4a6e', fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' },
    groupOrderCount: { color: '#64748b', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem' },
    groupStatusPills: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    statusPill: {
        fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px',
        padding: '2px 8px', letterSpacing: '0.04em',
    },
    fulfillGroupBtn: {
        padding: '6px 14px', borderRadius: '7px', border: 'none',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
    },
    ungroupBtn: {
        padding: '5px 12px', borderRadius: '6px', border: '1px solid #fecaca',
        backgroundColor: '#fff5f5', color: '#b91c1c', cursor: 'pointer',
        fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600,
    },
    groupBody: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc' },

    // Cards
    card: {
        backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    },
    nestedCard: { borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
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
    link: { color: '#2563eb', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif', textDecoration: 'underline' },
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

    // Modals
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
    nameInput: {
        width: '100%', padding: '10px 14px', borderRadius: '10px',
        border: '1.5px solid #e5e7eb', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.92rem', color: '#111827', boxSizing: 'border-box', outline: 'none',
    },
    textarea: {
        width: '100%', padding: '10px 14px', borderRadius: '10px',
        border: '1.5px solid #e5e7eb', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.92rem', color: '#111827', resize: 'vertical',
        boxSizing: 'border-box', outline: 'none',
    },
    trackingSection: { display: 'flex', flexDirection: 'column', gap: '10px' },
    trackingHint: { fontSize: '0.8rem', color: '#9ca3af', margin: 0, fontFamily: 'Outfit, sans-serif' },
    pkgCard: {
        display: 'flex', flexDirection: 'column', gap: '8px',
        padding: '14px', borderRadius: '12px', border: '1.5px solid #e5e7eb', backgroundColor: '#fafafa',
    },
    pkgCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    pkgLabel: { fontSize: '0.78rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' },
    trackingInput: {
        width: '100%', padding: '9px 14px', borderRadius: '10px', boxSizing: 'border-box',
        border: '1.5px solid #e5e7eb', fontFamily: 'DM Mono, monospace',
        fontSize: '0.88rem', color: '#111827', outline: 'none', letterSpacing: '0.04em',
    },
    pkgInput: {
        width: '100%', padding: '9px 14px', borderRadius: '10px', boxSizing: 'border-box',
        border: '1.5px solid #e5e7eb', fontFamily: 'Outfit, sans-serif',
        fontSize: '0.88rem', color: '#111827', outline: 'none',
    },
    dimsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' },
    dimInput: {
        padding: '9px 10px', borderRadius: '10px', border: '1.5px solid #e5e7eb',
        fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', color: '#111827',
        outline: 'none', width: '100%', boxSizing: 'border-box',
    },
    removeBtn: {
        padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca',
        backgroundColor: '#fff5f5', color: '#b91c1c', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif',
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
