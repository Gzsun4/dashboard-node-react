import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/Card';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Menu, Wallet } from 'lucide-react';
import MobileMenuButton from '../components/MobileMenuButton';
import MobileHeader from '../components/MobileHeader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const { token, user } = useAuth();
    const { symbol } = useCurrency();
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        balance: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                const [incomesRes, expensesRes, goalsRes] = await Promise.all([
                    fetch('/api/data/incomes', { headers }),
                    fetch('/api/data/expenses', { headers }),
                    fetch('/api/data/goals', { headers })
                ]);

                const incomes = await incomesRes.json();
                const expenses = await expensesRes.json();
                const goals = await goalsRes.json();

                // Calculate Totals
                const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
                const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
                const totalSavings = goals.reduce((sum, item) => sum + item.current, 0);
                const balance = totalIncome - totalExpenses;

                setStats({ totalIncome, totalExpenses, totalSavings, balance });

                // Process Transactions
                const allTransactions = [
                    ...incomes.map(i => ({ ...i, type: 'income', description: i.source, createdAt: i.createdAt })),
                    ...expenses.map(e => ({ ...e, type: 'expense', description: e.description, createdAt: e.createdAt }))
                ].sort((a, b) => {
                    // 1. Sort by Date (descending)
                    if (b.date !== a.date) {
                        return b.date.localeCompare(a.date);
                    }
                    // 2. Tie-breaker: Sort by Creation Time (newest uploaded first)
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setTransactions(allTransactions.slice(0, 10));

                // Process Chart Data (Last 6 Months)
                // Process Chart Data (Last 7 Days)
                const daysOfWeek = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
                const chartMap = new Map();
                const today = new Date();

                // Initialize last 7 days with 0
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    const dayKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
                    chartMap.set(dayKey, {
                        name: daysOfWeek[d.getDay()],
                        income: 0,
                        expense: 0,
                        order: d.getTime()
                    });
                }

                [...incomes, ...expenses].forEach(item => {
                    const date = new Date(item.date + 'T12:00:00'); // Ensure middle of day to avoid timezone shift
                    const dayKey = item.date; // Use the raw date string from DB if it matches YYYY-MM-DD

                    // Fallback if dayKey needs to be derived securely
                    // const dayKey = date.toISOString().split('T')[0]; 

                    if (chartMap.has(dayKey)) {
                        if (item.source) { // Is Income
                            chartMap.get(dayKey).income += item.amount;
                        } else {
                            chartMap.get(dayKey).expense += item.amount;
                        }
                    }
                });

                const processedChartData = Array.from(chartMap.values())
                    .sort((a, b) => a.order - b.order);

                setChartData(processedChartData);
                setLoading(false);

            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token]);

    return (
        <div className="animate-fade-in">
            <MobileHeader
                title="Panel"
                themeColor="#3b82f6"
            />

            <div className="page-header hidden-mobile">
                <div className="flex items-center gap-2 w-full">
                    <div>
                        <h2 className="page-title">Panel General</h2>
                    </div>
                </div>
                <p className="page-subtitle">Bienvenido de nuevo, aquí tienes tu resumen financiero.</p>
            </div>

            {/* Mobile Greeting - Inserted here */}
            <div className="mb-6 mt-4 px-1 md:hidden">
                <h1 className="text-2xl font-bold text-white mb-1">
                    {(() => {
                        const hour = new Date().getHours();
                        let greeting = 'Buenos días';
                        if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
                        if (hour >= 19) greeting = 'Buenas noches';

                        const firstName = user?.name?.split(' ')[0] || 'Usuario';
                        return `${greeting}, ${firstName}`;
                    })()}
                </h1>
                <p className="text-gray-400 text-sm font-medium">
                    Tu Resumen Financiero
                </p>
            </div>

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
                <div className="glass-card bento-card bento-card-small">
                    <div className="flex justify-between items-start mb-4">
                        <div className="icon-box" style={{ background: 'rgba(34, 197, 94, 0.1)', marginBottom: 0 }}>
                            <TrendingUp size={24} style={{ color: '#00ff9d' }} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#4ade80' }}>
                            <ArrowUpRight size={14} /> Acumulado
                        </span>
                    </div>
                    <div>
                        <p className="bento-label" style={{ marginBottom: '0.25rem', color: '#94a3b8' }}>INGRESOS</p>
                        <h3 className="bento-value small" style={{ marginBottom: 0 }}>
                            {symbol} {stats.totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="glass-card bento-card bento-card-small">
                    <div className="flex justify-between items-start mb-4">
                        <div className="icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', marginBottom: 0 }}>
                            <TrendingDown size={24} style={{ color: '#ff4d4d' }} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium" style={{ color: '#f87171' }}>
                            <ArrowDownRight size={14} /> Total gastado
                        </span>
                    </div>
                    <div>
                        <p className="bento-label" style={{ marginBottom: '0.25rem', color: '#94a3b8' }}>GASTOS</p>
                        <h3 className="bento-value small" style={{ marginBottom: 0 }}>
                            {symbol} {stats.totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="charts-section">
                <Card>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', textAlign: 'center' }}>Resumen Mensual</h3>
                    <div className="chart-container">
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
        </div>
    );
};

export default Dashboard;
