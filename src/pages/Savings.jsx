import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Plus, Target, Car, Home, Smartphone, X, History, DollarSign, Menu } from 'lucide-react';
import MobileMenuButton from '../components/MobileMenuButton';
import CustomPencilIcon from '../components/CustomPencilIcon';
import CustomTrashIcon from '../components/CustomTrashIcon';

const Savings = () => {
    const { token } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) fetchGoals();
    }, [token]);

    const fetchGoals = async () => {
        try {
            const response = await fetch('/api/data/goals', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            // Map icon string to component if needed, or just use generic for now
            // data.icon will be undefined or simple string. Let's rely on mapping if I save string.
            // For now let's just use generic Target icon if not specified
            setGoals(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching goals", error);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newGoal, setNewGoal] = useState({
        name: '',
        target: '',
        current: '',
        deadline: ''
    });

    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [editingHistoryIndex, setEditingHistoryIndex] = useState(null);
    const [editingHistoryAmount, setEditingHistoryAmount] = useState('');

    const [selectedIcon, setSelectedIcon] = useState(0);

    const iconOptions = [
        { name: 'Coche', icon: Car, color: 'hsl(var(--accent-primary))' },
        { name: 'Casa', icon: Home, color: 'hsl(var(--accent-secondary))' },
        { name: 'Teléfono', icon: Smartphone, color: 'hsl(var(--accent-success))' },
        { name: 'Objetivo', icon: Target, color: 'hsl(var(--accent-primary))' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            const body = JSON.stringify({
                name: newGoal.name,
                target: parseFloat(newGoal.target),
                current: parseFloat(newGoal.current || 0),
                color: iconOptions[selectedIcon].color,
                deadline: newGoal.deadline
            });

            if (editingId) {
                const res = await fetch(`/api/data/goals/${editingId}`, {
                    method: 'PUT',
                    headers,
                    body
                });
                const updated = await res.json();
                setGoals(goals.map(g => g._id === editingId ? updated : g));
            } else {
                const res = await fetch('/api/data/goals', {
                    method: 'POST',
                    headers,
                    body
                });
                const data = await res.json();
                setGoals([...goals, data]);
            }
        } catch (error) {
            console.error("Error saving goal", error);
        }

        setShowModal(false);
        setEditingId(null);
        setNewGoal({ name: '', target: '', current: '', deadline: '' });
        setSelectedIcon(0);
    };

    const handleEdit = (goal) => {
        setEditingId(goal._id);
        setNewGoal({
            name: goal.name,
            target: goal.target.toString(),
            current: goal.current.toString(),
            deadline: goal.deadline || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await fetch(`/api/data/goals/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setGoals(goals.filter(g => g._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewGoal({ name: '', target: '', current: '', deadline: '' });
        setSelectedIcon(0);
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        try {
            const amount = parseFloat(amountToAdd);
            if (isNaN(amount) || amount <= 0) return;

            const newCurrent = selectedGoal.current + amount;
            const newHistory = [...(selectedGoal.history || []), {
                amount: amount,
                date: new Date().toLocaleDateString(),
                note: 'Depósito'
            }];

            const res = await fetch(`/api/data/goals/${selectedGoal._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current: newCurrent,
                    history: newHistory
                })
            });

            const updatedGoal = await res.json();
            setGoals(goals.map(g => g._id === selectedGoal._id ? updatedGoal : g));

            setShowAddMoneyModal(false);
            setAmountToAdd('');
            setSelectedGoal(null);
        } catch (error) {
            console.error("Error adding money", error);
        }
    };

    const openAddMoney = (goal) => {
        setSelectedGoal(goal);
        setAmountToAdd('');
        setShowAddMoneyModal(true);
    };

    const openHistory = (goal) => {
        setSelectedGoal(goal);
        setShowHistoryModal(true);
    };

    const handleDeleteHistory = async (index, amount) => {
        if (!window.confirm("¿Eliminar este registro? Se restará el monto de la meta.")) return;

        const newHistory = [...selectedGoal.history];
        newHistory.splice(index, 1);
        const newCurrent = selectedGoal.current - amount;

        try {
            const res = await fetch(`/api/data/goals/${selectedGoal._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current: newCurrent,
                    history: newHistory
                })
            });
            const updatedGoal = await res.json();
            setGoals(goals.map(g => g._id === selectedGoal._id ? updatedGoal : g));
            setSelectedGoal(updatedGoal);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditHistory = (index, entry) => {
        setEditingHistoryIndex(index);
        setEditingHistoryAmount(entry.amount.toString());
    };

    const handleSaveHistoryEdit = async (index, oldAmount) => {
        const newAmount = parseFloat(editingHistoryAmount);
        if (isNaN(newAmount) || newAmount <= 0) return;

        const newHistory = [...selectedGoal.history];
        newHistory[index] = { ...newHistory[index], amount: newAmount };

        const amountDifference = newAmount - oldAmount;
        const newCurrent = selectedGoal.current + amountDifference;

        try {
            const res = await fetch(`/api/data/goals/${selectedGoal._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current: newCurrent,
                    history: newHistory
                })
            });
            const updatedGoal = await res.json();
            setGoals(goals.map(g => g._id === selectedGoal._id ? updatedGoal : g));
            setSelectedGoal(updatedGoal);
            setEditingHistoryIndex(null);
            setEditingHistoryAmount('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className="animate-fade-in">
                <div className="page-header mobile-header-layout">
                    <MobileMenuButton />

                    <div className="mobile-title-center">
                        <h2 className="page-title">Ahorros</h2>
                        <p className="page-subtitle hidden-mobile">Visualiza y alcanza tus metas financieras.</p>
                    </div>

                    {/* Spacer invisible para centrar título en móvil */}
                    <div className="mobile-spacer hidden-desktop"></div>

                    {/* Botón original oculto o eliminado si se desea quitar funcionalidad de nueva meta visualmente por ahora, 
                        o mantener solo en desktop. El usuario pidió 'quitar el boton'. Lo eliminaré por completo. */}
                    <div className="hidden-mobile" style={{ width: '40px' }}></div>
                </div>

                <div className="savings-grid">
                    {loading ? <p>Cargando...</p> : goals.length === 0 ? <p>No hay metas de ahorro.</p> : goals.map((goal) => {
                        const progress = (goal.current / goal.target) * 100;
                        const GoalIcon = Target; // Default, could map from goal.color or name logic if saved

                        return (
                            <Card key={goal._id} className="relative">
                                <div className="absolute top-0 right-0 p-4" style={{ opacity: 0.1 }}>
                                    <GoalIcon size={100} color={goal.color} />
                                </div>

                                <div className="relative" style={{ zIndex: 10 }}>
                                    <div className="flex justify-between mb-4" style={{ alignItems: 'flex-start' }}>
                                        <div className="p-3 rounded-lg" style={{ background: `rgba(255,255,255,0.05)` }}>
                                            <GoalIcon size={24} color={goal.color} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted">Meta</p>
                                            <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>S/ {goal.target.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{goal.name}</h3>
                                    <p className="text-secondary mb-6">
                                        S/ {goal.current.toLocaleString()} <span style={{ fontSize: '0.875rem' }}>acumulados</span>
                                    </p>

                                    <div className="w-full rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.1)', height: '0.75rem' }}>
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: goal.color, transition: 'width 1s ease-out' }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm mb-4">
                                        <span className="text-white" style={{ fontWeight: 600 }}>{progress.toFixed(0)}%</span>
                                        <span className="text-muted">Faltan S/ {(goal.target - goal.current).toLocaleString()}</span>
                                    </div>

                                    <div className="goal-actions">
                                        <button
                                            onClick={() => openAddMoney(goal)}
                                            className="btn-add-money"
                                            title="Agregar dinero"
                                            style={{
                                                background: 'linear-gradient(135deg, hsl(150, 70%, 45%), hsl(150, 70%, 35%))',
                                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
                                            }}
                                        >
                                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>S/.</span>
                                            <span>Depositar</span>
                                        </button>
                                        <div className="goal-secondary-actions">
                                            <button
                                                onClick={() => openHistory(goal)}
                                                className="btn-icon"
                                                title="Ver historial"
                                            >
                                                <History size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(goal)}
                                                className="btn-icon"
                                                title="Editar"
                                            >
                                                <CustomPencilIcon size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(goal._id)}
                                                className="btn-icon btn-icon-danger"
                                                title="Eliminar"
                                            >
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
                        <p className="text-secondary" style={{ fontWeight: 600 }}>Crear Nueva Meta</p>
                    </button>
                </div>

            </div>

            {/* Modal Crear/Editar Meta */}
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

                        <h3 className="mb-6">{editingId ? 'Editar Meta de Ahorro' : 'Crear Nueva Meta de Ahorro'}</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Nombre de la Meta
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Ej: Nuevo Coche, Vacaciones, Casa"
                                    value={newGoal.name}
                                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Ícono
                                </label>
                                <div className="flex gap-3">
                                    {iconOptions.map((option, index) => {
                                        const IconComponent = option.icon;
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setSelectedIcon(index)}
                                                className="p-3 rounded-lg"
                                                style={{
                                                    background: selectedIcon === index ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                                                    border: selectedIcon === index ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <IconComponent size={24} color={option.color} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Meta (Monto Total)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0.00"
                                    value={newGoal.target}
                                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Monto Actual (Opcional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0.00"
                                    value={newGoal.current}
                                    onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="btn glass"
                                    onClick={handleCloseModal}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? <><CustomPencilIcon size={18} /> Actualizar</> : <><Plus size={18} /> Crear Meta</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Agregar Dinero */}
            {showAddMoneyModal && (
                <div className="modal-backdrop">
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
                        <button
                            onClick={() => setShowAddMoneyModal(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        <h3 className="mb-6">Agregar Dinero a {selectedGoal?.name}</h3>
                        <form onSubmit={handleAddMoney}>
                            <div className="mb-6">
                                <label className="text-sm text-secondary mb-2 block">Monto a agregar</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0.00"
                                    value={amountToAdd}
                                    onChange={(e) => setAmountToAdd(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-full justify-center">
                                <Plus size={18} /> Confirmar Depósito
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Historial */}
            {showHistoryModal && (
                <div className="modal-backdrop">
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
                        <button
                            onClick={() => setShowHistoryModal(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        <h3 className="mb-6">Historial: {selectedGoal?.name}</h3>
                        <div className="flex flex-col gap-3" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                            {selectedGoal?.history && selectedGoal.history.slice().reverse().length > 0 ? (
                                selectedGoal.history.slice().reverse().map((entry, i) => {
                                    const originalIndex = selectedGoal.history.length - 1 - i;
                                    const isEditing = editingHistoryIndex === originalIndex;
                                    return (
                                        <div key={i} className="p-3 rounded-lg flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <div>
                                                <p className="font-semibold text-sm">{entry.note || 'Depósito'}</p>
                                                <p className="text-xs text-secondary">{entry.date}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {isEditing ? (
                                                    <>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={editingHistoryAmount}
                                                            onChange={(e) => setEditingHistoryAmount(e.target.value)}
                                                            className="input-field"
                                                            style={{ width: '100px', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                                        />
                                                        <button
                                                            onClick={() => handleSaveHistoryEdit(originalIndex, entry.amount)}
                                                            className="text-success p-1 hover:bg-white/10 rounded"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingHistoryIndex(null); setEditingHistoryAmount(''); }}
                                                            className="text-secondary p-1 hover:bg-white/10 rounded"
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-success font-bold">+S/ {entry.amount.toFixed(2)}</p>
                                                        <button
                                                            onClick={() => handleEditHistory(originalIndex, entry)}
                                                            className="text-secondary p-1 hover:bg-white/10 rounded"
                                                        >
                                                            <CustomPencilIcon size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteHistory(originalIndex, entry.amount)}
                                                            className="text-danger p-1 hover:bg-white/10 rounded"
                                                        >
                                                            <CustomTrashIcon size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-center text-muted">No hay historial disponible.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Savings;
