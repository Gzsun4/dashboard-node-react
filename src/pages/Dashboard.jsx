import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/Card';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Menu, Wallet } from 'lucide-react';
import MobileMenuButton from '../components/MobileMenuButton';
import MobileHeader from '../components/MobileHeader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '../context/TransactionContext';
import './Dashboard.css';

const Dashboard = () => {
    const { token, user } = useAuth();
    const { symbol, toggleCurrency, currency } = useCurrency();
    const { incomes, expenses, goals, loading: globalLoading, hasLoaded } = useTransactions();
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        balance: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(!hasLoaded);
    const [chartTab, setChartTab] = useState('income'); // 'income' or 'expense'

    useEffect(() => {
        if (hasLoaded) {
            // Process Stats
            const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
            const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
            const totalSavings = goals.reduce((sum, item) => sum + item.current, 0);
            const balance = totalIncome - totalExpenses;

            setStats({ totalIncome, totalExpenses, totalSavings, balance });

            // Process Recent Transactions
            const allTransactions = [
                ...incomes.map(i => ({ ...i, type: 'income', description: i.source, createdAt: i.createdAt })),
                ...expenses.map(e => ({ ...e, type: 'expense', description: e.description, createdAt: e.createdAt }))
            ].sort((a, b) => {
                if (b.date !== a.date) return b.date.localeCompare(a.date);
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setTransactions(allTransactions.slice(0, 10));

            // Process Chart Data (Last 7 Days)
            const daysOfWeek = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
            const chartMap = new Map();
            const today = new Date();

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dayKey = d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
                chartMap.set(dayKey, {
                    name: daysOfWeek[d.getDay()],
                    income: 0,
                    expense: 0,
                    order: d.getTime()
                });
            }

            [...incomes, ...expenses].forEach(item => {
                const dayKey = item.date;
                if (chartMap.has(dayKey)) {
                    if (item.source) chartMap.get(dayKey).income += item.amount;
                    else chartMap.get(dayKey).expense += item.amount;
                }
            });

            setChartData(Array.from(chartMap.values()).sort((a, b) => a.order - b.order));
            setLoading(false);
        }
    }, [hasLoaded, incomes, expenses, goals]);

    const getGreeting = () => {
        const peruTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Lima',
            hour: 'numeric',
            hour12: false
        }).format(new Date());
        const hour = parseInt(peruTime);
        let greeting = 'Buenos días';
        if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
        if (hour >= 19) greeting = 'Buenas noches';

        const firstName = user?.name?.split(' ')[0] || 'Usuario';
        return `${greeting}, ${firstName}`;
    };
    return (
        <div className="animate-fade-in">
            <MobileHeader
                title=""
                themeColor="#3b82f6"
                leftContent={
                    <div className="flex flex-col items-start leading-tight">
                        <span style={{
                            fontSize: '11px',
                            color: '#94a3b8',
                            fontWeight: '600'
                        }}>
                            {(() => {
                                const peruTime = new Intl.DateTimeFormat('en-US', {
                                    timeZone: 'America/Lima',
                                    hour: 'numeric',
                                    hour12: false
                                }).format(new Date());
                                const hour = parseInt(peruTime);
                                if (hour >= 12 && hour < 19) return 'Buenas tardes,';
                                if (hour >= 19) return 'Buenas noches,';
                                return 'Buenos días,';
                            })()}
                        </span>
                        <span style={{
                            fontSize: '16px',
                            color: 'white',
                            fontWeight: '800'
                        }}>
                            {user?.name?.split(' ')[0] || 'Usuario'}
                        </span>
                    </div>
                }
            >
                <button
                    onClick={toggleCurrency}
                    className="relative flex items-center cursor-pointer overflow-hidden group"
                    style={{
                        height: '22px',
                        minWidth: '60px',
                        backgroundColor: '#000000',
                        border: '1px solid #27272a',
                        borderRadius: '9999px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                        padding: '1px'
                    }}
                >
                    {/* The Sliding Background (Flags) */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '1px',
                            bottom: '1px',
                            width: '26px',
                            borderRadius: '9999px',
                            background: currency === 'USD'
                                ? 'linear-gradient(90deg, #3C3B6E 40%, #B22234 40%, #B22234 60%, #FFFFFF 60%, #FFFFFF 80%, #B22234 80%)'
                                : 'linear-gradient(90deg, #D91023 30%, #FFFFFF 30%, #FFFFFF 70%, #D91023 70%)',
                            transition: 'all 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                            left: currency === 'USD' ? '1px' : 'calc(100% - 27px)',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2)'
                        }}
                    />

                    {/* Left Icon/Symbol (USD) */}
                    <div className="flex-1 flex justify-center items-center z-10">
                        <span style={{
                            fontSize: '9px',
                            fontWeight: '700',
                            color: currency === 'USD' ? 'white' : '#71717a',
                            transition: 'color 300ms'
                        }}>USD</span>
                    </div>

                    {/* Right Icon/Symbol (PEN) */}
                    <div className="flex-1 flex justify-center items-center z-10">
                        <span style={{
                            fontSize: '9px',
                            fontWeight: '700',
                            color: currency === 'PEN' ? 'white' : '#71717a',
                            transition: 'color 300ms'
                        }}>PEN</span>
                    </div>
                </button>
            </MobileHeader>

            {/* Desktop Header removed as requested */}

            <div className="dashboard-grid">
                {/* Large Balance Card */}
                <div className="glass-card bento-card bento-card-large">
                    <div className="balance-section">
                        <p className="bento-label">BALANCE TOTAL</p>
                        <h3 className="bento-value" style={{ color: stats.balance >= 0 ? '#22c55e' : '#ff4d4d' }}>
                            {symbol} {stats.balance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <div className="flex items-center gap-3">
                            <div className={`bento-badge ${stats.balance >= 0 ? 'badge-positive' : 'badge-negative'}`}>
                                {stats.balance >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                <span>{stats.balance >= 0 ? 'Balance Positivo' : 'Balance Negativo'}</span>
                            </div>
                            <span className="text-sm text-gray-500">Actualizado hoy</span>
                        </div>
                    </div>
                    {/* Decorative Background Icon */}
                    <div className="large-wallet-icon">
                        <Wallet size={180} color="white" />
                    </div>
                </div>

                {/* Income Card */}
                <div className="glass-card bento-card bento-card-small bento-card-income">
                    <div className="relative z-10">
                        <p className="bento-label" style={{ marginBottom: '0.25rem' }}>Ingreso Total</p>
                        <h3 className="bento-value small" style={{ marginBottom: 0 }}>
                            {symbol} {stats.totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="small-bento-icon">
                        <TrendingUp size={140} color="white" />
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="glass-card bento-card bento-card-small bento-card-expense">
                    <div className="relative z-10">
                        <p className="bento-label" style={{ marginBottom: '0.25rem' }}>Gasto Total</p>
                        <h3 className="bento-value small" style={{ marginBottom: 0 }}>
                            {symbol} {stats.totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>
                    <div className="small-bento-icon bento-icon-tilt">
                        <TrendingDown size={140} color="white" />
                    </div>
                </div>
            </div>

            <div className="charts-section">
                <Card>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', textAlign: 'center' }}>Resumen Semanal</h3>

                    <div className="chart-container" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    width={35}
                                    stroke="#94a3b8"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                    }}
                                    formatter={(value) => `${symbol} ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', textAlign: 'center' }}>Transacciones Recientes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {loading ? <p className="text-center text-muted">Cargando...</p> :
                            transactions.length === 0 ? (
                                <div className="text-center text-muted py-4">
                                    <p>No hay transacciones aún</p>
                                </div>
                            ) : transactions.map((transaction, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '0.5rem',
                                        borderLeft: `3px solid ${transaction.type === 'income' ? 'hsl(var(--accent-success))' : 'hsl(var(--accent-danger))'}`
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                                {transaction.description}
                                            </p>
                                            <p className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                                {transaction.category} • {(() => {
                                                    const [y, m, d] = transaction.date.split('-');
                                                    const date = new Date(y, m - 1, d);
                                                    const today = new Date();
                                                    const yesterday = new Date();
                                                    yesterday.setDate(today.getDate() - 1);

                                                    // Reset time for comparison
                                                    today.setHours(0, 0, 0, 0);
                                                    yesterday.setHours(0, 0, 0, 0);
                                                    date.setHours(0, 0, 0, 0);

                                                    if (date.getTime() === today.getTime()) return 'Hoy';
                                                    if (date.getTime() === yesterday.getTime()) return 'Ayer';
                                                    return `${d}/${m}/${y}`;
                                                })()}
                                            </p>
                                        </div>
                                        <p style={{
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            color: transaction.type === 'income' ? 'hsl(var(--accent-success))' : 'hsl(var(--accent-danger))',
                                            whiteSpace: 'nowrap',
                                            marginLeft: '0.5rem'
                                        }}>
                                            {transaction.type === 'income' ? '+' : '-'}{symbol} {transaction.amount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </Card>
            </div>
        </div >
    );
};

export default Dashboard;
