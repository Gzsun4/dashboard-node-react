import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { Plus, Target, Car, Home, Smartphone, X, Edit2, Trash2 } from 'lucide-react';

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

                                    <div className="flex gap-3">
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
                                            onClick={() => handleDelete(goal._id)}
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
        </>
    );
};

export default Savings;
