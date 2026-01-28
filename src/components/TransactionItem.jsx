import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import CustomPencilIcon from './CustomPencilIcon';
import CustomTrashIcon from './CustomTrashIcon';
import { Coffee, Car, Zap, Film, ShoppingBag, HeartPulse, DollarSign, TrendingUp, Briefcase, Lightbulb, Wallet, Activity } from 'lucide-react';
import { formatDateFriendly } from '../utils/dateUtils';

const TransactionItem = ({ data, onEdit, onDelete, type = 'expense' }) => {
    const { symbol } = useCurrency();
    const isIncome = type === 'income';

    // Helper to get icon based on category
    const getCategoryIcon = (category) => {
        // Common mappings
        const iconProps = { size: 18, className: "text-white" };
        switch (category) {
            // Expenses
            case 'Comida': return <Coffee {...iconProps} />;
            case 'Transporte': return <Car {...iconProps} />;
            case 'Servicios': return <Zap {...iconProps} />;
            case 'Entretenimiento': return <Film {...iconProps} />;
            case 'Suscripciones': return <ShoppingBag {...iconProps} />;
            case 'Salud': return <HeartPulse {...iconProps} />;
            // Income
            case 'Trabajo': return <Briefcase {...iconProps} />;
            case 'Proyectos': return <Lightbulb {...iconProps} />;
            case 'Ventas': return <TrendingUp {...iconProps} />;
            case 'Inversiones': return <Activity {...iconProps} />;
            default: return <DollarSign {...iconProps} />;
        }
    };

    // Helper for category colors
    const getCategoryColor = (category) => {
        const colors = {
            'Comida': 'bg-red-500',
            'Transporte': 'bg-blue-500',
            'Servicios': 'bg-yellow-500',
            'Entretenimiento': 'bg-purple-500',
            'Suscripciones': 'bg-pink-500',
            'Salud': 'bg-green-500',
            'Trabajo': 'bg-blue-600',
            'Proyectos': 'bg-indigo-500',
            'Ventas': 'bg-emerald-500',
            'Inversiones': 'bg-violet-500',
            'Otro': 'bg-gray-500'
        };
        return colors[category] || 'bg-gray-500';
    };

    return (
        <div
            className="transaction-item glass-card transaction-item-grid"
            style={{
                padding: '1rem',
                marginBottom: '0.75rem',
                borderRadius: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Icon Box */}
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    flexShrink: 0
                }}
                className={getCategoryColor(data.category)}
            >
                {getCategoryIcon(data.category)}
            </div>

            {/* Info Section */}
            <div className="transaction-info" style={{ minWidth: 0 }}>
                <h4 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'white',
                    marginBottom: '0.25rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {data.description || data.source}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {/* Only show Category on Desktop or if we want it. User image shows "Ventas • 2026-..." */}
                    <span className="truncate">{data.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    {/* Use the new friendly date format */}
                    <span className="truncate">{formatDateFriendly(data.date)}</span>
                </div>
            </div>

            <div className="transaction-amount-actions">
                <div style={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: isIncome ? 'hsl(var(--accent-success))' : 'hsl(var(--accent-danger))',
                    textAlign: 'right',
                    whiteSpace: 'nowrap'
                }}>
                    {isIncome ? '+' : '-'}{symbol} {data.amount.toFixed(2)}
                </div>

                <div className="transaction-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => onEdit(data)}
                        className="action-btn"
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <CustomPencilIcon size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(data._id)}
                        className="action-btn"
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <CustomTrashIcon size={18} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default TransactionItem;
