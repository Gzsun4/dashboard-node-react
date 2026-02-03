import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Wallet, PieChart, TrendingUp, DollarSign, X, EllipsisVertical, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import MobileHeader from '../components/MobileHeader';
import MobileStatsGrid from '../components/MobileStatsGrid';
import Toast from '../components/Toast';
import { useTransactions } from '../context/TransactionContext';

const Budgets = ({ isNested = false, triggerAddModal = 0, onModalReset }) => {
    const { user, token } = useAuth();
    const { symbol } = useCurrency();
    const { budgets, setBudgets, hasLoaded: globalLoaded, refresh: refreshTransactions } = useTransactions();
    const [loading, setLoading] = useState(!globalLoaded);

    useEffect(() => {
        if (globalLoaded) {
            setLoading(false);
        }
    }, [globalLoaded]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        limit: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });


    // Suggested categories (Standardized across the app)
    const commonCategories = ["Alimentación", "Transporte", "Servicios", "Entretenimiento", "Salud", "Educación", "Hogar", "Otros"];


    useEffect(() => {
        if (triggerAddModal > 0) {
            setEditingId(null);
            setFormData({ category: '', limit: '' });
            setShowModal(true);
        }
    }, [triggerAddModal]);

    const handleCloseModal = () => {
        setShowModal(false);
        if (onModalReset) onModalReset();
    };


    // Calculate Totals for Bento Grid
    const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
    const totalAvailable = totalLimit - totalSpent;

    const stats = [
        {
            title: "Disponible Global",
            value: `${symbol}${totalAvailable.toFixed(2)}`,
            icon: <Wallet />,
            color: "bg-orange-500"
        },
        {
            title: "Presupuesto Total",
            value: `${symbol}${totalLimit.toFixed(2)}`,
            icon: <PieChart />,
            color: "bg-blue-500"
        },
        {
            title: "Total Gastado",
            value: `${symbol}${totalSpent.toFixed(2)}`,
            icon: <TrendingUp />,
            color: "bg-red-500"
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `/api/budgets/${editingId}`
                : '/api/budgets';

            const method = editingId ? 'PUT' : 'POST';

            const payload = {
                category: formData.category,
                limit: parseFloat(formData.limit)
            };

            console.log("Saving budget:", payload);

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                setFormData({ category: '', limit: '' });
                setEditingId(null);
                refreshTransactions();
                setToast({ show: true, message: editingId ? 'Presupuesto actualizado' : 'Presupuesto creado', type: 'success' });
                if (onModalReset) onModalReset();
            } else {
                const err = await res.json();
                console.error("Server error:", err);
                setToast({ show: true, message: `Error: ${err.message || 'No se pudo guardar'}`, type: 'error' });
            }
        } catch (error) {
            console.error("Network error:", error);
            setToast({ show: true, message: "Error de conexión al guardar", type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/budgets/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            refreshTransactions();
            setToast({ show: true, message: 'Presupuesto eliminado', type: 'success' });
        } catch (error) {
            console.error("Error deleting budget:", error);
            setToast({ show: true, message: 'Error al eliminar', type: 'error' });
        }
    };

    const openEdit = (budget) => {
        setFormData({ category: budget.category, limit: budget.limit });
        setEditingId(budget._id);
        setShowModal(true);
    };

    const getProgressColor = (percent) => {
        if (percent < 50) return 'bg-success'; // Green
        if (percent < 80) return 'bg-warning'; // Yellow/Orange
        return 'bg-danger'; // Red
    };

    return (
        <>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            <div className={`${!isNested ? 'animate-fade-in' : ''} w-full h-full pb-20 md:pb-0`}>


                {/* Mobile Bento Grid Stats */}
                <MobileStatsGrid stats={stats} />

                {/* Desktop Header (Hidden on Mobile) */}
                {!isNested && (
                    <div className="flex justify-between items-center mb-6 hidden-mobile">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Presupuestos</h1>
                            <p className="text-secondary text-sm">Controla tus límites de gasto mensual</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ category: '', limit: '' });
                                setShowModal(true);
                            }}
                            className="btn-responsive-action glass hover:bg-white/10 text-white border border-white/10 transition-all active:scale-95"
                        >
                            <Plus className="icon" />
                            <span>Nuevo Presupuesto</span>
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-4 border-t-purple-500 border-white/10 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="pb-24">
                        {/* Section Header */}
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h2 className="text-xl font-bold text-white">Mis Categorías</h2>
                            <span className="text-sm text-secondary">{budgets.length} activos</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 sm:gap-4">
                            {budgets.length === 0 ? (
                                <div className="col-span-full glass-card p-10 text-center text-secondary border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                        <Wallet className="w-10 h-10 opacity-30 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No tienes presupuestos</h3>

                                </div>
                            ) : (
                                budgets.map(budget => {
                                    const percent = Math.min(budget.percentage, 100);
                                    const isExceeded = budget.spent > budget.limit;
                                    const isWarning = percent >= 80 && !isExceeded;

                                    let statusText = "Excelente";
                                    let statusColor = "#10b981"; // emerald-500
                                    let progressBg = "#10b981";
                                    let StatusIcon = CheckCircle;

                                    if (isExceeded) {
                                        statusText = "Excedido";
                                        statusColor = "#ef4444"; // red-500
                                        progressBg = "#ef4444";
                                        StatusIcon = XCircle;
                                    } else if (isWarning) {
                                        statusText = "Atención";
                                        statusColor = "#f59e0b"; // amber-500
                                        progressBg = "#f59e0b";
                                        StatusIcon = AlertTriangle;
                                    }

                                    return (
                                        <div
                                            key={budget._id}
                                            onClick={() => openEdit(budget)}
                                            style={{
                                                backgroundColor: '#151b2b',
                                                borderRadius: '20px',
                                                padding: '24px',
                                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                                                marginBottom: '15px',
                                                cursor: 'pointer'
                                            }}
                                            className="relative group transition-all duration-300 hover:-translate-y-1 hover:border hover:border-white/10"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.01em' }}>{budget.category}</h3>
                                            </div>

                                            <div
                                                style={{
                                                    backgroundColor: `${statusColor}1a`,
                                                    color: statusColor,
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    marginBottom: '20px',
                                                    border: 'none',
                                                    display: 'inline-flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    width: 'fit-content'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '14px',
                                                        height: '14px',
                                                        borderColor: statusColor,
                                                        border: `1px solid ${statusColor}`,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <StatusIcon size={9} style={{ color: statusColor, strokeWidth: 3 }} />
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.01em' }}>{statusText}</span>
                                            </div>

                                            <div className="flex justify-between items-end mb-[15px]">
                                                <div>
                                                    <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '2px', opacity: 0.8, fontWeight: '500' }}>Gastado</p>
                                                    <p style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.01em', lineHeight: '1.2' }}>{symbol}{budget.spent.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '2px', opacity: 0.8, fontWeight: '500' }}>Límite</p>
                                                    <p style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>{symbol}{budget.limit.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '10px' }}>
                                                <div style={{ height: '10px', backgroundColor: '#1e293b', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                                                    <div
                                                        className="transition-all duration-1000 ease-out"
                                                        style={{
                                                            width: `${percent}%`,
                                                            height: '100%',
                                                            backgroundColor: progressBg,
                                                            borderRadius: '10px'
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between" style={{ color: '#475569', fontSize: '11px', fontWeight: '500', marginTop: '4px' }}>
                                                    <span>0%</span>
                                                    <span>{Math.round(budget.percentage)}% Utilizado</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                        </div>
                    </div>
                )}

                {/* FAB Button - Mobile Only */}
                {!isNested && (
                    <button
                        className="fab-button fab-primary fab-purple"
                        onClick={() => {
                            setEditingId(null);
                            setFormData({ category: '', limit: '' });
                            setShowModal(true);
                        }}
                        aria-label="Nuevo Presupuesto"
                    >
                        <Plus size={24} />
                    </button>
                )}

                {showModal && (
                    <div className="modal-backdrop">
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

                            <h3 className="mb-6 text-center text-xl font-bold text-white">
                                {editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                            </h3>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                        Categoría
                                    </label>
                                    <input
                                        list="categories"
                                        type="text"
                                        required
                                        className="input-field w-full"
                                        placeholder="Ej. Alimentos"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    />
                                    <datalist id="categories">
                                        {commonCategories.map(cat => <option key={cat} value={cat} />)}
                                    </datalist>
                                </div>

                                <div className="mb-6">
                                    <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                        Límite Mensual ({symbol})
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="0.01"
                                        className="input-field w-full"
                                        placeholder="0.00"
                                        value={formData.limit}
                                        onChange={e => setFormData({ ...formData, limit: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <button type="submit" className="btn btn-primary flex justify-center items-center w-full">
                                        {editingId ? 'Actualizar' : 'Registrar'}
                                    </button>

                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                handleDelete(editingId);
                                            }}
                                            className="flex justify-center items-center w-full transition-colors duration-200"
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #ef4444',
                                                borderRadius: '0.5rem',
                                                color: '#ef4444',
                                                fontWeight: 'bold',
                                                padding: '12px',
                                                marginTop: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={18} className="mr-2" />
                                            Eliminar Presupuesto
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Budgets;
