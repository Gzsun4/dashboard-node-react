import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'hsl(var(--accent-success))' : 'hsl(var(--accent-danger))';
    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <div
            className="toast"
            style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                background: bgColor,
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                zIndex: 10000,
                animation: 'slideInRight 0.3s ease-out',
                minWidth: '300px'
            }}
        >
            <Icon size={24} />
            <span style={{ flex: 1, fontWeight: 600 }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0.25rem'
                }}
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;
