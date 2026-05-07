import React, { useState, useEffect, useRef } from 'react';
import { searchUsers } from '../services/userService';

export default function UserSearchDropdown({ value, onChange, placeholder = 'Search by name…' }) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounce = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleInput(e) {
        const q = e.target.value;
        setQuery(q);
        onChange(null);
        setOpen(true);

        clearTimeout(debounce.current);
        if (!q.trim()) {
            setOptions([]);
            return;
        }
        debounce.current = setTimeout(async () => {
            setLoading(true);
            try {
                const results = await searchUsers(q);
                setOptions(results);
            } catch {
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 250);
    }

    function handleSelect(user) {
        setQuery(`${user.firstName} ${user.lastName}`);
        setOptions([]);
        setOpen(false);
        onChange(user);
    }

    const displayValue = value ? `${value.firstName} ${value.lastName}` : query;

    return (
        <div ref={containerRef} style={styles.container}>
            <input
                type="text"
                value={displayValue}
                onChange={handleInput}
                onFocus={() => query && setOpen(true)}
                placeholder={placeholder}
                style={styles.input}
                autoComplete="off"
            />
            {open && (loading || options.length > 0) && (
                <div style={styles.dropdown}>
                    {loading && <div style={styles.hint}>Searching…</div>}
                    {!loading && options.length === 0 && query && (
                        <div style={styles.hint}>No users found</div>
                    )}
                    {options.map(u => (
                        <button
                            key={u.id}
                            type="button"
                            style={styles.option}
                            onMouseDown={() => handleSelect(u)}
                        >
                            <span style={styles.optionName}>{u.firstName} {u.lastName}</span>
                            <span style={styles.optionEmail}>{u.email}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { position: 'relative', width: '100%' },
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
    },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        border: '1.5px solid #e5e7eb',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        zIndex: 100,
        overflow: 'hidden',
        maxHeight: '220px',
        overflowY: 'auto',
    },
    option: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        width: '100%',
        padding: '10px 14px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        borderBottom: '1px solid #f3f4f6',
        transition: 'background 0.1s',
    },
    optionName: {
        fontSize: '0.92rem',
        fontWeight: 600,
        color: '#111827',
        fontFamily: 'Outfit, sans-serif',
    },
    optionEmail: {
        fontSize: '0.78rem',
        color: '#6b7280',
        fontFamily: 'Outfit, sans-serif',
    },
    hint: {
        padding: '10px 14px',
        fontSize: '0.85rem',
        color: '#9ca3af',
        fontFamily: 'Outfit, sans-serif',
    },
};
