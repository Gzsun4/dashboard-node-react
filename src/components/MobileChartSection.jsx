import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MobileChartSection = ({ data, colors = [], totalValue, label = 'Distribución' }) => {
    // Colores por defecto si no se pasan
    const DEFAULT_COLORS = ['#ff4d6d', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    const chartColors = colors.length > 0 ? colors : DEFAULT_COLORS;

    return (
        <div className="glass-card p-5 rounded-2xl border border-gray-800 mb-6 hidden-desktop" style={{ borderRadius: '1rem' }}>
            <h3 className="text-white font-bold text-sm mb-4">{label}</h3>
            <div className="flex flex-col items-center">
                <div className="h-[200px] w-full mb-6" style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={4}
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || chartColors[index % chartColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`S/ ${value.toFixed(2)}`, '']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="w-full grid grid-cols-1 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    {data.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ padding: '0.5rem' }}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full shadow-sm"
                                    style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: entry.color || chartColors[index % chartColors.length] }}
                                />
                                <span className="text-secondary text-sm font-medium">{entry.name}</span>
                            </div>
                            <span className="text-white font-mono text-sm font-bold">
                                S/ {entry.value.toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Total Footer */}
                <div className="w-full border-t border-gray-700 mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="text-white font-bold">Total</span>
                    <span className="text-white font-mono font-bold text-lg">S/ {totalValue.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default MobileChartSection;
