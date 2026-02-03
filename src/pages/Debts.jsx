import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useDebts } from '../context/DebtContext';
import { Plus, Target, Car, Home, Smartphone, X, History, DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import MobileStatsGrid from '../components/MobileStatsGrid';
import CustomPencilIcon from '../components/CustomPencilIcon';
import CustomTrashIcon from '../components/CustomTrashIcon';
import Toast from '../components/Toast';

const Debts = ({ isNested = false, triggerAddModal = 0, onModalReset }) => {
    const { token } = useAuth();
    const { symbol } = useCurrency();
    const { debts, loading, fetchDebts } = useDebts(); // Use Context
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    // Mock/Fetch logic removed since it is handled by Context
    useEffect(() => {
        if (triggerAddModal > 0) {
            setEditingId(null);
            setNewDebt({ name: '', totalAmount: '', paidAmount: '', deadline: '' });
            setSelectedIcon(0);
            setShowModal(true);
        }
    }, [triggerAddModal]);

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
            const target = parseFloat(newDebt.totalAmount); // Mapping total to target
            const current = parseFloat(newDebt.paidAmount || 0); // Mapping paid to current

            if (current > target) {
                setToast({
                    show: true,
                    message: `El monto pagado no puede ser mayor al total de la deuda (${symbol} ${target.toLocaleString()})`,
                    type: 'error'
                });
                return;
            }

            const body = JSON.stringify({
                name: newDebt.name,
                target: target,
                current: current,
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

            // Optimistic update removed - relying on fast context refresh

            // Actual call - BACKGROUND SYNC
            try {
                const res = await fetch(url, { method, headers, body });
                if (res.ok) {
                    await fetchDebts(); // Update global context
                }
            } catch (err) {
                console.error("Failed to sync debt", err);
            }

        } catch (error) {
            console.error("Error saving debt", error);
        }

        setShowModal(false);
        setEditingId(null);
        setNewDebt({ name: '', totalAmount: '', paidAmount: '', deadline: '' });
        setSelectedIcon(0);
    };

    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const handleEdit = (debt) => {
        setEditingId(debt._id);
        setSelectedDebt(debt); // Set for history/delete context
        setNewDebt({
            name: debt.name,
            totalAmount: debt.target.toString(),
            paidAmount: debt.current.toString(),
            deadline: debt.deadline || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {

        try {
            const response = await fetch(`/api/data/debts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchDebts(); // Update global context
                setToast({ show: true, message: 'Deuda eliminada', type: 'success' });
            } else {
                setToast({ show: true, message: 'Error al eliminar', type: 'error' });
            }
        } catch (error) {
            setToast({ show: true, message: 'Error de conexión', type: 'error' });
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewDebt({ name: '', totalAmount: '', paidAmount: '', deadline: '' });
        setSelectedIcon(0);
        if (onModalReset) onModalReset();
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        const amount = parseFloat(amountToPay);
        if (isNaN(amount) || amount <= 0) return;

        const remaining = selectedDebt.target - selectedDebt.current;
        if (amount > remaining) {
            setToast({
                show: true,
                message: `No puedes abonar más de la deuda restante (${symbol} ${remaining.toFixed(2)})`,
                type: 'error'
            });
            return;
        }

        const newHistory = [...(selectedDebt.history || []), {
            amount: amount,
            date: new Date().toLocaleDateString(),
            note: 'Abono'
        }];

        const updatedDebt = {
            ...selectedDebt,
            current: selectedDebt.current + amount,
            history: newHistory
        };

        try {
            const response = await fetch(`/api/data/debts/${selectedDebt._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedDebt)
            });

            if (response.ok) {
                await fetchDebts(); // Update global context
                setToast({ show: true, message: 'Abono realizado exitosamente', type: 'success' });
                setShowPayModal(false);
                if (onModalReset) onModalReset();
            } else {
                setToast({ show: true, message: 'Error al realizar el abono', type: 'error' });
            }
        } catch (error) {
            setToast({ show: true, message: 'Error de conexión', type: 'error' });
        }
    };

    const openPayModal = (debt) => {
        setSelectedDebt(debt);
        setAmountToPay('');
        setShowPayModal(true);
    };

    // Calculate totals
    const totalDebts = debts.reduce((acc, curr) => acc + curr.target, 0);
    const totalPaid = debts.reduce((acc, curr) => acc + curr.current, 0);
    const totalPending = totalDebts - totalPaid;

    // Stats for Bento/Header
    const mobileStats = [
        { title: "Deuda Restante", value: `${symbol} ${totalPending.toLocaleString()}`, icon: <AlertCircle className="text-white" />, color: "bg-red-600" },
        { title: "Total Pagado", value: `${symbol} ${totalPaid.toLocaleString()}`, icon: <CreditCard className="text-blue-500" />, color: "bg-blue-600" },
        { title: "Deudas Activas", value: debts.length.toString(), icon: <TrendingUp className="text-purple-500" />, color: "bg-purple-600" }
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
            <div className={!isNested ? 'animate-fade-in' : ''}>


                <MobileStatsGrid stats={mobileStats} />

                {!isNested && (
                    <div className="page-header hidden-mobile">
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <h2 className="page-title">Deudas</h2>
                                <p className="page-subtitle">Gestiona y elimina tus deudas.</p>
                            </div>

                        </div>
                    </div>
                )}

                <div className="savings-grid"> {/* Reusing grid class or create new debts-grid */}
                    {loading ? <p>Cargando...</p> : debts.length === 0 ? <p className="text-muted text-center py-8">No tienes deudas registradas. ¡Bien hecho!</p> : debts.map((debt) => {
                        const progress = (debt.current / debt.target) * 100; // Paid percentage
                        const isPaid = progress >= 100;
                        const DebtIcon = CreditCard;

                        return (
                            <Card
                                key={debt._id}
                                className="relative"
                                onClick={() => handleEdit(debt)}
                                style={{ cursor: 'pointer' }}
                            >
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
                                        {isPaid ? (
                                            <div
                                                className="btn-add-money user-select-none"
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    boxShadow: 'none',
                                                    color: 'hsl(var(--accent-success))',
                                                    cursor: 'default',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '1.1rem'
                                                }}
                                            >
                                                Saldado
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openPayModal(debt); }}
                                                className="btn-add-money"
                                                style={{
                                                    background: 'linear-gradient(135deg, hsl(350, 70%, 55%), hsl(350, 70%, 45%))', // Reddish gradient
                                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{symbol}</span>
                                                <span>Abonar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}

                    {!isNested && (
                        <button
                            className="glass-card flex-col flex-center p-6"
                            style={{
                                border: '2px dashed rgba(255,255,255,0.2)',
                                background: 'transparent',
                                minHeight: '200px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onClick={() => {
                                setEditingId(null);
                                setNewDebt({ name: '', totalAmount: '', paidAmount: '', deadline: '' });
                                setShowModal(true);
                            }}
                        >
                            <div className="p-4 rounded-full bg-danger-soft mb-3" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                <Plus size={32} className="text-danger" style={{ color: '#ef4444' }} />
                            </div>
                            <h3 className="text-lg mb-1">Nueva Deuda</h3>
                            <p className="text-sm text-muted">Registra una nueva deuda</p>
                        </button>
                    )}
                </div>
            </div>

            {/* Modal Nueva/Editar Deuda */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
                        <button
                            onClick={handleCloseModal}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        <h3 className="mb-6 text-center">{editingId ? 'Editar Deuda' : 'Nueva Deuda'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Nombre de la deuda
                                </label>
                                <input type="text" className="input-field" placeholder="Ej. Tarjeta Crédito" value={newDebt.name} onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })} required />
                            </div>
                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Monto Total
                                </label>
                                <input type="number" step="0.01" className="input-field" placeholder="0.00" value={newDebt.totalAmount} onChange={(e) => setNewDebt({ ...newDebt, totalAmount: e.target.value })} required />
                            </div>
                            {/* Icon Selection could be added here similar to Savings */}
                            <div className="mb-6">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    {editingId ? 'Monto Pagado Actual' : 'Monto Pagado Inicial'}
                                </label>
                                <input type="number" step="0.01" className="input-field" placeholder="0.00" value={newDebt.paidAmount} onChange={(e) => setNewDebt({ ...newDebt, paidAmount: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-3">
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => setShowHistoryModal(true)}
                                        className="btn w-full flex justify-center items-center gap-2"
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                                    >
                                        <History size={18} /> Historial
                                    </button>
                                )}

                                <div className="flex gap-3">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleDelete(editingId);
                                                setShowModal(false);
                                            }}
                                            className="btn flex-1 flex justify-center items-center gap-2"
                                            style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#fca5a5', border: '1px solid rgba(220, 38, 38, 0.5)' }}
                                        >
                                            <CustomTrashIcon size={18} /> Eliminar
                                        </button>
                                    )}
                                    <button type="submit" className={`btn btn-primary flex justify-center items-center ${editingId ? 'flex-1' : 'w-full'}`}>
                                        {editingId ? 'Actualizar' : 'Registrar Deuda'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div >
                </div >
            )}

            {/* Modal Abonar */}
            {
                showPayModal && (
                    <div className="modal-backdrop">
                        <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
                            <button
                                onClick={() => setShowPayModal(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                            <h3 className="mb-6">Abonar a {selectedDebt?.name}</h3>
                            <form onSubmit={handlePayment}>
                                <div className="mb-6">
                                    <label className="text-sm text-secondary mb-2 block">Monto a abonar</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input-field"
                                        placeholder="0.00"
                                        value={amountToPay}
                                        onChange={(e) => setAmountToPay(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-full justify-center" style={{ background: 'linear-gradient(135deg, hsl(350, 70%, 55%), hsl(350, 70%, 45%))' }}>
                                    <DollarSign size={18} /> Confirmar Abono
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal Historial */}
            {
                showHistoryModal && (
                    <div className="modal-backdrop">
                        <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                            <h3 className="mb-6">Historial: {selectedDebt?.name}</h3>
                            <div className="flex flex-col gap-3" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                                {selectedDebt?.history && selectedDebt.history.slice().reverse().length > 0 ? (
                                    selectedDebt.history.slice().reverse().map((entry, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <div>
                                                <p className="font-bold text-white">{symbol} {entry.amount.toLocaleString()}</p>
                                                <p className="text-xs text-secondary">{entry.date}</p>
                                            </div>
                                            <div className="text-sm text-muted">
                                                {entry.note || 'Abono'}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-muted">No hay historial de abonos.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Debts;
