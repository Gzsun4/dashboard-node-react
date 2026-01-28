import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Plus, Target, Car, Home, Smartphone, X, History, DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import MobileStatsGrid from '../components/MobileStatsGrid';
import CustomPencilIcon from '../components/CustomPencilIcon';
import CustomTrashIcon from '../components/CustomTrashIcon';

const Debts = () => {
    const { token } = useAuth();
    const { symbol } = useCurrency();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock/Fetch logic - Replace with actual endpoint if available
    useEffect(() => {
        if (token) fetchDebts();
    }, [token]);

    const fetchDebts = async () => {
        try {
            // Using /api/data/debts assuming backend consistency. 
            // If it fails, empty array allows UI verification.
            const response = await fetch('/api/data/debts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDebts(data);
            } else {
                console.warn("Endpoints de deudas no encontrados, usando datos locales vacíos");
                setDebts([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching debts", error);
            setLoading(false);
            setDebts([]);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newDebt, setNewDebt] = useState({
        name: '',
        totalAmount: '',
        paidAmount: '',
        deadline: ''
    });

    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [amountToPay, setAmountToPay] = useState('');

    const [selectedIcon, setSelectedIcon] = useState(0);

    const iconOptions = [
        { name: 'Tarjeta', icon: CreditCard, color: 'hsl(var(--accent-secondary))' },
        { name: 'Préstamo', icon: DollarSign, color: 'hsl(var(--accent-primary))' },
        { name: 'Casa', icon: Home, color: 'hsl(var(--accent-success))' },
        { name: 'Coche', icon: Car, color: 'hsl(var(--accent-danger))' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            const body = JSON.stringify({
                name: newDebt.name,
                target: parseFloat(newDebt.totalAmount), // Mapping total to target
                current: parseFloat(newDebt.paidAmount || 0), // Mapping paid to current
                color: iconOptions[selectedIcon].color,
                deadline: newDebt.deadline,
                type: 'debt' // Flag to distinguish if reusing same schema
            });

            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `/api/data/debts/${editingId}` : '/api/data/debts';

            // Fallback for UI demo if backend fails
            const mockDebt = {
                _id: editingId || Date.now().toString(),
                name: newDebt.name,
                target: parseFloat(newDebt.totalAmount),
                current: parseFloat(newDebt.paidAmount || 0),
                color: iconOptions[selectedIcon].color,
                deadline: newDebt.deadline
            };

            // Optimistic update
            if (editingId) {
                setDebts(debts.map(d => d._id === editingId ? mockDebt : d));
            } else {
                setDebts([...debts, mockDebt]);
            }

            // Actual call - BACKGROUND SYNC
            try {
                const res = await fetch(url, { method, headers, body });
                if (res.ok) {
                    const data = await res.json();
                    if (editingId) {
                        setDebts(prev => prev.map(d => d._id === editingId ? data : d));
                    } else {
                        // Replace the temp ID with real ID from server
                        setDebts(prev => prev.map(d => d._id === mockDebt._id ? data : d));
                    }
                }
            } catch (err) {
                console.error("Failed to sync debt", err);
                // Optionally revert optimistic update here
            }

        } catch (error) {
            console.error("Error saving debt", error);
        }

        setShowModal(false);
        setEditingId(null);
        setNewDebt({ name: '', totalAmount: '', paidAmount: '', deadline: '' });
        setSelectedIcon(0);
    };

    const handleEdit = (debt) => {
        setEditingId(debt._id);
        setNewDebt({
            name: debt.name,
            totalAmount: debt.target.toString(),
            paidAmount: debt.current.toString(),
            deadline: debt.deadline || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar esta deuda?")) return;

        // Optimistic delete
        setDebts(debts.filter(d => d._id !== id));

        try {
            await fetch(`/api/data/debts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error deleting debt", error);
            // Optionally revert
            fetchDebts();
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewDebt({ name: '', totalAmount: '', paidAmount: '', deadline: '' });
        setSelectedIcon(0);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        const amount = parseFloat(amountToPay);
        if (isNaN(amount) || amount <= 0) return;

        const updatedDebt = {
            ...selectedDebt,
            current: selectedDebt.current + amount
        };

        setDebts(debts.map(d => d._id === selectedDebt._id ? updatedDebt : d));

        try {
            await fetch(`/api/data/debts/${selectedDebt._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ current: updatedDebt.current }) // Only sending updated current amount
            });
        } catch (error) {
            console.error("Error updating payment", error);
            fetchDebts(); // Revert on error
        }

        setShowPayModal(false);
        setAmountToPay('');
        setSelectedDebt(null);
    };

    const openPayModal = (debt) => {
        setSelectedDebt(debt);
        setAmountToPay('');
        setShowPayModal(true);
    };

    const totalDebts = debts.reduce((acc, curr) => acc + (curr.target - curr.current), 0);
    const totalPaid = debts.reduce((acc, curr) => acc + curr.current, 0);

    // Stats for Bento/Header
    const mobileStats = [
        { title: "Deuda Restante", value: `${symbol} ${totalDebts.toLocaleString()}`, icon: <AlertCircle className="text-white" />, color: "bg-red-600" },
        { title: "Total Pagado", value: `${symbol} ${totalPaid.toLocaleString()}`, icon: <CreditCard className="text-blue-500" />, color: "bg-blue-600" },
        { title: "Deudas Activas", value: debts.length.toString(), icon: <TrendingUp className="text-purple-500" />, color: "bg-purple-600" }
    ];

    return (
        <>
            <div className="animate-fade-in">
                <MobileHeader
                    title="Deudas"
                    themeColor="#ef4444" // Red for debts
                />

                <MobileStatsGrid stats={mobileStats} />

                <div className="page-header hidden-mobile">
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h2 className="page-title">Deudas</h2>
                            <p className="page-subtitle">Gestiona y elimina tus deudas.</p>
                        </div>
                        <button
                            className="glass-card flex items-center gap-2 px-4 py-2 text-white hover:bg-white/5 transition-colors"
                            style={{ border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                            onClick={() => setShowModal(true)}
                        >
                            <Plus size={18} />
                            <span>Nueva Deuda</span>
                        </button>
                    </div>
                </div>

                <div className="savings-grid"> {/* Reusing grid class or create new debts-grid */}
                    {loading ? <p>Cargando...</p> : debts.length === 0 ? <p className="text-muted text-center py-8">No tienes deudas registradas. ¡Bien hecho!</p> : debts.map((debt) => {
                        const progress = (debt.current / debt.target) * 100; // Paid percentage
                        const DebtIcon = CreditCard;

                        return (
                            <Card key={debt._id} className="relative">
                                <div className="absolute top-0 right-0 p-4" style={{ opacity: 0.1 }}>
                                    <DebtIcon size={100} color={debt.color || 'red'} />
                                </div>

                                <div className="relative" style={{ zIndex: 10 }}>
                                    <div className="flex justify-between mb-4" style={{ alignItems: 'flex-start' }}>
                                        <div className="p-3 rounded-lg" style={{ background: `rgba(255,255,255,0.05)` }}>
                                            <DebtIcon size={24} color={debt.color || 'red'} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted">Total Deuda</p>
                                            <p style={{ fontWeight: 700, fontSize: '1.2rem', color: '#ef4444' }}>{symbol} {debt.target.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{debt.name}</h3>
                                    <p className="text-secondary mb-6">
                                        {symbol} {debt.current.toLocaleString()} <span style={{ fontSize: '0.875rem' }}>pagados</span>
                                    </p>

                                    <div className="w-full rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.1)', height: '0.75rem' }}>
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: debt.color || '#ef4444', transition: 'width 1s ease-out' }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm mb-4">
                                        <span className="text-white" style={{ fontWeight: 600 }}>{progress.toFixed(0)}% Pagado</span>
                                        <span className="text-muted">Resta {symbol} {(debt.target - debt.current).toLocaleString()}</span>
                                    </div>

                                    <div className="goal-actions">
                                        <button
                                            onClick={() => openPayModal(debt)}
                                            className="btn-add-money"
                                            style={{
                                                background: 'linear-gradient(135deg, hsl(350, 70%, 55%), hsl(350, 70%, 45%))', // Reddish gradient
                                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{symbol}</span>
                                            <span>Abonar</span>
                                        </button>
                                        <div className="goal-secondary-actions">
                                            <button onClick={() => handleEdit(debt)} className="btn-icon">
                                                <CustomPencilIcon size={20} />
                                            </button>
                                            <button onClick={() => handleDelete(debt._id)} className="btn-icon btn-icon-danger">
                                                <CustomTrashIcon size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    <button
                        className="glass-card flex-col flex-center p-6"
                        style={{
                            border: '2px dashed rgba(255,255,255,0.2)',
                            background: 'transparent',
                            minHeight: '200px',
                            width: '100%',
                            cursor: 'pointer'
                        }}
                        onClick={() => setShowModal(true)}
                    >
                        <div className="w-12 h-12 rounded-full mb-4 flex-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <Plus size={24} className="text-secondary" />
                        </div>
                        <p className="text-secondary" style={{ fontWeight: 600 }}>Registrar Nueva Deuda</p>
                    </button>
                </div>
            </div>

            {/* Modal Crear/Editar Deuda */}
            {showModal && (
                <div className="modal-backdrop" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button onClick={handleCloseModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>

                        <h3 className="mb-6">{editingId ? 'Editar Deuda' : 'Registrar Nueva Deuda'}</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="text-sm text-secondary block mb-2">Concepto de la Deuda</label>
                                <input type="text" className="input-field" placeholder="Ej: Tarjeta de Crédito, Préstamo Personal" value={newDebt.name} onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })} required />
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-secondary block mb-2">Monto Total a Pagar</label>
                                <input type="number" step="0.01" className="input-field" placeholder="0.00" value={newDebt.totalAmount} onChange={(e) => setNewDebt({ ...newDebt, totalAmount: e.target.value })} required />
                            </div>

                            <div className="mb-6">
                                <label className="text-sm text-secondary block mb-2">Monto Ya Pagado (Opcional)</label>
                                <input type="number" step="0.01" className="input-field" placeholder="0.00" value={newDebt.paidAmount} onChange={(e) => setNewDebt({ ...newDebt, paidAmount: e.target.value })} />
                            </div>

                            <button type="submit" className="btn btn-primary w-full">
                                {editingId ? 'Actualizar Deuda' : 'Registrar Deuda'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Abonar */}
            {showPayModal && (
                <div className="modal-backdrop" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', zIndex: 1000 }}>
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
                        <button onClick={() => setShowPayModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                        <h3 className="mb-6">Abonar a {selectedDebt?.name}</h3>
                        <form onSubmit={handlePayment}>
                            <div className="mb-6">
                                <label className="text-sm text-secondary mb-2 block">Monto a abonar</label>
                                <input type="number" step="0.01" className="input-field" placeholder="0.00" value={amountToPay} onChange={(e) => setAmountToPay(e.target.value)} autoFocus required />
                            </div>
                            <button type="submit" className="btn btn-primary w-full justify-center" style={{ background: 'hsl(var(--accent-danger))' }}>
                                <DollarSign size={18} /> Confirmar Abono
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Debts;
