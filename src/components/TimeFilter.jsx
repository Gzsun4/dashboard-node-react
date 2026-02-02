import React, { useState, useRef, useEffect } from 'react';
import { History, Check } from 'lucide-react';

const TimeFilter = ({ onFilterChange, themeColor = '#8b5cf6' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('7days');
    const dropdownRef = useRef(null);

    const options = [
        { id: '7days', label: 'Últimos 7 días' },
        { id: '1month', label: 'Hace 1 mes' },
        { id: '3months', label: 'Hace 3 meses' },
        { id: 'all', label: 'Ver todo' }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id) => {
        setSelected(id);
        onFilterChange(id);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: `rgba(${parseInt(themeColor.slice(1, 3), 16)}, ${parseInt(themeColor.slice(3, 5), 16)}, ${parseInt(themeColor.slice(5, 7), 16)}, 0.1)`,
                    border: `1px solid ${themeColor}40`,
                    color: themeColor,
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                }}
            >
                <History size={20} />
                {selected !== '7days' && (
                    <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: themeColor,
                        border: '1px solid #0f172a'
                    }} />
                )}
            </button>

            {isOpen && (
                <div
                    className="glass-card"
                    style={{
                        position: 'absolute',
                        top: '50px',
                        right: '0',
                        width: '180px',
                        padding: '8px',
                        zIndex: 100,
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#94a3b8',
                        padding: '8px 12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        VER HISTORIAL
                    </div>

                    {options.map(option => (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '10px 12px',
                                background: selected === option.id ? `${themeColor}15` : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                color: selected === option.id ? themeColor : '#e2e8f0',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                marginBottom: '2px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span>{option.label}</span>
                            {selected === option.id && <Check size={16} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeFilter;
