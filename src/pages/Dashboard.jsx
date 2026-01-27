import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const data = [
    { name: 'Ene', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 9800 },
    { name: 'Abr', income: 2780, expense: 3908 },
    { name: 'May', income: 1890, expense: 4800 },
    { name: 'Jun', income: 2390, expense: 3800 },
];

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        balance: 0
    });

    useEffect(() => {
        // Cargar datos desde localStorage
        const loadData = () => {
            // Cargar ingresos
            const savedIncomes = localStorage.getItem('incomes');
            let totalIncome = 0;
            if (savedIncomes) {
                try {
                    const incomes = JSON.parse(savedIncomes);
                    totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
                } catch (e) {
                    console.error('Error loading incomes:', e);
                }
            }

            // Cargar gastos
            const savedExpenses = localStorage.getItem('expenses');
            let totalExpenses = 0;
            if (savedExpenses) {
                try {
                    const expenses = JSON.parse(savedExpenses);
                    totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
                } catch (e) {
                    console.error('Error loading expenses:', e);
                }
            }

            // Cargar ahorros
            const savedGoals = localStorage.getItem('savingsGoals');
            let totalSavings = 0;
            if (savedGoals) {
                try {
                    const goals = JSON.parse(savedGoals);
                    totalSavings = goals.reduce((sum, goal) => sum + goal.current, 0);
                } catch (e) {
                    console.error('Error loading savings:', e);
                }
            }

            // Calcular balance
            const balance = totalIncome - totalExpenses;

            setStats({
                totalIncome,
                totalExpenses,
                totalSavings,
                balance
            });
        };

        loadData();

        // Actualizar cada segundo para reflejar cambios en tiempo real
        const interval = setInterval(loadData, 1000);

        return () => clearInterval(interval);
    }, []);

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
                            <BarChart data={data}>
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
                        {(() => {
                            // Cargar y combinar ingresos y gastos
                            const transactions = [];

                            const savedIncomes = localStorage.getItem('incomes');
                            if (savedIncomes) {
                                try {
                                    const incomes = JSON.parse(savedIncomes);
                                    incomes.forEach(income => {
                                        transactions.push({
                                            type: 'income',
                                            description: income.source,
                                            amount: income.amount,
                                            date: income.date,
                                            category: income.category
                                        });
                                    });
                                } catch (e) { }
                            }

                            const savedExpenses = localStorage.getItem('expenses');
                            if (savedExpenses) {
                                try {
                                    const expenses = JSON.parse(savedExpenses);
                                    expenses.forEach(expense => {
                                        transactions.push({
                                            type: 'expense',
                                            description: expense.description,
                                            amount: expense.amount,
                                            date: expense.date,
                                            category: expense.category
                                        });
                                    });
                                } catch (e) { }
                            }

                            // Ordenar por fecha (más reciente primero)
                            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

                            // Mostrar solo las últimas 10
                            const recentTransactions = transactions.slice(0, 10);

                            if (recentTransactions.length === 0) {
                                return (
                                    <div className="text-center text-muted py-4">
                                        <p>No hay transacciones aún</p>
                                    </div>
                                );
                            }

                            return recentTransactions.map((transaction, index) => (
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
                                                {transaction.category} • {transaction.date}
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
                            ));
                        })()}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
