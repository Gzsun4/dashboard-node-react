import React from 'react';

const TimeFilter = ({ activeFilter, onFilterChange, themeColor = '#8b5cf6' }) => {
    const filters = [
        { id: '7days', label: 'Últimos 7 días' },
        { id: 'month', label: 'Hace 1 mes' },
        { id: '3months', label: 'Hace 3 meses' },
        { id: 'all', label: 'Ver todo' }
    ];

    return (
        <div className="flex flex-col w-full" style={{ gap: '0' }}>
            <p
                style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    marginBottom: '8px',
                    paddingLeft: '4px',
                    textTransform: 'uppercase',
                    opacity: 0.8
                }}
            >
                VER HISTORIAL
            </p>
            <div className="flex flex-col">
                {filters.map((filter, index) => (
                    <React.Fragment key={filter.id}>
                        <button
                            onClick={() => onFilterChange(filter.id)}
                            className="flex items-center justify-between w-full transition-all duration-200 active:scale-[0.98] active:opacity-70"
                            style={{
                                padding: '10px 4px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{
                                fontSize: '14.5px',
                                fontWeight: '700',
                                color: activeFilter === filter.id ? themeColor : '#f8fafc',
                                transition: 'all 0.2s ease'
                            }}>
                                {filter.label}
                            </span>
                        </button>
                        {index < filters.length - 1 && (
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', width: '100%' }} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default TimeFilter;

