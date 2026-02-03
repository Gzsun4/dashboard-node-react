import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Search, Filter, X, Menu, DollarSign, TrendingUp, PieChart as PieIcon, Briefcase, Lightbulb, Wallet, Activity, List, ChevronDown, ChevronUp } from 'lucide-react';
import MobileMenuButton from '../components/MobileMenuButton';
import CustomPencilIcon from '../components/CustomPencilIcon';
import CustomTrashIcon from '../components/CustomTrashIcon';
import MobileHeader from '../components/MobileHeader';
import MobileStatsGrid from '../components/MobileStatsGrid';
import MobileChartSection from '../components/MobileChartSection';
import TransactionItem from '../components/TransactionItem';
import TransactionList from '../components/TransactionList';
import TimeFilter from '../components/TimeFilter';
import Toast from '../components/Toast';
import { calculateTrend } from '../utils/trendUtils';
import { useTransactions } from '../context/TransactionContext';

const Income = ({ timeFilter: externalTimeFilter, isNested, externalTriggerModal, onModalReset }) => {
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
    const { incomes, setIncomes, hasLoaded: globalLoaded, refresh: refreshTransactions } = useTransactions();
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
    const [newIncome, setNewIncome] = useState({
        source: '',
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



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            const body = JSON.stringify({
                source: newIncome.source,
                date: newIncome.date,
                amount: parseFloat(newIncome.amount),
                category: newIncome.category
            });

            if (editingId) {
                const res = await fetch(`/api/data/incomes/${editingId}`, {
                    method: 'PUT',
                    headers,
                    body
                });
                if (res.ok) {
                    const updatedIncome = await res.json();
                    setIncomes(incomes.map(i => i._id === editingId ? updatedIncome : i));
                    setToast({ show: true, message: 'Ingreso actualizado', type: 'success' });
                } else {
                    setToast({ show: true, message: 'Error al actualizar', type: 'error' });
                }
            } else {
                const res = await fetch('/api/data/incomes', {
                    method: 'POST',
                    headers,
                    body
                });
                if (res.ok) {
                    const data = await res.json();
                    setIncomes([data, ...incomes]);
                    setToast({ show: true, message: 'Ingreso registrado', type: 'success' });
                } else {
                    setToast({ show: true, message: 'Error al registrar', type: 'error' });
                }
            }
            // Update global state
            refreshTransactions();
        } catch (error) {
            console.error("Error saving income", error);
            setToast({ show: true, message: 'Error de conexión', type: 'error' });
        }

        setShowModal(false);
        setEditingId(null);
        setNewIncome({ source: '', date: new Date().toLocaleDateString('en-CA'), amount: '', category: '' });
        if (onModalReset) onModalReset();
    };

    const handleEdit = (income) => {
        // Just pre-fill for now, but save will fail/alert as per above
        setEditingId(income._id);
        setNewIncome({
            source: income.source,
            date: income.date,
            amount: income.amount.toString(),
            category: income.category
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {

        try {
            const res = await fetch(`/api/data/incomes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setToast({ show: true, message: 'Ingreso eliminado', type: 'success' });
                // Use functional update to avoid stale state if needed, but context provides setter
                setIncomes(prev => prev.filter(i => i._id !== id));
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
        setNewIncome({ source: '', date: new Date().toLocaleDateString('en-CA'), amount: '', category: '' });
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

    // Filtrar ingresos locally for now
    const filteredIncomes = incomes.filter(income => {
        let matches = true;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSource = income.source.toLowerCase().includes(query);
            const matchesCategory = income.category.toLowerCase().includes(query);
            const matchesAmount = income.amount.toString().includes(query);
            if (!matchesSource && !matchesCategory && !matchesAmount) {
                matches = false;
            }
        }

        if (activeFilters.category && income.category !== activeFilters.category) {
            matches = false;
        }

        if (activeFilters.dateFrom && income.date < activeFilters.dateFrom) {
            matches = false;
        }

        if (activeFilters.dateTo && income.date > activeFilters.dateTo) {
            matches = false;
        }

        // Time Filter Logic (Mobile Header)
        if (timeFilter && timeFilter !== 'all') {
            const incomeDate = new Date(income.date);
            const today = new Date();
            let cutoffDate = new Date();

            if (timeFilter === '7days') {
                cutoffDate.setDate(today.getDate() - 7);
            } else if (timeFilter === 'month') {
                cutoffDate.setMonth(today.getMonth() - 1);
            } else if (timeFilter === '3months') {
                cutoffDate.setMonth(today.getMonth() - 3);
            }

            // Set times to midnight
            incomeDate.setHours(0, 0, 0, 0);
            cutoffDate.setHours(0, 0, 0, 0);

            if (incomeDate < cutoffDate) {
                matches = false;
            }
        }

        return matches;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const hasActiveFilters = activeFilters.category || activeFilters.dateFrom || activeFilters.dateTo;

    // --- Mobile Stats Logic ---
    const totalIncome = useMemo(() => incomes.reduce((acc, curr) => acc + curr.amount, 0), [incomes]);

    // categoryData for MobileChartSection
    const mobileChartData = useMemo(() => {
        const data = {};
        incomes.forEach(inc => {
            data[inc.category] = (data[inc.category] || 0) + inc.amount;
        });
        return Object.entries(data)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [incomes]);

    const topCategory = useMemo(() => {
        if (mobileChartData.length === 0) return 'Ninguna';
        return mobileChartData[0].name;
    }, [mobileChartData]);

    const trendData = useMemo(() => calculateTrend(incomes, timeFilter), [incomes, timeFilter]);

    const mobileStats = [
        {
            title: "Ingreso Total",
            value: `${symbol} ${totalIncome.toFixed(2)}`,
            icon: <DollarSign className="text-green-500" />,
            color: "bg-green-500",
            trend: trendData?.trend,
            trendLabel: trendData?.trendLabel
        },
        { title: "Fuente Top", value: topCategory, icon: <TrendingUp className="text-blue-500" />, color: "bg-blue-500" },
        { title: "Movimientos", value: incomes.length.toString(), icon: <PieIcon className="text-purple-500" />, color: "bg-purple-500" }
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



                <MobileStatsGrid stats={mobileStats} style={{ marginTop: '20px', marginBottom: '-28px' }} />

                {!isNested && (
                    <div className="page-header hidden-mobile">
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <h2 className="page-title">Ingresos</h2>
                                <p className="page-subtitle">Gestiona tus fuentes de ingresos.</p>
                            </div>
                            <button
                                className="btn btn-primary btn-responsive-action"
                                onClick={() => setShowModal(true)}
                            >
                                <Plus className="icon" />
                                <span className="hidden-mobile">Nuevo Ingreso</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabla de Ingresos + Vista Móvil combinadas en una sola Tarjeta */}
                <Card style={{ marginTop: '45px' }}>
                    <h3 className="mb-4 hidden-mobile" style={{ fontSize: '1.2rem' }}>Historial de Ingresos</h3>

                    <div className="transaction-list">
                        {loading ? (
                            <p className="text-center p-4">Cargando...</p>
                        ) : filteredIncomes.length === 0 ? (
                            <p className="text-center text-muted p-4">
                                No se encontraron ingresos {hasActiveFilters && 'con los filtros aplicados'}
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <TransactionList
                                    transactions={filteredIncomes}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    type="income"
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                />
                            </div>
                        )}
                    </div>
                </Card>

            </div>


            {/* Modal Agregar/Editar */}
            {showModal && (
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

                        <h3 className="mb-6">{editingId ? 'Editar Ingreso' : 'Agregar Nuevo Ingreso'}</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Fuente de Ingreso
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Ej: Salario, Freelance, Venta"
                                    value={newIncome.source}
                                    onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Categoría
                                </label>
                                <select
                                    className="input-field"
                                    value={newIncome.category}
                                    onChange={(e) => setNewIncome({ ...newIncome, category: e.target.value })}
                                    required
                                >
                                    <option value="">Selecciona una categoría</option>
                                    <option value="Trabajo">Trabajo</option>
                                    <option value="Proyectos">Proyectos</option>
                                    <option value="Ventas">Ventas</option>
                                    <option value="Inversiones">Inversiones</option>
                                    <option value="Otro">Otro</option>
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
                                    value={newIncome.amount}
                                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
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
                                    value={newIncome.date}
                                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 justify-end w-full">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleDelete(editingId);
                                            setShowModal(false);
                                        }}
                                        className="btn"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: '1px solid rgba(239, 68, 68, 0.5)',
                                            color: '#fca5a5',
                                            marginRight: 'auto'
                                        }}
                                    >
                                        <CustomTrashIcon size={18} />
                                    </button>
                                )}
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? <><CustomPencilIcon size={18} /> Actualizar</> : <><Plus size={18} /> Agregar</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Filtros */}
            {showFilterModal && (
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

                        <h3 className="mb-6">Filtrar Ingresos</h3>

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
                                <option value="Trabajo">Trabajo</option>
                                <option value="Proyectos">Proyectos</option>
                                <option value="Ventas">Ventas</option>
                                <option value="Inversiones">Inversiones</option>
                                <option value="Otro">Otro</option>
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
            )}
        </>
    );
};

export default Income;
