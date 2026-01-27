import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Plus, Target, Car, Home, Smartphone, X, Edit2, Trash2, TrendingUp, Calendar } from 'lucide-react';

const Savings = () => {
    // Cargar datos desde localStorage o usar datos por defecto
    const [goals, setGoals] = useState(() => {
        const savedGoals = localStorage.getItem('savingsGoals');
        if (savedGoals) {
            try {
                const parsed = JSON.parse(savedGoals);
                // Reconstruir los iconos desde los nombres
                return parsed.map(goal => ({
                    ...goal,
                    icon: goal.iconName === 'Car' ? Car :
                        goal.iconName === 'Home' ? Home :
                            goal.iconName === 'Smartphone' ? Smartphone : Target
                }));
            } catch (e) {
                console.error('Error loading savings goals:', e);
            }
        }

        // Datos por defecto
        return [
            {
                id: 1,
                name: 'Nuevo Coche',
                target: 20000,
                current: 5000,
                icon: Car,
                iconName: 'Car',
                color: 'hsl(var(--accent-primary))',
                history: [
                    { id: 1, amount: 3000, date: '2023-10-01', description: 'Ahorro inicial' },
                    { id: 2, amount: 2000, date: '2023-10-15', description: 'Bono mensual' }
                ]
            },
            {
                id: 2,
                name: 'Casa de Playa',
                target: 150000,
                current: 45000,
                icon: Home,
                iconName: 'Home',
                color: 'hsl(var(--accent-secondary))',
                history: [
                    { id: 1, amount: 45000, date: '2023-09-01', description: 'Ahorro acumulado' }
                ]
            },
            {
                id: 3,
                name: 'iPhone 16',
                target: 1200,
                current: 800,
                icon: Smartphone,
                iconName: 'Smartphone',
                color: 'hsl(var(--accent-success))',
                history: [
                    { id: 1, amount: 500, date: '2023-10-10', description: 'Primer ahorro' },
                    { id: 2, amount: 300, date: '2023-10-20', description: 'Ahorro adicional' }
                ]
            },
        ];
    });

    // Guardar en localStorage cada vez que cambien los goals
    useEffect(() => {
        // Convertir goals a un formato serializable (sin funciones de iconos)
        const goalsToSave = goals.map(goal => ({
            ...goal,
            icon: undefined, // No guardar la función
            iconName: goal.iconName || (
                goal.icon === Car ? 'Car' :
                    goal.icon === Home ? 'Home' :
                        goal.icon === Smartphone ? 'Smartphone' : 'Target'
            )
        }));
        localStorage.setItem('savingsGoals', JSON.stringify(goalsToSave));
    }, [goals]);

    const [showModal, setShowModal] = useState(false);
    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showEditHistoryModal, setShowEditHistoryModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingHistoryId, setEditingHistoryId] = useState(null);
    const [selectedGoalId, setSelectedGoalId] = useState(null);

    const [newGoal, setNewGoal] = useState({
        name: '',
        target: '',
        current: ''
    });

    const [newDeposit, setNewDeposit] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const [editDeposit, setEditDeposit] = useState({
        amount: '',
        date: '',
        description: ''
    });

    const iconOptions = [
        { name: 'Coche', icon: Car, color: 'hsl(var(--accent-primary))' },
        { name: 'Casa', icon: Home, color: 'hsl(var(--accent-secondary))' },
        { name: 'Teléfono', icon: Smartphone, color: 'hsl(var(--accent-success))' },
        { name: 'Objetivo', icon: Target, color: 'hsl(var(--accent-primary))' },
    ];

    const [selectedIcon, setSelectedIcon] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            setGoals(goals.map(goal =>
                goal.id === editingId
                    ? {
                        ...goal,
                        name: newGoal.name,
                        target: parseFloat(newGoal.target),
                        current: parseFloat(newGoal.current || 0),
                        icon: iconOptions[selectedIcon].icon,
                        color: iconOptions[selectedIcon].color
                    }
                    : goal
            ));
        } else {
            const goal = {
                id: Math.max(...goals.map(g => g.id), 0) + 1,
                name: newGoal.name,
                target: parseFloat(newGoal.target),
                current: parseFloat(newGoal.current || 0),
                icon: iconOptions[selectedIcon].icon,
                color: iconOptions[selectedIcon].color,
                history: newGoal.current > 0 ? [{
                    id: 1,
                    amount: parseFloat(newGoal.current),
                    date: new Date().toISOString().split('T')[0],
                    description: 'Ahorro inicial'
                }] : []
            };
            setGoals([...goals, goal]);
        }

        setShowModal(false);
        setEditingId(null);
        setNewGoal({ name: '', target: '', current: '' });
        setSelectedIcon(0);
    };

    const handleAddMoney = (e) => {
        e.preventDefault();

        const amount = parseFloat(newDeposit.amount);

        setGoals(goals.map(goal => {
            if (goal.id === selectedGoalId) {
                const newHistoryEntry = {
                    id: Math.max(...(goal.history?.map(h => h.id) || [0]), 0) + 1,
                    amount: amount,
                    date: newDeposit.date,
                    description: newDeposit.description || 'Depósito'
                };

                return {
                    ...goal,
                    current: goal.current + amount,
                    history: [...(goal.history || []), newHistoryEntry]
                };
            }
            return goal;
        }));

        setShowAddMoneyModal(false);
        setNewDeposit({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
        setSelectedGoalId(null);
    };

    const handleEdit = (goal) => {
        setEditingId(goal.id);
        setNewGoal({
            name: goal.name,
            target: goal.target.toString(),
            current: goal.current.toString()
        });

        const iconIndex = iconOptions.findIndex(opt => opt.icon === goal.icon);
        setSelectedIcon(iconIndex >= 0 ? iconIndex : 0);

        setShowModal(true);
    };

    const handleDelete = (id) => {
        setGoals(goals.filter(goal => goal.id !== id));
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewGoal({ name: '', target: '', current: '' });
        setSelectedIcon(0);
    };

    const openAddMoneyModal = (goalId) => {
        setSelectedGoalId(goalId);
        setShowAddMoneyModal(true);
    };

    const openHistoryModal = (goalId) => {
        setSelectedGoalId(goalId);
        setShowHistoryModal(true);
    };

    const handleDeleteHistoryEntry = (goalId, entryId) => {
        setGoals(goals.map(goal => {
            if (goal.id === goalId) {
                const entryToDelete = goal.history.find(h => h.id === entryId);
                const newHistory = goal.history.filter(h => h.id !== entryId);
                const newCurrent = goal.current - entryToDelete.amount;

                return {
                    ...goal,
                    current: Math.max(0, newCurrent), // No permitir valores negativos
                    history: newHistory
                };
            }
            return goal;
        }));
    };

    const openEditHistoryModal = (goalId, entry) => {
        setSelectedGoalId(goalId);
        setEditingHistoryId(entry.id);
        setEditDeposit({
            amount: entry.amount.toString(),
            date: entry.date,
            description: entry.description
        });
        setShowEditHistoryModal(true);
    };

    const handleEditHistoryEntry = (e) => {
        e.preventDefault();

        setGoals(goals.map(goal => {
            if (goal.id === selectedGoalId) {
                const oldEntry = goal.history.find(h => h.id === editingHistoryId);
                const oldAmount = oldEntry.amount;
                const newAmount = parseFloat(editDeposit.amount);
                const amountDifference = newAmount - oldAmount;

                const updatedHistory = goal.history.map(h =>
                    h.id === editingHistoryId
                        ? { ...h, amount: newAmount, date: editDeposit.date, description: editDeposit.description }
                        : h
                );

                return {
                    ...goal,
                    current: Math.max(0, goal.current + amountDifference),
                    history: updatedHistory
                };
            }
            return goal;
        }));

        setShowEditHistoryModal(false);
        setEditingHistoryId(null);
        setEditDeposit({ amount: '', date: '', description: '' });
    };

    const selectedGoal = goals.find(g => g.id === selectedGoalId);

    return (
        <>
            <div className="animate-fade-in">
                <div className="page-header flex justify-between items-center mb-6">
                    <div>
                        <h2 className="page-title">Ahorros</h2>
                        <p className="page-subtitle">Visualiza y alcanza tus metas financieras.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Nueva Meta
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {goals.map((goal) => {
                        const progress = (goal.current / goal.target) * 100;
                        return (
                            <Card key={goal.id} className="relative">
                                <div className="absolute top-0 right-0 p-4" style={{ opacity: 0.1 }}>
                                    <goal.icon size={100} color={goal.color} />
                                </div>

                                <div className="relative" style={{ zIndex: 10 }}>
                                    <div className="flex justify-between mb-4" style={{ alignItems: 'flex-start' }}>
                                        <div className="p-3 rounded-lg" style={{ background: `rgba(255,255,255,0.05)` }}>
                                            <goal.icon size={24} color={goal.color} />
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
                                            style={{ width: `${progress}%`, backgroundColor: goal.color, transition: 'width 1s ease-out' }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-sm mb-4">
                                        <span className="text-white" style={{ fontWeight: 600 }}>{progress.toFixed(0)}%</span>
                                        <span className="text-muted">Faltan S/ {(goal.target - goal.current).toLocaleString()}</span>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="mb-4">
                                        <button
                                            onClick={() => openAddMoneyModal(goal.id)}
                                            className="w-full btn text-white"
                                            style={{
                                                padding: '0.65rem 1rem',
                                                background: 'linear-gradient(135deg, hsl(var(--accent-success)), #10b981)',
                                                fontSize: '0.9rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            <TrendingUp size={16} /> Agregar Dinero
                                        </button>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => openHistoryModal(goal.id)}
                                            className="flex-1 btn glass"
                                            style={{
                                                padding: '0.6rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Ver historial"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(goal)}
                                            className="flex-1 btn glass"
                                            style={{
                                                padding: '0.6rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Editar meta"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="btn glass"
                                            style={{
                                                padding: '0.6rem 0.75rem',
                                                color: 'hsl(var(--accent-danger))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Eliminar meta"
                                        >
                                            <Trash2 size={18} />
                                        </button>
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
                                    {editingId ? <><Edit2 size={18} /> Actualizar</> : <><Plus size={18} /> Crear Meta</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Agregar Dinero */}
            {showAddMoneyModal && selectedGoal && (
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
                            onClick={() => setShowAddMoneyModal(false)}
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

                        <h3 className="mb-2">Agregar Dinero</h3>
                        <p className="text-secondary mb-6" style={{ fontSize: '0.9rem' }}>{selectedGoal.name}</p>

                        <form onSubmit={handleAddMoney}>
                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Monto a Agregar
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0.00"
                                    value={newDeposit.amount}
                                    onChange={(e) => setNewDeposit({ ...newDeposit, amount: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={newDeposit.date}
                                    onChange={(e) => setNewDeposit({ ...newDeposit, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Descripción (Opcional)
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Ej: Ahorro mensual, Bono, etc."
                                    value={newDeposit.description}
                                    onChange={(e) => setNewDeposit({ ...newDeposit, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="btn glass"
                                    onClick={() => setShowAddMoneyModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn text-white"
                                    style={{ background: 'linear-gradient(135deg, hsl(var(--accent-success)), #10b981)' }}
                                >
                                    <TrendingUp size={18} /> Agregar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Historial */}
            {showHistoryModal && selectedGoal && (
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
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '600px', position: 'relative' }}>
                        <button
                            onClick={() => setShowHistoryModal(false)}
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

                        <h3 className="mb-2">Historial de Ahorros</h3>
                        <p className="text-secondary mb-6" style={{ fontSize: '0.9rem' }}>{selectedGoal.name}</p>

                        {selectedGoal.history && selectedGoal.history.length > 0 ? (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {selectedGoal.history.slice().reverse().map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="mb-3 p-4 rounded-lg"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'hsl(var(--accent-success))' }}>
                                                    +S/ {entry.amount.toFixed(2)}
                                                </p>
                                                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                                                    {entry.description}
                                                </p>
                                                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                    {entry.date}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditHistoryModal(selectedGoal.id, entry)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: 'none',
                                                        padding: '0.4rem',
                                                        borderRadius: '0.375rem',
                                                        cursor: 'pointer',
                                                        color: 'hsl(var(--accent-secondary))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Editar registro"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHistoryEntry(selectedGoal.id, entry.id)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)',
                                                        border: 'none',
                                                        padding: '0.4rem',
                                                        borderRadius: '0.375rem',
                                                        cursor: 'pointer',
                                                        color: 'hsl(var(--accent-danger))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Eliminar registro"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted py-8">
                                <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p>No hay registros de ahorro aún</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Editar Historial */}
            {showEditHistoryModal && selectedGoal && (
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
                    zIndex: 1001
                }}>
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button
                            onClick={() => setShowEditHistoryModal(false)}
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

                        <h3 className="mb-2">Editar Registro</h3>
                        <p className="text-secondary mb-6" style={{ fontSize: '0.9rem' }}>{selectedGoal.name}</p>

                        <form onSubmit={handleEditHistoryEntry}>
                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Monto
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0.00"
                                    value={editDeposit.amount}
                                    onChange={(e) => setEditDeposit({ ...editDeposit, amount: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={editDeposit.date}
                                    onChange={(e) => setEditDeposit({ ...editDeposit, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="text-sm text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Ej: Ahorro mensual, Bono, etc."
                                    value={editDeposit.description}
                                    onChange={(e) => setEditDeposit({ ...editDeposit, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="btn glass"
                                    onClick={() => setShowEditHistoryModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn text-white"
                                    style={{ background: 'linear-gradient(135deg, hsl(var(--accent-secondary)), hsl(var(--accent-primary)))' }}
                                >
                                    <Edit2 size={18} /> Actualizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Savings;
