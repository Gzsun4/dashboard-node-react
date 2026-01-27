import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const { token } = useAuth();
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
                    ...incomes.map(i => ({ ...i, type: 'income', description: i.source })),
                    ...expenses.map(e => ({ ...e, type: 'expense', description: e.description }))
                ].sort((a, b) => new Date(b.date) - new Date(a.date));

                setTransactions(allTransactions.slice(0, 10));

                // Process Chart Data (Last 6 Months)
                const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                const chartMap = new Map();

                [...incomes, ...expenses].forEach(item => {
                    const date = new Date(item.date);
                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // Unique key

                    if (!chartMap.has(monthKey)) {
                        chartMap.set(monthKey, {
                            name: monthNames[date.getMonth()],
                            income: 0,
                            expense: 0,
                            order: date.getTime()
                        });
                    }

                    if (item.source) { // Is Income
                        chartMap.get(monthKey).income += item.amount;
                    } else {
                        chartMap.get(monthKey).expense += item.amount;
                    }
                });

                const processedChartData = Array.from(chartMap.values())
                    .sort((a, b) => a.order - b.order)
                    .slice(-6); // Last 6 months

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
            <div className="page-header">
                <h2 className="page-title">Panel General</h2>
                <p className="page-subtitle">Bienvenido de nuevo, aquí tienes tu resumen financiero.</p>
            </div>

            <div className="dashboard-grid">
                <Card>
                    <div className="stat-card-header">
                        <div>
                            <p className="stat-label">Balance Total</p>
                            <h3 className="stat-value">S/ {stats.balance.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="stat-icon" style={{ background: 'hsl(var(--accent-primary) / 0.2)', color: 'hsl(var(--accent-primary))' }}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className={`stat-trend ${stats.balance >= 0 ? 'trend-up' : 'trend-down'}`}>
                        {stats.balance >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        <span>{stats.balance >= 0 ? 'Positivo' : 'Negativo'}</span>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card-header">
                        <div>
                            <p className="stat-label">Ingresos</p>
                            <h3 className="stat-value">S/ {stats.totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="stat-icon" style={{ background: 'hsl(var(--accent-success) / 0.2)', color: 'hsl(var(--accent-success))' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="stat-trend trend-up">
                        <ArrowUpRight size={16} />
                        <span>Total acumulado</span>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card-header">
                        <div>
                            <p className="stat-label">Gastos</p>
                            <h3 className="stat-value">S/ {stats.totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="stat-icon" style={{ background: 'hsl(var(--accent-danger) / 0.2)', color: 'hsl(var(--accent-danger))' }}>
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <div className="stat-trend trend-down">
                        <ArrowDownRight size={16} />
                        <span>Total gastado</span>
                    </div>
                </Card>

                <Card>
                    <div className="stat-card-header">
                        <div>
                            <p className="stat-label">Ahorros</p>
                            <h3 className="stat-value">S/ {stats.totalSavings.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="stat-icon" style={{ background: 'hsl(var(--accent-secondary) / 0.2)', color: 'hsl(var(--accent-secondary))' }}>
                            <PiggyBank size={20} />
                        </div>
                    </div>
                    <div className="stat-trend trend-up">
                        <ArrowUpRight size={16} />
                        <span>Total ahorrado</span>
                    </div>
                </Card>
            </div>

            <div className="charts-section">
                <Card>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Resumen Mensual</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(30, 35, 55, 0.95)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '0.5rem',
                                        color: 'white'
                                    }}
                                />
                                <Bar dataKey="income" fill="hsl(var(--accent-success))" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="expense" fill="hsl(var(--accent-danger))" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Transacciones Recientes</h3>
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
                                                {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p style={{
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            color: transaction.type === 'income' ? 'hsl(var(--accent-success))' : 'hsl(var(--accent-danger))',
                                            whiteSpace: 'nowrap',
                                            marginLeft: '0.5rem'
                                        }}>
                                            {transaction.type === 'income' ? '+' : '-'}S/ {transaction.amount.toFixed(2)}
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
