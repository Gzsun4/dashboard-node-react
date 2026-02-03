import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Search, Filter, X, Menu, DollarSign, TrendingUp, PieChart as PieIcon, Coffee, Car, Zap, Film, ShoppingBag, HeartPulse, Edit2, History, List, ChevronDown, ChevronUp } from 'lucide-react';
import MobileMenuButton from '../components/MobileMenuButton';
import CustomPencilIcon from '../components/CustomPencilIcon';
import CustomTrashIcon from '../components/CustomTrashIcon';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import MobileHeader from '../components/MobileHeader';
import MobileStatsGrid from '../components/MobileStatsGrid';
import MobileChartSection from '../components/MobileChartSection';
import TransactionItem from '../components/TransactionItem';
import TransactionList from '../components/TransactionList';
import TimeFilter from '../components/TimeFilter';
import Toast from '../components/Toast';
import { calculateTrend, calculateLinearRegression } from '../utils/trendUtils';
import TrendProjectionCard from '../components/TrendProjectionCard';
import { useTransactions } from '../context/TransactionContext';

const Expenses = ({ timeFilter: externalTimeFilter, isNested, externalTriggerModal, onModalReset }) => {
    const { token } = useAuth();
    const { symbol } = useCurrency();
    const [timeFilter, setTimeFilter] = useState('7days'); // Default internally

    // Sync external timeFilter if provided
    useEffect(() => {
        if (externalTimeFilter) {
            setTimeFilter(externalTimeFilter);
        }
    }, [externalTimeFilter]);

    // Handle external modal trigger from parent (Activity.jsx)
    useEffect(() => {
        if (externalTriggerModal > 0) {
            setShowModal(true);
        }
    }, [externalTriggerModal]);
    const { expenses, setExpenses, hasLoaded: globalLoaded, refresh: refreshTransactions } = useTransactions();
    const [loading, setLoading] = useState(!globalLoaded);
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    useEffect(() => {
        if (globalLoaded) {
            setLoading(false);
        }
    }, [globalLoaded]);

    const [showModal, setShowModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [newExpense, setNewExpense] = useState({
        description: '',
        date: new Date().toLocaleDateString('en-CA'),
        amount: '',
        category: ''
    });

    const [filters, setFilters] = useState({
        category: '',
        dateFrom: '',
        dateTo: ''
    });

    const [activeFilters, setActiveFilters] = useState({
        category: '',
        dateFrom: '',
        dateTo: ''
    });



    // Colores para cada categoría
    const CATEGORY_COLORS = {
        'Comida': '#ef4444',
        'Transporte': '#f59e0b',
        'Entretenimiento': '#8b5cf6',
        'Suscripciones': '#ec4899',
        'Servicios': '#06b6d4',
        'Otro': '#6b7280'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            const body = JSON.stringify({
                description: newExpense.description,
                date: newExpense.date,
                amount: parseFloat(newExpense.amount),
                category: newExpense.category
            });

            if (editingId) {
                const res = await fetch(`/api/data/expenses/${editingId}`, {
                    method: 'PUT',
                    headers,
                    body
                });
                if (res.ok) {
                    const updatedExpense = await res.json();
                    setExpenses(expenses.map(e => i._id === editingId ? updatedExpense : e));
                    setToast({ show: true, message: 'Gasto actualizado', type: 'success' });
                } else {
                    setToast({ show: true, message: 'Error al actualizar', type: 'error' });
                }
            } else {
                const res = await fetch('/api/data/expenses', {
                    method: 'POST',
                    headers,
                    body
                });
                if (res.ok) {
                    const data = await res.json();
                    setExpenses([data, ...expenses]);
                    setToast({ show: true, message: 'Gasto registrado', type: 'success' });
                } else {
                    setToast({ show: true, message: 'Error al registrar', type: 'error' });
                }
            }
            refreshTransactions();
        } catch (error) {
            console.error("Error saving expense", error);
            setToast({ show: true, message: 'Error de conexión', type: 'error' });
        }

        setShowModal(false);
        setEditingId(null);
        setNewExpense({ description: '', date: new Date().toLocaleDateString('en-CA'), amount: '', category: '' });
        if (onModalReset) onModalReset();
    };

    const handleEdit = (expense) => {
        setEditingId(expense._id);
        setNewExpense({
            description: expense.description,
            date: expense.date,
            amount: expense.amount.toString(),
            category: expense.category
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/data/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setToast({ show: true, message: 'Gasto eliminado', type: 'success' });
                setExpenses(prev => prev.filter(e => e._id !== id));
            } else {
                setToast({ show: true, message: 'Error al eliminar', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Error de conexión', type: 'error' });
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewExpense({ description: '', date: new Date().toLocaleDateString('en-CA'), amount: '', category: '' });
        if (onModalReset) onModalReset();
    };


    const handleApplyFilters = () => {
        setActiveFilters({ ...filters });
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setFilters({ category: '', dateFrom: '', dateTo: '' });
        setActiveFilters({ category: '', dateFrom: '', dateTo: '' });
        setShowFilterModal(false);
    };

    // Filtrar gastos
    const filteredExpenses = expenses.filter(expense => {
        let matches = true;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesDescription = expense.description.toLowerCase().includes(query);
            const matchesCategory = expense.category.toLowerCase().includes(query);
            const matchesAmount = expense.amount.toString().includes(query);
            if (!matchesDescription && !matchesCategory && !matchesAmount) {
                matches = false;
            }
        }

        if (activeFilters.category && expense.category !== activeFilters.category) {
            matches = false;
        }

        if (activeFilters.dateFrom && expense.date < activeFilters.dateFrom) {
            matches = false;
        }

        if (activeFilters.dateTo && expense.date > activeFilters.dateTo) {
            matches = false;
        }

        // Time Filter Logic (Mobile Header)
        if (timeFilter && timeFilter !== 'all') {
            const expenseDate = new Date(expense.date);
            const today = new Date();
            let cutoffDate = new Date();

            if (timeFilter === '7days') {
                cutoffDate.setDate(today.getDate() - 7);
            } else if (timeFilter === 'month') {
                cutoffDate.setMonth(today.getMonth() - 1);
            } else if (timeFilter === '3months') {
                cutoffDate.setMonth(today.getMonth() - 3);
            }

            // Set times to midnight to ensure accurate day comparison
            expenseDate.setHours(0, 0, 0, 0);
            cutoffDate.setHours(0, 0, 0, 0);

            if (expenseDate < cutoffDate) {
                matches = false;
            }
        }

        return matches;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calcular datos para la gráfica
    const chartData = useMemo(() => {
        const categoryTotals = {};

        filteredExpenses.forEach(expense => {
            if (categoryTotals[expense.category]) {
                categoryTotals[expense.category] += expense.amount;
            } else {
                categoryTotals[expense.category] = expense.amount;
            }
        });

        return Object.entries(categoryTotals).map(([category, total]) => ({
            name: category,
            value: parseFloat(total.toFixed(2)),
            color: CATEGORY_COLORS[category] || '#6b7280'
        }));
    }, [filteredExpenses]);

    const hasActiveFilters = activeFilters.category || activeFilters.dateFrom || activeFilters.dateTo;
    const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

    // --- Mobile Stats Logic ---
    const totalSpent = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);

    // categoryData for MobileChartSection (reuse chartData logic but ensure format matches)
    const mobileChartData = useMemo(() => {
        const data = {};
        expenses.forEach(exp => {
            data[exp.category] = (data[exp.category] || 0) + exp.amount;
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenses]);

    const topCategory = useMemo(() => {
        if (mobileChartData.length === 0) return 'Ninguna';
        return mobileChartData[0].name;
    }, [mobileChartData]);

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Comida': return <Coffee size={18} className="text-yellow-400" />;
            case 'Transporte': return <Car size={18} className="text-blue-400" />;
            case 'Servicios': return <Zap size={18} className="text-purple-400" />;
            case 'Entretenimiento': return <Film size={18} className="text-red-400" />;
            case 'Suscripciones': return <ShoppingBag size={18} className="text-pink-400" />;
            case 'Salud': return <HeartPulse size={18} className="text-green-400" />;
            default: return <DollarSign size={18} className="text-gray-400" />;
        }
    };

    const trendData = useMemo(() => calculateTrend(expenses, timeFilter), [expenses, timeFilter]);

    const mobileStats = [
        {
            title: "Gasto Total",
            value: `${symbol} ${totalSpent.toFixed(2)}`,
            icon: <DollarSign className="text-white" />,
            color: "bg-red-500",
            trend: trendData?.trend,
            trendLabel: trendData?.trendLabel
        },
        { title: "Categoría Top", value: topCategory, icon: <TrendingUp className="text-[#ff4d6d]" />, color: "bg-[#ff4d6d]" },
        { title: "Movimientos", value: expenses.length.toString(), icon: <PieIcon className="text-blue-500" />, color: "bg-blue-500" }
    ];

    return (
        <>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            <div className="animate-fade-in">



                <MobileStatsGrid stats={mobileStats} />

                {!isNested && (
                    <div className="page-header hidden-mobile"> {/* Original header for desktop only */}
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <h2 className="page-title">Gastos</h2>
                                <p className="page-subtitle">Controla a dónde va tu dinero.</p>
                            </div>
                            <button
                                className="btn btn-responsive-action text-white"
                                style={{
                                    background: 'linear-gradient(135deg, hsl(var(--accent-danger)), #ff6b6b)',
                                    border: 'none'
                                }}
                                onClick={() => setShowModal(true)}
                            >
                                <Plus className="icon" />
                                <span className="hidden-mobile">Nuevo Gasto</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Layout Grid: Gráfica a la izquierda, Tabla a la derecha 
                   En móviles el CSS hace flex-direction: column */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Nueva Tarjeta de Tendencia y Proyección */}


                    {/* Logic for chart data */}
                    {(() => {
                        // Prepare data for TrendProjectionCard
                        // 1. Group expenses by day for the selected period
                        // 2. Ideally align to Mon-Sun or just Last 7 days dynamic

                        const processChartData = () => {
                            // Default to last 7 days view logic for the chart for simplicity if filter is small
                            // Or respect the timeFilter

                            // Map of date -> amount
                            const dailyMap = {};
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            // Adjust days to show in the small trend chart based on filter
                            let daysToShow = 7;
                            if (timeFilter === 'month') daysToShow = 14; // Weekly view-ish
                            if (timeFilter === 'year') daysToShow = 12; // Monthly later? keep 7 for now
                            if (timeFilter === 'today') daysToShow = 1;

                            const templateData = [];

                            for (let i = daysToShow - 1; i >= 0; i--) {
                                const d = new Date(today);
                                d.setDate(today.getDate() - i);
                                const dateStr = d.toLocaleDateString('es-ES', { weekday: 'short' }); // "lun", "mar"
                                const key = d.toISOString().split('T')[0];

                                templateData.push({
                                    name: dateStr.charAt(0).toUpperCase() + dateStr.slice(1),
                                    fullDate: key,
                                    value: 0
                                });
                                dailyMap[key] = 0;
                            }

                            // Fill with real data
                            expenses.forEach(exp => {
                                if (!exp.date) return;
                                let expDateStr = "";
                                if (exp.date.includes('-')) expDateStr = exp.date; // YYYY-MM-DD
                                else expDateStr = new Date(exp.date).toISOString().split('T')[0];

                                if (dailyMap.hasOwnProperty(expDateStr)) {
                                    // Find index
                                    const idx = templateData.findIndex(item => item.fullDate === expDateStr);
                                    if (idx !== -1) {
                                        templateData[idx].value += exp.amount;
                                    }
                                }
                            });

                            return templateData;
                        };

                        const chartData = processChartData();

                        // Calculate Estimations
                        // Simple linear projection logic
                        // If 7 days filter, and we are in day X... actually simple logic:
                        // Projection = (Avg Daily Spend) * (Days in Month/Period)?
                        // User prompt image shows "Estimado al Cierre" $35.
                        // Let's project for the "End of 7 Days" or "End of Month" depending on filter?
                        // Let's default to "Estimated Weekly Total" if 7 days.

                        const currentTotal = chartData.reduce((acc, curr) => acc + curr.value, 0);


                        // Calculate Projection using Linear Regression
                        // We project based on the active time filter using the current chart data (last 7 days trend)
                        let projectionDays = 7;
                        if (timeFilter === 'month') projectionDays = 30;
                        if (timeFilter === '3months') projectionDays = 90;
                        if (timeFilter === 'all') projectionDays = 365;

                        const estimatedTotal = calculateLinearRegression(chartData.map(d => d.value), projectionDays);

                        // Use the real trend percentage if available from trendData
                        // Parsing "+12.5%" -> 12.5
                        let trendNum = 0;
                        if (trendData?.trend) {
                            trendNum = parseFloat(trendData.trend.replace('%', '').replace('+', ''));
                        }

                        // Calculate Category Breakdown for Back Face
                        const categoryStats = useMemo(() => {
                            const stats = {};
                            let total = 0;
                            filteredExpenses.forEach(tx => {
                                if (!stats[tx.category]) {
                                    stats[tx.category] = { name: tx.category, amount: 0, count: 0 };
                                }
                                stats[tx.category].amount += tx.amount;
                                stats[tx.category].count += 1;
                                total += tx.amount;
                            });

                            return Object.values(stats)
                                .map(cat => ({
                                    ...cat,
                                    percentage: total > 0 ? (cat.amount / total) * 100 : 0
                                }))
                                .sort((a, b) => b.amount - a.amount)
                                .slice(0, 4); // Top 4 categories
                        }, [filteredExpenses]);

                        const periodLabel = useMemo(() => {
                            switch (timeFilter) {
                                case '7days': return 'ESTA SEMANA';
                                case 'month': return 'ESTE MES';
                                case '3months': return 'ESTOS 3 MESES';
                                case 'all': return 'HISTÓRICO';
                                default: return 'ESTE PERIODO';
                            }
                        }, [timeFilter]);

                        // Determine grid layout again - on Desktop we want side-by-side
                        return (
                            <div className="w-full">
                                <TrendProjectionCard
                                    data={chartData}
                                    currentTotal={currentTotal}
                                    estimatedTotal={estimatedTotal}
                                    trendPercentage={trendNum}
                                    categoryData={categoryStats}
                                    periodLabel={periodLabel}
                                />
                            </div>
                        );
                    })()}

                    {/* Tabla de Gastos + Vista Móvil combinadas en una sola Tarjeta */}
                    <Card style={{ marginTop: '45px' }}>
                        <h3 className="mb-4 hidden-mobile" style={{ fontSize: '1.2rem' }}>Historial de Gastos</h3>

                        <div className="transaction-list">
                            {loading ? (
                                <p className="text-center p-4">Cargando...</p>
                            ) : filteredExpenses.length === 0 ? (
                                <p className="text-center text-muted p-4">
                                    No se encontraron gastos {hasActiveFilters && 'con los filtros aplicados'}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    <TransactionList
                                        transactions={filteredExpenses}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        type="expense"
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>


            {/* Modal Agregar/Editar */}
            {
                showModal && (
                    <div className="modal-backdrop" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={24} />
                            </button>

                            <h3 className="mb-6">{editingId ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}</h3>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                        Descripción
                                    </label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Ej: Supermercado, Netflix, Gasolina"
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                        Categoría
                                    </label>
                                    <select
                                        className="input-field"
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        <option value="Alimentación">Alimentación</option>
                                        <option value="Transporte">Transporte</option>
                                        <option value="Servicios">Servicios</option>
                                        <option value="Entretenimiento">Entretenimiento</option>
                                        <option value="Salud">Salud</option>
                                        <option value="Educación">Educación</option>
                                        <option value="Hogar">Hogar</option>
                                        <option value="Otros">Otros</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                        Monto
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input-field"
                                        placeholder="0.00"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 justify-end w-full">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleDelete(editingId);
                                                setShowModal(false); // Close modal
                                            }}
                                            className="btn"
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                                color: '#fca5a5',
                                                marginRight: 'auto' // Push other button to right
                                            }}
                                        >
                                            <CustomTrashIcon size={18} />
                                        </button>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn text-white"
                                        style={{ background: 'linear-gradient(135deg, hsl(var(--accent-danger)), #ff6b6b)' }}
                                    >
                                        {editingId ? <><Edit2 size={18} /> Actualizar</> : <><Plus size={18} /> Agregar</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal Filtros */}
            {
                showFilterModal && (
                    <div className="modal-backdrop" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={24} />
                            </button>

                            <h3 className="mb-6">Filtrar Gastos</h3>

                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Categoría
                                </label>
                                <select
                                    className="input-field"
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="">Todas las categorías</option>
                                    <option value="Alimentación">Alimentación</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Servicios">Servicios</option>
                                    <option value="Entretenimiento">Entretenimiento</option>
                                    <option value="Salud">Salud</option>
                                    <option value="Educación">Educación</option>
                                    <option value="Hogar">Hogar</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Fecha Desde
                                </label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Fecha Hasta
                                </label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="btn glass"
                                    onClick={handleClearFilters}
                                >
                                    Limpiar Filtros
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleApplyFilters}
                                >
                                    <Filter size={18} /> Aplicar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Expenses;
