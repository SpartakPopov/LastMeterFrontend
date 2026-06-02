import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${BASE_URL}/users/login?email=${encodeURIComponent(trimmed)}`);
            if (res.status === 404) {
                setError('No account found with that email address.');
                return;
            }
            if (!res.ok) throw new Error('Server error');
            const user = await res.json();
            login(user);
        } catch {
            setError('Could not connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.logo}>
                    <div style={styles.logoMark}>LM</div>
                    <span style={styles.logoText}>LastMeter</span>
                </div>

                <h1 style={styles.heading}>Sign in</h1>
                <p style={styles.sub}>Enter your work email to continue</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={styles.input}
                        autoFocus
                        required
                    />

                    {error && <p style={styles.error}>{error}</p>}

                    <button type="submit" style={styles.btn} disabled={loading}>
                        {loading ? 'Signing in…' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'Outfit, sans-serif',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '380px',
    },
    logo: {
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '28px',
    },
    logoMark: {
        width: 36, height: 36, borderRadius: '10px',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em',
    },
    logoText: {
        fontWeight: 700, fontSize: '1.1rem', color: '#15803d', letterSpacing: '-0.01em',
    },
    heading: {
        margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: '#111827',
    },
    sub: {
        margin: '0 0 24px', fontSize: '0.9rem', color: '#6b7280',
    },
    form: {
        display: 'flex', flexDirection: 'column', gap: '12px',
    },
    input: {
        padding: '12px 14px',
        border: '1.5px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '0.95rem',
        fontFamily: 'Outfit, sans-serif',
        outline: 'none',
        color: '#111827',
    },
    error: {
        margin: 0, fontSize: '0.85rem', color: '#dc2626',
    },
    btn: {
        padding: '12px',
        backgroundColor: '#16a34a',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '0.95rem',
        fontWeight: 600,
        fontFamily: 'Outfit, sans-serif',
        cursor: 'pointer',
        marginTop: '4px',
    },
};
