import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '5rem', // Above the toast or nav
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.75rem 1.25rem',
                borderRadius: '1rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                zIndex: 9999,
                width: 'max-content',
                maxWidth: '90%'
            }}
        >
            <div className="p-2 rounded-full bg-primary" style={{ background: '#3b82f6' }}>
                <Download size={20} color="white" />
            </div>
            <div className="flex flex-col">
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Instalar App</span>
                <span style={{ fontSize: '0.75rem', color: '#ccc' }}>Acceso rápido desde inicio</span>
            </div>
            <button
                onClick={handleInstallClick}
                style={{
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    marginLeft: '0.5rem',
                    cursor: 'pointer'
                }}
            >
                Instalar
            </button>
            <button
                onClick={() => setIsVisible(false)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#aaa',
                    marginLeft: '0.25rem',
                    cursor: 'pointer'
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
};

export default InstallPrompt;
