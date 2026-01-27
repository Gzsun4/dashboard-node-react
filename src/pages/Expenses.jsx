import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/Card';
import { Plus, Search, Filter, X, Edit2, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const Expenses = () => {
    const [expenses, setExpenses] = useState(() => {
        const savedExpenses = localStorage.getItem('expenses');
        if (savedExpenses) {
            try {
                return JSON.parse(savedExpenses);
            } catch (e) {
                console.error('Error loading expenses:', e);
            }
        }
        return [
            { id: 1, description: 'Supermercado', date: '2023-10-26', amount: 150.50, category: 'Comida' },
            { id: 2, description: 'Spotify', date: '2023-10-24', amount: 9.99, category: 'Suscripciones' },
            { id: 3, description: 'Gasolina', date: '2023-10-22', amount: 45.00, category: 'Transporte' },
            { id: 4, description: 'Cine', date: '2023-10-21', amount: 30.00, category: 'Entretenimiento' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    const [showModal, setShowModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newExpense, setNewExpense] = useState({
        description: '',
        date: '',
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            setExpenses(expenses.map(expense =>
                expense.id === editingId
                    ? { ...expense, description: newExpense.description, date: newExpense.date, amount: parseFloat(newExpense.amount), category: newExpense.category }
                    : expense
            ));
        } else {
            const expense = {
                id: Math.max(...expenses.map(e => e.id), 0) + 1,
                description: newExpense.description,
                date: newExpense.date,
                amount: parseFloat(newExpense.amount),
                category: newExpense.category
            };
            setExpenses([expense, ...expenses]);
        }

        setShowModal(false);
        setEditingId(null);
        setNewExpense({ description: '', date: '', amount: '', category: '' });
    };

    const handleEdit = (expense) => {
        setEditingId(expense.id);
        setNewExpense({
            description: expense.description,
            date: expense.date,
            amount: expense.amount.toString(),
            category: expense.category
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setExpenses(expenses.filter(expense => expense.id !== id));
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewExpense({ description: '', date: '', amount: '', category: '' });
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

        if (activeFilters.category && expense.category !== activeFilters.category) {
            matches = false;
        }

        if (activeFilters.dateFrom && expense.date < activeFilters.dateFrom) {
            matches = false;
        }

        if (activeFilters.dateTo && expense.date > activeFilters.dateTo) {
            matches = false;
        }

        return matches;
    });

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

    return (
        <>
            <div className="animate-fade-in">
                <div className="page-header flex justify-between items-center mb-6">
                    <div>
                        <h2 className="page-title">Gastos</h2>
                        <p className="page-subtitle">Controla a dónde va tu dinero.</p>
                    </div>
                    <button
                        className="btn text-white"
                        style={{ background: 'linear-gradient(135deg, hsl(var(--accent-danger)), #ff6b6b)' }}
                        onClick={() => setShowModal(true)}
                    >
                        <Plus size={18} /> Nuevo Gasto
                    </button>
                </div>

                <div className="mb-6 flex gap-4">
                    <div className="relative w-full" style={{ maxWidth: '400px' }}>
                        <div className="absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}>
                            <Search size={18} />
                        </div>
                        <input type="text" placeholder="Buscar gastos..." className="input-field" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                    <button
                        className="btn glass"
                        onClick={() => setShowFilterModal(true)}
                        style={{
                            background: hasActiveFilters ? 'hsl(var(--accent-primary) / 0.2)' : undefined,
                            borderColor: hasActiveFilters ? 'hsl(var(--accent-primary))' : undefined
                        }}
                    >
                        <Filter size={18} /> Filtrar {hasActiveFilters && `(${Object.values(activeFilters).filter(v => v).length})`}
                    </button>
                </div>

                {/* Layout Grid: Gráfica a la izquierda, Tabla a la derecha */}
                <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Gráfica de Gastos por Categoría */}
                    {chartData.length > 0 && (
                        <Card style={{ position: 'sticky', top: '2rem' }}>
                            <h3 className="mb-4" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Gastos por Categoría</h3>
                            <div style={{ width: '100%', height: '280px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ''}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => `S/ ${value.toFixed(2)}`}
                                            contentStyle={{
                                                backgroundColor: 'rgba(30, 35, 55, 0.95)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '0.5rem',
                                                color: 'white',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Resumen de totales */}
                            <div className="mt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                                {chartData.map((item, index) => (
                                    <div key={index} className="flex justify-between mb-2" style={{ fontSize: '0.85rem' }}>
                                        <div className="flex items-center gap-2">
                                            <div style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: item.color,
                                                flexShrink: 0
                                            }}></div>
                                            <span className="text-secondary">{item.name}</span>
                                        </div>
                                        <span className="text-white" style={{ fontWeight: 600 }}>S/ {item.value.toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between mt-3 pt-3" style={{
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '0.95rem',
                                    fontWeight: 700
                                }}>
                                    <span>Total</span>
                                    <span className="text-danger">S/ {totalExpenses.toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Tabla de Gastos */}
                    <Card>
                        <table>
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Categoría</th>
                                    <th>Fecha</th>
                                    <th className="text-right">Monto</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                                            No se encontraron gastos {hasActiveFilters && 'con los filtros aplicados'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <tr key={expense.id}>
                                            <td style={{ fontWeight: 600 }}>{expense.description}</td>
                                            <td>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '99px',
                                                    fontSize: '0.85rem',
                                                    background: 'hsl(var(--accent-danger) / 0.15)',
                                                    color: 'hsl(var(--accent-danger))'
                                                }}>
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="text-muted">{expense.date}</td>
                                            <td className="text-right text-danger" style={{ fontWeight: 700 }}>
                                                -S/ {expense.amount.toFixed(2)}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(expense)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: 'none',
                                                            padding: '0.5rem',
                                                            borderRadius: '0.375rem',
                                                            cursor: 'pointer',
                                                            color: 'hsl(var(--accent-secondary))',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(expense.id)}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.1)',
                                                            border: 'none',
                                                            padding: '0.5rem',
                                                            borderRadius: '0.375rem',
                                                            cursor: 'pointer',
                                                            color: 'hsl(var(--accent-danger))',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Card>
                </div>

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
                                    <option value="Comida">Comida</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Entretenimiento">Entretenimiento</option>
                                    <option value="Suscripciones">Suscripciones</option>
                                    <option value="Servicios">Servicios</option>
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

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="btn glass"
                                    onClick={handleCloseModal}
                                >
                                    Cancelar
                                </button>
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
                                <option value="Comida">Comida</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Entretenimiento">Entretenimiento</option>
                                <option value="Suscripciones">Suscripciones</option>
                                <option value="Servicios">Servicios</option>
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

export default Expenses;
