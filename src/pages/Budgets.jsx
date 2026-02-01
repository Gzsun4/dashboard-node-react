import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Wallet, PieChart, TrendingUp, DollarSign, X, EllipsisVertical, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import MobileStatsGrid from '../components/MobileStatsGrid';

const Budgets = () => {
    const { user, token } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        limit: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null); // Track open dropdown

    // Suggested categories (Standardized across the app)
    const commonCategories = ["Alimentación", "Transporte", "Servicios", "Entretenimiento", "Salud", "Educación", "Hogar", "Otros"];

    useEffect(() => {
        if (token) fetchBudgets();
    }, [token]);

    const fetchBudgets = async () => {
        try {
            const res = await fetch('/api/budgets', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setBudgets(data);
            }
        } catch (error) {
            console.error("Error fetching budgets:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Totals for Bento Grid
    const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
    const totalAvailable = totalLimit - totalSpent;

    const stats = [
        {
            title: "Disponible Global",
            value: `S/. ${totalAvailable.toFixed(2)}`,
            icon: <Wallet />,
            color: "bg-purple-500"
        },
        {
            title: "Presupuesto Total",
            value: `S/. ${totalLimit.toFixed(2)}`,
            icon: <PieChart />,
            color: "bg-blue-500"
        },
        {
            title: "Total Gastado",
            value: `S/. ${totalSpent.toFixed(2)}`,
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
                fetchBudgets();
            } else {
                const err = await res.json();
                console.error("Server error:", err);
                alert(`Error: ${err.message || 'No se pudo guardar'}`);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Error de conexión al guardar");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar este presupuesto?')) return;
        try {
            await fetch(`/api/budgets/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchBudgets();
        } catch (error) {
            console.error("Error deleting budget:", error);
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

    // ... 

    return (
        <>
            <div className="animate-fade-in relative z-10 w-full h-full pb-20 md:pb-0">
                {/* Mobile Header (Hamburger + Title + Add Button) */}
                <MobileHeader
                    title="Presupuestos"
                    onAddClick={() => setShowModal(true)}
                    themeColor="#c084fc" // Purple to match the gradient
                />

                {/* Mobile Bento Grid Stats */}
                <MobileStatsGrid stats={stats} />

                {/* Desktop Header (Hidden on Mobile) */}
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
                                    <p className="mb-6 max-w-sm mx-auto">Define límites para tus gastos y mantén tu economía bajo control.</p>
                                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                                        <Plus size={18} /> Crear mi primer presupuesto
                                    </button>
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
                                            style={{
                                                backgroundColor: '#151b2b',
                                                borderRadius: '20px',
                                                padding: '24px',
                                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                                                marginBottom: '15px'
                                            }}
                                            className="relative group transition-all duration-300 hover:-translate-y-1"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'white', margin: 0, letterSpacing: '-0.01em' }}>{budget.category}</h3>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setOpenMenuId(openMenuId === budget._id ? null : budget._id)}
                                                        style={{ color: '#64748b', fontSize: '24px', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        <EllipsisVertical size={24} />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {openMenuId === budget._id && (
                                                        <div
                                                            className="absolute top-[30px] right-0 bg-[#1e293b] border border-[#334155] rounded-[12px] p-[6px] w-[130px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] z-[100] animate-fade-in"
                                                        >
                                                            <button
                                                                onClick={() => { openEdit(budget); setOpenMenuId(null); }}
                                                                className="w-full flex items-center px-3 py-2.5 rounded-[8px] cursor-pointer text-[14px] font-[500] transition-colors duration-200 text-[#38bdf8] hover:bg-[#334155] border-none"
                                                                style={{ background: 'transparent' }}
                                                            >
                                                                <Edit2 size={16} className="mr-2.5" /> Editar
                                                            </button>
                                                            <button
                                                                onClick={() => { handleDelete(budget._id); setOpenMenuId(null); }}
                                                                className="w-full flex items-center px-3 py-2.5 rounded-[8px] cursor-pointer text-[14px] font-[500] transition-colors duration-200 text-[#f87171] hover:bg-[#334155] border-none"
                                                                style={{ background: 'transparent' }}
                                                            >
                                                                <Trash2 size={16} className="mr-2.5" /> Eliminar
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Backdrop */}
                                                    {openMenuId === budget._id && (
                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
                                                    )}
                                                </div>
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
                                                    <p style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.01em', lineHeight: '1.2' }}>S/. {budget.spent.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '2px', opacity: 0.8, fontWeight: '500' }}>Límite</p>
                                                    <p style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>S/. {budget.limit.toFixed(2)}</p>
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
                            {budgets.length > 0 && (
                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({ category: '', limit: '' });
                                        setShowModal(true);
                                    }}
                                    style={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.3)',
                                        border: '2px dashed rgba(255, 255, 255, 0.1)',
                                        borderRadius: '20px',
                                        padding: '32px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        minHeight: '220px'
                                    }}
                                    className="group hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                                        <Plus size={24} className="text-slate-400 group-hover:text-white" />
                                    </div>
                                    <span className="text-slate-400 font-bold group-hover:text-white uppercase tracking-widest text-xs">Nuevo Presupuesto</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {showModal && (
                    <div className="modal-backdrop">
                        <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                            <button
                                onClick={() => setShowModal(false)}
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
                                        Límite Mensual (S/.)
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

                                <div className="flex flex-col gap-3">
                                    <button type="submit" className="btn btn-primary flex justify-center items-center w-full">
                                        {editingId ? 'Actualizar' : 'Registrar'}
                                    </button>
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
