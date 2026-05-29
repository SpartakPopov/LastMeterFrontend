import React from 'react';

const spinnerKeyframes = `
@keyframes lm-spin {
  to { transform: rotate(360deg); }
}
`;

export default function LoadingSpinner({ size = 40, message = 'Fetching package info...' }) {
    return (
        <>
            <style>{spinnerKeyframes}</style>
            <div style={styles.wrapper}>
                <div
                    style={{
                        ...styles.ring,
                        width: size,
                        height: size,
                        borderWidth: size / 10,
                    }}
                />
                {message && <p style={styles.message}>{message}</p>}
            </div>
        </>
    );
}

const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '48px 0',
    },
    ring: {
        borderStyle: 'solid',
        borderColor: '#dcfce7',
        borderTopColor: '#22c55e',
        borderRadius: '50%',
        animation: 'lm-spin 0.8s linear infinite',
    },
    message: {
        color: '#6b7280',
        fontSize: '0.9rem',
        fontFamily: 'Outfit, sans-serif',
    },
};
