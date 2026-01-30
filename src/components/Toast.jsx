import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);


    const Icon = type === 'success' ? CheckCircle : AlertCircle;

    return (
        <div
            className="toast"
            style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: type === 'success' ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)', // Transparent Green/Red
                backdropFilter: 'blur(4px)',
                color: 'white',
                padding: '0.5rem 1rem', // Smaller padding
                borderRadius: '99px', // Pill shape
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                zIndex: 10000,
                // animation: 'slideUp 0.3s ease-out',
                width: 'max-content', // Wrap content
                maxWidth: '90%',
                fontSize: '0.875rem'
            }}
        >
            <Icon size={18} />
            <span style={{ flex: 1, fontWeight: 600 }}>{message}</span>

        </div>
    );
};

export default Toast;
