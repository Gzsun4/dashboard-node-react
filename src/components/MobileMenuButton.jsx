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
                height: '36px', // Mismo alto que botón de acción
                marginLeft: '-8px' // Margen ligero para compensar padding natural del icono
            }}
        >
            <Menu size={24} />
        </button>
    );
};

export default MobileMenuButton;
