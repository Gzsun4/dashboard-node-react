import React from 'react';
import { Menu, Plus } from 'lucide-react';
import MobileMenuButton from './MobileMenuButton';

const MobileHeader = ({ title, onAddClick, themeColor = 'hsl(var(--accent-primary))', label = 'Agregar', style = {} }) => {
    return (
        <div
            className="page-header hidden-desktop"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: 'hsl(var(--bg-primary) / 0.8)', // Blend with background
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: 'none', // Remove harsh line
                marginBottom: '1.5rem',
                // Layout Fix: Force full width to escape parent padding
                marginLeft: '-1.5rem',
                marginRight: '-1.5rem',
                marginTop: '-2rem', // Pull to very top
                width: 'calc(100% + 3rem)',
                padding: '10px 1rem', // 1rem padding places button closer to left edge
                boxSizing: 'border-box',
                ...style // Allow overriding/extending styles
            }}
        >
            {/* Botón Menú (Izquierda) */}
            <MobileMenuButton />

            {/* Título Central (Grande y Centrado Absolutamente) */}
            <div className="mobile-title-center">
                <h1
                    className="page-title"
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                >
                    {title}
                </h1>
            </div>

            {/* Botón Agregar (Derecha) o Spacer */}
            {onAddClick ? (
                <button
                    onClick={onAddClick}
                    className="btn-responsive-action"
                    style={{
                        backgroundColor: themeColor,
                        boxShadow: `0 4px 12px ${themeColor}50`, // 50 opacity hex
                        border: 'none',
                        zIndex: 10
                    }}
                >
                    <Plus className="icon" size={20} strokeWidth={3} color="white" />
                    <span className="mobile-only-inline text-white" style={{ fontWeight: 700 }}>{label}</span>
                </button>
            ) : (
                <div style={{ width: '40px', height: '40px' }}></div> // Spacer for balance
            )}
        </div>
    );
};

export default MobileHeader;
