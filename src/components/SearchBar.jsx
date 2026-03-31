import React, { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
    const [value, setValue] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed) onSearch(trimmed);
    }

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputWrapper}>
                <span style={styles.icon}>
                    <SearchIcon />
                </span>
                <input
                    type="text"
                    placeholder="Enter tracking number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    style={styles.input}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={loading}
                />
            </div>
            <button type="submit" disabled={loading || !value.trim()} style={styles.button}>
                {loading ? 'Searching...' : 'Track'}
            </button>
        </form>
    );
}

function SearchIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

const styles = {
    form: {
        display: 'flex',
        gap: '10px',
        width: '100%',
        maxWidth: '520px',
    },
    inputWrapper: {
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        position: 'absolute',
        left: '14px',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        padding: '14px 16px 14px 42px',
        borderRadius: '14px',
        border: '2px solid #e5e7eb',
        backgroundColor: '#ffffff',
        fontSize: '0.95rem',
        fontFamily: 'Outfit, sans-serif',
        color: '#111827',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    button: {
        padding: '14px 24px',
        borderRadius: '14px',
        backgroundColor: '#22c55e',
        color: '#ffffff',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        fontSize: '0.95rem',
        boxShadow: '0 4px 20px rgba(34,197,94,0.35)',
        transition: 'background-color 0.2s, transform 0.1s, opacity 0.2s',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        opacity: 1,
    },
};
