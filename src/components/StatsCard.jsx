import React from 'react';

const StatsCard = ({ title, value, icon, colorClass }) => {
    return (
        // Estilos inline para asegurar compatibilidad sin Tailwind completo
        <div
            className="snap-center glass-card"
            style={{
                minWidth: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                justifyContent: 'space-between',
                borderRadius: '3rem', // var(--radius-lg * 2)
                background: 'hsl(var(--bg-secondary) / 0.7)'
            }}
        >
            <div className="flex justify-between items-start">
                <div
                    style={{
                        padding: '0.625rem',
                        borderRadius: '9999px',
                        display: 'inline-flex',
                        background: `${colorClass}20`, // 20 opacity hex approximation if colorClass is hex
                        // Si colorClass es una clase como 'bg-green-500', esto fallará sin tailwind.
                        // Asumiremos que colorClass podría ser una clase o un color.
                        // El usuario usaba 'bg-green-500/10'.
                        // Adaptaré para que el componente padre pase el color real o estilo.
                    }}
                    className={colorClass && !colorClass.startsWith('#') ? colorClass : ''}
                >
                    {/* Si colorClass es hex, lo aplicamos al style. Si es clase, arriba. */}
                    {React.cloneElement(icon, { size: 20 })}
                </div>
            </div>
            <div>
                <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</p>
                <h3 className="text-white truncate" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{value}</h3>
            </div>
        </div>
    );
};

export default StatsCard;
