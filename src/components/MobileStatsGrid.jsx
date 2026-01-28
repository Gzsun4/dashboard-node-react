import React from 'react';

const MobileStatsGrid = ({ stats }) => {
    // We expect 3 stats: [Total, BigStat, SmallStat]
    // Stat 0 is the main featured card (Full width)
    // Stat 1 and 2 are secondary cards (Half width)

    if (!stats || stats.length < 3) return null;

    const mainStat = stats[0];
    const secondaryStats = stats.slice(1, 3);

    // Mapeo seguro de colores de Tailwind a valores Hex si es necesario, 
    // pero idealmente usaremos las variables CSS o clases si están disponibles.
    // El usuario pasa "bg-green-500", etc. Intentaremos usar eso como clase o style.
    // Como no tenemos Tailwind completo, haremos un mapeo simple o usaremos style directo si es posible.

    // Helper para obtener estilo de fondo basado en la clase pasada string "bg-green-500"
    const getBackgroundStyle = (colorClass) => {
        if (!colorClass) return {};
        if (colorClass.includes('green')) return { background: '#10b981', color: 'white' }; // Emerald 500
        if (colorClass.includes('red')) return { background: '#ef4444', color: 'white' }; // Red 500
        if (colorClass.includes('blue')) return { background: '#3b82f6', color: 'white' }; // Blue 500
        if (colorClass.includes('purple')) return { background: '#a855f7', color: 'white' }; // Purple 500
        if (colorClass.startsWith('#')) return { background: colorClass, color: 'white' };
        return { background: 'hsl(var(--bg-secondary) / 0.8)' }; // Fallback
    };

    return (
        <div
            className="hidden-desktop mobile-stats-grid"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem', // gap-3
                marginBottom: '1.5rem', // mb-6
                width: '100%'
            }}
        >
            {/* Main Card (Top) - Full Width */}
            <div
                style={{
                    ...getBackgroundStyle(mainStat.color),
                    width: '100%',
                    padding: '1.25rem', // p-5
                    borderRadius: '2rem', // rounded-[2rem]
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                        padding: '0.5rem', // p-2
                        borderRadius: '9999px', // rounded-full
                        background: 'rgba(255,255,255,0.2)', // bg-white/20
                        backdropFilter: 'blur(4px)', // backdrop-blur-sm
                        display: 'inline-flex'
                    }}>
                        {React.cloneElement(mainStat.icon, { size: 24, color: 'white' })}
                    </div>
                </div>

                <div>
                    <p style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.875rem', // text-sm
                        fontWeight: 500,
                        marginBottom: '0.25rem'
                    }}>
                        {mainStat.title}
                    </p>
                    <h2 style={{
                        color: 'white',
                        fontSize: '1.875rem', // text-3xl
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                        lineHeight: '1',
                        margin: 0
                    }}>
                        {mainStat.value}
                    </h2>
                </div>
            </div>

            {/* Secondary Cards (Bottom Row) - 2 Columns */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem' // gap-3
            }}>
                {secondaryStats.map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '1rem', // p-4
                            borderRadius: '1.5rem', // rounded-[1.5rem]
                            background: 'hsl(var(--bg-secondary) / 0.5)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(16px)', // backdrop-blur-lg
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '120px'
                        }}
                    >
                        <div style={{ marginBottom: '0.75rem' }}>
                            <div
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '0.75rem', // rounded-xl
                                    display: 'inline-flex',
                                    background: 'rgba(255,255,255,0.05)'
                                }}
                            >
                                {React.cloneElement(stat.icon, { size: 20 })}
                            </div>
                        </div>

                        <div>
                            <p style={{
                                color: 'hsl(var(--text-secondary))',
                                fontSize: '0.75rem', // text-xs
                                fontWeight: 500,
                                marginBottom: '0.25rem'
                            }}>
                                {stat.title}
                            </p>
                            <p style={{
                                color: 'white',
                                fontSize: '1.125rem', // text-lg
                                fontWeight: 700,
                                lineHeight: '1.25',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default MobileStatsGrid;
