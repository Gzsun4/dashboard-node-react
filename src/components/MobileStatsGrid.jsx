import React from 'react';

const MobileStatsGrid = ({ stats, style }) => {
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
        if (colorClass.includes('orange')) return { background: '#f97316', color: 'white' }; // Orange 500
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
                marginBottom: '10px', // mb-6
                width: '100%',
                marginTop: '20px',
                ...style // Allow overrides
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                    <div style={{
                        padding: '0.5rem', // p-2
                        borderRadius: '9999px', // rounded-full
                        background: 'rgba(255,255,255,0.2)', // bg-white/20
                        backdropFilter: 'blur(4px)', // backdrop-blur-sm
                        display: 'inline-flex'
                    }}>
                        {React.cloneElement(mainStat.icon, { size: 24, color: 'white' })}
                    </div>

                    {/* Sparkline (Decorative) */}
                    <div style={{ position: 'absolute', right: '-20px', top: '10px', opacity: 0.4 }}>
                        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 50 C 30 50, 40 20, 60 30 C 80 40, 90 10, 110 5" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                            <path d="M10 50 C 30 50, 40 20, 60 30 C 80 40, 90 10, 110 5 V 60 H 10 Z" fill="white" fillOpacity="0.2" />
                        </svg>
                    </div>
                </div>

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '0.875rem', // text-sm
                        fontWeight: 600,
                        marginBottom: '0.25rem'
                    }}>
                        {mainStat.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
                        <h2 style={{
                            color: 'white',
                            fontSize: 'clamp(1.5rem, 8vw, 2.3rem)', // Dynamic font size
                            fontWeight: 800,
                            letterSpacing: '-0.025em',
                            lineHeight: '1',
                            margin: 0,
                            whiteSpace: 'nowrap'
                        }}>
                            {mainStat.value}
                        </h2>

                        {/* Trend Badge */}
                        {mainStat.trend && (
                            <div style={{
                                padding: '2px 8px', /* Tighter padding */
                                background: 'rgba(255,255,255,0.25)',
                                borderRadius: '99px',
                                fontSize: '0.7rem', /* Even smaller font */
                                fontWeight: 700,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginBottom: '4px',
                                backdropFilter: 'blur(4px)',
                                marginLeft: 'auto',
                                marginRight: '-10px' /* Pull to right to align with sparkline */
                            }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                    <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                                {mainStat.trend}
                                {mainStat.trendLabel && <span style={{ opacity: 0.9, fontWeight: 600, fontSize: '0.6rem', marginLeft: '3px' }}>{mainStat.trendLabel}</span>}
                            </div>
                        )}
                    </div>
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
                                marginBottom: '0.1rem'
                            }}>
                                {stat.title}
                            </p>
                            <p style={{
                                color: 'white',
                                fontSize: 'clamp(0.85rem, 3.8vw, 1rem)', // Smaller to fit
                                fontWeight: 700,
                                lineHeight: '1.2',
                                whiteSpace: 'nowrap'
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
