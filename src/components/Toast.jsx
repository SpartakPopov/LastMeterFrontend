import React, { useState, useCallback, useEffect } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, toast: addToast, removeToast };
}

export function ToastContainer({ toasts, onRemove }) {
    return (
        <div style={styles.container}>
            {toasts.map(t => (
                <Toast key={t.id} toast={t} onRemove={onRemove} />
            ))}
        </div>
    );
}

function Toast({ toast, onRemove }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const show = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(show);
    }, []);

    const cfg = CONFIGS[toast.type] || CONFIGS.success;

    return (
        <div style={{ ...styles.toast, ...cfg.style, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}>
            <span style={styles.icon}>{cfg.icon}</span>
            <span style={styles.message}>{toast.message}</span>
            <button style={styles.closeBtn} onClick={() => onRemove(toast.id)}>✕</button>
        </div>
    );
}

const CONFIGS = {
    success: {
        icon: '✓',
        style: { backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#15803d' },
    },
    error: {
        icon: '✕',
        style: { backgroundColor: '#fff5f5', border: '1.5px solid #fecaca', color: '#b91c1c' },
    },
    info: {
        icon: 'ℹ',
        style: { backgroundColor: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#1d4ed8' },
    },
};

const styles = {
    container: {
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 999,
        pointerEvents: 'none',
    },
    toast: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.9rem',
        fontWeight: 600,
        minWidth: '260px',
        maxWidth: '380px',
        pointerEvents: 'all',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
    },
    icon: {
        fontSize: '0.85rem',
        fontWeight: 800,
        flexShrink: 0,
    },
    message: {
        flex: 1,
        lineHeight: 1.4,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.75rem',
        opacity: 0.5,
        color: 'inherit',
        padding: '0 2px',
        flexShrink: 0,
        lineHeight: 1,
    },
};
