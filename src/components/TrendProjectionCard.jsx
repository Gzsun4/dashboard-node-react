import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Activity, Coffee, Car, Zap, Film, ShoppingBag, HeartPulse, Briefcase, Lightbulb, DollarSign } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const TrendProjectionCard = ({ data, estimatedTotal, trendPercentage, currentTotal, categoryData = [], periodLabel = 'ESTA SEMANA' }) => {
    const { symbol } = useCurrency();
    const [isFlipped, setIsFlipped] = React.useState(false);

    // Determine color based on trend
    const isIncrease = trendPercentage > 0;
    const trendColor = isIncrease ? '#ef4444' : '#10b981';

    // Helper for colors/icons (Matches TransactionItem logic mostly)
    const getCategoryColor = (catName) => {
        const map = {
            'Comida': { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }, // Orange
            'Transporte': { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)' }, // Purple
            'Servicios': { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' }, // Blue
            'Entretenimiento': { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.2)' }, // Pink
            'Salud': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' }, // Green
            'Suscripciones': { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.2)' } // Rose
        };
        return map[catName] || { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.2)' };
    };

    // Helper to get icon based on category
    const getCategoryIcon = (category) => {
        const iconProps = { size: 14, className: "text-white" }; // Smaller size for this card
        switch (category) {
            // Expenses
            case 'Comida': return <Coffee {...iconProps} />;
            case 'Transporte': return <Car {...iconProps} />;
            case 'Servicios': return <Zap {...iconProps} />;
            case 'Entretenimiento': return <Film {...iconProps} />;
            case 'Suscripciones': return <ShoppingBag {...iconProps} />;
            case 'Salud': return <HeartPulse {...iconProps} />;
            // Income (just in case)
            case 'Trabajo': return <Briefcase {...iconProps} />;
            case 'Proyectos': return <Lightbulb {...iconProps} />;
            case 'Ventas': return <TrendingUp {...iconProps} />;
            case 'Inversiones': return <Activity {...iconProps} />;
            default: return <DollarSign {...iconProps} />;
        }
    };

    return (
        <div
            className="flip-card-scene"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
                borderRadius: '1.5rem',
                marginBottom: '-20px',
                position: 'relative',
                zIndex: 10,
                userSelect: 'none', // Prevent text/graph selection on tap
                WebkitUserSelect: 'none',
                // height is determined by the content of the relative face (front)
            }}
        >
            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>

                {/* FRONT FACE (Chart) */}
                <div className="flip-card-front" style={{
                    background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                    padding: '1.2rem 1.2rem 0.8rem 1.2rem',
                    color: 'white',
                    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{
                            padding: '8px',
                            borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            display: 'flex'
                        }}>
                            <TrendingUp size={20} className="text-emerald-400" />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Tendencia y Proyección</h3>
                    </div>

                    {/* Chart */}
                    <div className="chart-container" style={{ width: '100%', height: '130px', marginTop: '0.5rem', marginLeft: '-10px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                                    dy={10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                    }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Footer */}
                    <div style={{
                        marginTop: '0.5rem',
                        paddingTop: '0.8rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end'
                    }}>
                        <div>
                            <p style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255,255,255,0.5)',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                marginBottom: '4px'
                            }}>
                                ESTIMADO AL CIERRE
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
                                Podrías gastar un <span style={{ color: trendColor, fontWeight: 700 }}>{Math.abs(trendPercentage)}% {isIncrease ? 'más' : 'menos'}</span>.
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{
                                fontSize: '1.8rem', // Slightly larger than original but not huge
                                fontWeight: 800,
                                color: trendColor,
                                lineHeight: 1,
                                textShadow: `0 0 20px ${trendColor}, 0 0 40px ${trendColor}40, 0 0 60px ${trendColor}20`, // Stronger glow
                                marginBottom: '4px' // Move up slightly
                            }}>
                                {symbol}{estimatedTotal ? estimatedTotal.toLocaleString() : '0'}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* BACK FACE (Detail List) */}
                <div className="flip-card-back" style={{
                    padding: '1.2rem',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} className="text-blue-400" />
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Detalle de Gastos</h3>
                        </div>

                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>
                            {periodLabel}
                        </span>
                    </div>

                    {/* List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {categoryData.length === 0 ? (
                            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
                                <p className="text-center text-gray-500 text-sm">Sin datos suficientes</p>
                            </div>
                        ) : categoryData.map((cat, idx) => {
                            const { color } = getCategoryColor(cat.name);
                            return (
                                <div key={idx}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* Icon with colored background */}
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                background: color, // Actually this color is text color in map, bg is separate. Let's start with simple color bg
                                                background: getCategoryColor(cat.name).bg || `${color}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {/* Clone icon with distinct color */}
                                                {React.cloneElement(getCategoryIcon(cat.name), { size: 14, color: getCategoryColor(cat.name).color, className: '' })}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cat.name}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                                {Math.round(cat.percentage)}%
                                            </span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                            {symbol}{cat.amount.toFixed(2)}
                                        </span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${cat.percentage}%`,
                                            height: '100%',
                                            background: color,
                                            borderRadius: '3px'
                                        }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tap to flip back hint - moved up */}
                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>Toca para volver</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TrendProjectionCard;
