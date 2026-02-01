import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Search, Filter, X, Menu, DollarSign, TrendingUp, PieChart as PieIcon, Briefcase, Lightbulb, Wallet, Activity } from 'lucide-react';
import MobileMenuButton from '../components/MobileMenuButton';
import CustomPencilIcon from '../components/CustomPencilIcon';
import CustomTrashIcon from '../components/CustomTrashIcon';
import MobileHeader from '../components/MobileHeader';
import MobileStatsGrid from '../components/MobileStatsGrid';
import MobileChartSection from '../components/MobileChartSection';
import TransactionItem from '../components/TransactionItem';
import TransactionList from '../components/TransactionList';
import Toast from '../components/Toast';

const Income = () => {
    const { token } = useAuth();
    const { symbol } = useCurrency();
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    useEffect(() => {
        if (token) fetchIncomes();
    }, [token]);

    const fetchIncomes = async () => {
        try {
            const response = await fetch('/api/data/incomes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setIncomes(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching incomes", error);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
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
            fetchIncomes();
        } catch (error) {
            console.error("Error saving income", error);
            setToast({ show: true, message: 'Error de conexión', type: 'error' });
        }

        setShowModal(false);
        setEditingId(null);
        setNewIncome({ source: '', date: new Date().toLocaleDateString('en-CA'), amount: '', category: '' });
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
                setIncomes(incomes.filter(i => i._id !== id));
                setToast({ show: true, message: 'Ingreso eliminado', type: 'success' });
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

    const mobileStats = [
        { title: "Ingreso Total", value: `${symbol} ${totalIncome.toFixed(2)}`, icon: <DollarSign className="text-green-500" />, color: "bg-green-500" },
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

                <MobileHeader
                    title="Ingresos"
                    onAddClick={() => setShowModal(true)}
                    themeColor="#10b981" // Cambiado a verde por solicitud
                    label="Agregar"
                />

                <MobileStatsGrid stats={mobileStats} />

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

                <div className="mb-6 flex gap-4 search-filter-container">
                    <div className="relative w-full search-container-mobile" style={{ maxWidth: '400px' }}>
                        <div className="absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}>
                            <Search size={18} />
                        </div>
                        <input type="text" placeholder="Buscar ingresos..." className="input-field" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                    <button
                        className="btn glass btn-mobile-full"
                        onClick={() => setShowFilterModal(true)}
                        style={{
                            background: hasActiveFilters ? 'hsl(var(--accent-primary) / 0.2)' : undefined,
                            borderColor: hasActiveFilters ? 'hsl(var(--accent-primary))' : undefined
                        }}
                    >
                        <Filter size={18} /> Filtrar {hasActiveFilters && `(${Object.values(activeFilters).filter(v => v).length})`}
                    </button>
                </div>
                {/* Tabla de Ingresos + Vista Móvil combinadas en una sola Tarjeta */}
                <Card>
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
                                />
                            </div>
                        )}
                    </div>
                </Card>

            </div>

            {/* Floating Action Button (FAB) - Mobile Only */}
            <button
                className="fab-button"
                onClick={() => setShowBottomSheet(true)}
                aria-label="Buscar y filtrar"
            >
                <Search size={24} />
            </button>

            {/* Bottom Sheet Modal - Mobile Only */}
            {showBottomSheet && (
                <div
                    className="bottom-sheet-backdrop"
                    onClick={() => setShowBottomSheet(false)}
                >
                    <div
                        className="bottom-sheet-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bottom-sheet-handle"></div>

                        <div className="bottom-sheet-header">
                            <h3 className="bottom-sheet-title">Buscar y Filtrar</h3>
                            <button
                                className="bottom-sheet-close"
                                onClick={() => setShowBottomSheet(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="mb-4">
                            <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Buscar
                            </label>
                            <div className="relative">
                                <div className="absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}>
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar ingresos..."
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filter Button */}
                        <div className="flex gap-3 mt-4">
                            {/* Filter Button */}
                            <button
                                className="btn glass flex-1"
                                onClick={() => {
                                    setShowBottomSheet(false);
                                    setShowFilterModal(true);
                                }}
                                style={{
                                    background: hasActiveFilters ? 'hsl(var(--accent-primary) / 0.2)' : undefined,
                                    borderColor: hasActiveFilters ? 'hsl(var(--accent-primary))' : undefined,
                                    justifyContent: 'center'
                                }}
                            >
                                <Filter size={18} /> Filtrar {hasActiveFilters && `(${Object.values(activeFilters).filter(v => v).length})`}
                            </button>

                            {/* Close Button */}
                            <button
                                className="btn btn-primary flex-1"
                                onClick={() => setShowBottomSheet(false)}
                            >
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
