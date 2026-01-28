import React from 'react';
import { Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const MobileMenuButton = () => {
    const { toggleSidebar } = useOutletContext() || {};

    if (!toggleSidebar) return null;

    return (
        <button
            className="btn-ghost mobile-only hidden-desktop mr-1"
            onClick={toggleSidebar}
            aria-label="Abrir menú"
            style={{
                padding: '0.5rem 0.5rem 0.5rem 0', // Remove left padding from button itself
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                marginLeft: '-1.5rem', // Compense padding of main-content (1.5rem)
                marginRight: '0.5rem' // Add some space between button and title
            }}
        >
            <Menu size={24} />
        </button>
    );
};

export default MobileMenuButton;
