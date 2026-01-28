import React from 'react';

const StatsCard = ({ title, value, icon, colorClass }) => {
    return (
        // Estilos inline para asegurar compatibilidad sin Tailwind completo
        <div
            className="snap-center glass-card"
            style={{
                minWidth: '10px',
                padding: '1.25rem 1rem', // More vertical padding, balanced horizontal
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                alignItems: 'center', // Center content horizontally
                justifyContent: 'center', // Center content vertically
                textAlign: 'center', // Center text
                borderRadius: '3rem',
                background: 'hsl(var(--bg-secondary) / 0.7)',
                whiteSpace: 'normal' // Override parent's nowrap to allow text wrapping/centering
            }}
        >
            <div className="flex justify-center items-center mb-2">
                <div
                    style={{
                        padding: '0.75rem',
                        borderRadius: '50%', // Circle shape
                        display: 'inline-flex',
                        background: `${colorClass}20`,
                        color: colorClass
                    }}
                    className={colorClass && !colorClass.startsWith('#') ? colorClass : ''}
                >
                    {React.cloneElement(icon, { size: 22 })}
                </div>
            </div>
            <div className="flex flex-col items-center justify-center w-full" style={{ width: '100%', overflow: 'hidden' }}>
                <p className="text-muted" style={{
                    fontSize: '0.65rem', // Reduced from 0.7rem
                    fontWeight: 500,
                    marginBottom: '0.25rem',
                    lineHeight: '1.1',
                    opacity: 0.8,
                    whiteSpace: 'nowrap', // Keep title on one line if possible
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                }}>
                    {title}
                </p>
                <h3 className="text-white" style={{
                    fontSize: '0.9rem', // Reduced from 1.1rem
                    fontWeight: 700,
                    lineHeight: '1.2',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    width: '100%'
                }}>
                    {value}
                </h3>
            </div>
        </div>
    );
};

export default StatsCard;
