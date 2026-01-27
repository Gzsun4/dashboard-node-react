import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Plus, Search, Filter, X, Edit2, Trash2 } from 'lucide-react';

const Income = () => {
    const [incomes, setIncomes] = useState(() => {
        const savedIncomes = localStorage.getItem('incomes');
        if (savedIncomes) {
            try {
                return JSON.parse(savedIncomes);
            } catch (e) {
                console.error('Error loading incomes:', e);
            }
        }
        return [
            { id: 1, source: 'Salario', date: '2023-10-25', amount: 2500, category: 'Trabajo' },
            { id: 2, source: 'Freelance', date: '2023-10-20', amount: 450, category: 'Proyectos' },
            { id: 3, source: 'Venta', date: '2023-10-15', amount: 120, category: 'Ventas' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('incomes', JSON.stringify(incomes));
    }, [incomes]);

    const [showModal, setShowModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newIncome, setNewIncome] = useState({
        source: '',
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            setIncomes(incomes.map(income =>
                income.id === editingId
                    ? { ...income, source: newIncome.source, date: newIncome.date, amount: parseFloat(newIncome.amount), category: newIncome.category }
                    : income
            ));
        } else {
            const income = {
                id: Math.max(...incomes.map(i => i.id), 0) + 1,
                source: newIncome.source,
                date: newIncome.date,
                amount: parseFloat(newIncome.amount),
                category: newIncome.category
            };
            setIncomes([income, ...incomes]);
        }

        setShowModal(false);
        setEditingId(null);
        setNewIncome({ source: '', date: '', amount: '', category: '' });
    };

    const handleEdit = (income) => {
        setEditingId(income.id);
        setNewIncome({
            source: income.source,
            date: income.date,
            amount: income.amount.toString(),
            category: income.category
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setIncomes(incomes.filter(income => income.id !== id));
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewIncome({ source: '', date: '', amount: '', category: '' });
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

    // Filtrar ingresos
    const filteredIncomes = incomes.filter(income => {
        let matches = true;

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
    });

    const hasActiveFilters = activeFilters.category || activeFilters.dateFrom || activeFilters.dateTo;

    return (
        <>
            <div className="animate-fade-in">
                <div className="page-header flex justify-between items-center mb-6">
                    <div>
                        <h2 className="page-title">Ingresos</h2>
                        <p className="page-subtitle">Gestiona tus fuentes de ingresos.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Nuevo Ingreso
                    </button>
                </div>

                <div className="mb-6 flex gap-4">
                    <div className="relative w-full" style={{ maxWidth: '400px' }}>
                        <div className="absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}>
                            <Search size={18} />
                        </div>
                        <input type="text" placeholder="Buscar ingresos..." className="input-field" style={{ paddingLeft: '2.5rem' }} />
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

                <Card>
                    <table>
                        <thead>
                            <tr>
                                <th>Fuente</th>
                                <th>Categoría</th>
                                <th>Fecha</th>
                                <th className="text-right">Monto</th>
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncomes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                                        No se encontraron ingresos {hasActiveFilters && 'con los filtros aplicados'}
                                    </td>
                                </tr>
                            ) : (
                                filteredIncomes.map((income) => (
                                    <tr key={income.id}>
                                        <td style={{ fontWeight: 600 }}>{income.source}</td>
                                        <td>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '99px',
                                                fontSize: '0.85rem',
                                                background: 'hsl(var(--accent-primary) / 0.15)',
                                                color: 'hsl(var(--accent-primary))'
                                            }}>
                                                {income.category}
                                            </span>
                                        </td>
                                        <td className="text-muted">{income.date}</td>
                                        <td className="text-right text-success" style={{ fontWeight: 700 }}>
                                            +S/ {income.amount.toFixed(2)}
                                        </td>
                                        <td className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleEdit(income)}
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
                                                    onClick={() => handleDelete(income.id)}
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

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="btn glass"
                                    onClick={handleCloseModal}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
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
