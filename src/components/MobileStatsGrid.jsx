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
        <div className="flex flex-col gap-3 mb-6 hidden-desktop mobile-stats-grid">

            {/* Main Card (Top) */}
            <div
                className="w-full p-5 rounded-[2rem] relative overflow-hidden"
                style={{
                    ...getBackgroundStyle(mainStat.color),
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
            >
                <div className="flex justify-between items-start">
                    <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                        {React.cloneElement(mainStat.icon, { size: 24, color: 'white' })}
                    </div>
                    {/* Badge Decorativo opcional (ej. +12%) - Hardcodeado por ahora o pasado si existiera */}
                    {/* <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
                        Total
                    </div> */}
                </div>

                <div>
                    <p className="text-white/80 text-sm font-medium mb-1">{mainStat.title}</p>
                    <h2 className="text-white text-3xl font-bold tracking-tight">{mainStat.value}</h2>
                </div>
            </div>

            {/* Secondary Cards (Bottom Row) */}
            <div className="grid grid-cols-2 gap-3">
                {secondaryStats.map((stat, index) => (
                    <div
                        key={index}
                        className="p-4 rounded-[1.5rem] bg-[hsl(var(--bg-secondary)/0.5)] border border-white/5 backdrop-blur-lg"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '120px'
                        }}
                    >
                        <div className="mb-3">
                            <div
                                className="p-2 rounded-xl inline-flex"
                                style={{ background: 'rgba(255,255,255,0.05)' }}
                            >
                                {/* El icono viene con clases de color texto, las preservamos */}
                                {React.cloneElement(stat.icon, { size: 20 })}
                            </div>
                        </div>

                        <div>
                            <p className="text-[hsl(var(--text-secondary))] text-xs font-medium mb-1">{stat.title}</p>
                            <p className="text-white text-lg font-bold truncate leading-tight">
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
