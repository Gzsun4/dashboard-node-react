import React from 'react';
import { Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const MobileMenuButton = () => {
    const { toggleSidebar } = useOutletContext() || {};

    if (!toggleSidebar) return null;

    return (
        <button
            className="btn-ghost mobile-only hidden-desktop mr-2"
            onClick={toggleSidebar}
            aria-label="Abrir menú"
            style={{
                padding: '0.5rem',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
            }}
        >
            <Menu size={24} />
        </button>
    );
};

export default MobileMenuButton;
