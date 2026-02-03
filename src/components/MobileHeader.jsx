import React from 'react';
import { Menu, Plus } from 'lucide-react';
import MobileMenuButton from './MobileMenuButton';

const MobileHeader = ({ title, onAddClick, themeColor = 'hsl(var(--accent-primary))', label = 'Agregar', style = {}, children, leftContent }) => {
    return (
        <div
            className="page-header hidden-desktop"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: 'rgba(15, 15, 22, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                marginBottom: '10px',
                marginLeft: '-1.5rem',
                marginRight: '-1.5rem',
                marginTop: '-1.5rem',
                width: 'calc(100% + 3rem)',
                padding: '2rem 1.5rem 0.5rem 1.5rem',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: 'none',
                boxShadow: 'none',
                minHeight: '60px',
                ...style
            }}
        >
            {/* Lado Izquierdo - Spacer o Contenido Personalizado */}
            <div style={{ width: '60px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                {leftContent}
            </div>

            {/* Título Central (Posicionamiento Absoluto para centro perfecto) */}
            <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'auto',
                textAlign: 'center',
                zIndex: 1
            }}>
                <h1
                    className="page-title"
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        whiteSpace: 'nowrap',
                        margin: 0
                    }}
                >
                    {title}
                </h1>
            </div>

            {/* Lado Derecho - Botón Agregar o Spacer */}
            <div style={{ width: '60px', display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 10 }}>
                {children ? (
                    children
                ) : onAddClick ? (
                    <button
                        onClick={onAddClick}
                        className="btn-responsive-action"
                        style={{
                            backgroundColor: themeColor,
                            boxShadow: `0 4px 12px ${themeColor}50`,
                            border: 'none',
                            borderRadius: '12px',
                            width: '40px',
                            height: '40px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Plus className="icon" size={20} strokeWidth={3} color="white" />
                    </button>
                ) : (
                    <div style={{ width: '40px' }}></div>
                )}
            </div>
        </div>
    );
};

export default MobileHeader;
