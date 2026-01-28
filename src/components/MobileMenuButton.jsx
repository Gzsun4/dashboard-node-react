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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                width: '40px',
                height: '40px',
                minWidth: '40px', // Evitar compresión
                marginLeft: '-1.5rem' // Mantener leve margen negativo para contrarrestar padding contenedor
            }}
        >
            <Menu size={24} />
        </button>
    );
};

export default MobileMenuButton;
