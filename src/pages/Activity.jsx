import React, { useState, useEffect } from 'react';
import Income from './Income';
import Expenses from './Expenses';
import MobileHeader from '../components/MobileHeader';
import { TrendingUp, TrendingDown, CalendarClock, X, Plus } from 'lucide-react';
import TimeFilter from '../components/TimeFilter';

const Activity = () => {
    const [activeTab, setActiveTab] = useState('income'); // 'income' or 'expenses'
    const [timeFilter, setTimeFilter] = useState('month'); // Default to month
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [triggerAddModal, setTriggerAddModal] = useState(0); // Counter to trigger internal modals

    const resetModalTrigger = () => setTriggerAddModal(0);

    // Reset modal trigger when switching tabs to prevent automatic opening
    useEffect(() => {
        resetModalTrigger();
    }, [activeTab]);

    return (
        <div className="animate-fade-in pb-24">
            <MobileHeader
                title="Actividad"
                themeColor={activeTab === 'income' ? '#10b981' : '#ef4444'}
                leftContent={
                    <button
                        className="p-1 active:scale-90 transition-all"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={() => setTriggerAddModal(prev => prev + 1)}
                    >
                        <Plus size={28} strokeWidth={2.5} />
                    </button>
                }
            >
                <button
                    className="p-2 transition-all active:scale-90"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: showTimeModal ? (activeTab === 'income' ? '#10b981' : '#ef4444') : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '42px',
                        height: '42px'
                    }}
                    onClick={() => setShowTimeModal(true)}
                >
                    <CalendarClock size={24} strokeWidth={2.5} />
                </button>
            </MobileHeader>




            {/* Popover de Filtro de Tiempo (Small Dropdown) */}
            {showTimeModal && (
                <>
                    {/* Capa invisible para cerrar al hacer clic fuera */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 999,
                            background: 'transparent'
                        }}
                        onClick={() => setShowTimeModal(false)}
                    />

                    <div
                        className="animate-scale-in"
                        style={{
                            position: 'absolute',
                            top: '72px',
                            right: '12px',
                            width: '200px',
                            borderRadius: '18px',
                            padding: '12px',
                            background: '#1a1e2e',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 25px 60px -5px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255,255,255,0.1)',
                            zIndex: 1000
                        }}
                    >
                        <TimeFilter
                            activeFilter={timeFilter}
                            onFilterChange={(filter) => {
                                setTimeFilter(filter);
                                setShowTimeModal(false);
                            }}
                            themeColor={activeTab === 'income' ? '#10b981' : '#ef4444'}
                        />
                    </div>
                </>
            )}


            {/* Custom Tab Switcher - Minimal Clean Design */}
            <div className="px-4 mb-24">
                <div
                    className="flex p-1.5"
                    style={{
                        background: '#0a0a0a',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        height: '54px',
                        borderRadius: '24px'
                    }}
                >
                    <button
                        onClick={() => {
                            setActiveTab('income');
                            resetModalTrigger();
                        }}
                        className="flex-1 flex items-center justify-center gap-3 text-[16px] font-bold transition-all duration-300"
                        style={{
                            background: activeTab === 'income' ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : 'transparent',
                            color: activeTab === 'income' ? '#ffffff' : '#9ca3af',
                            border: activeTab === 'income' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                            boxShadow: activeTab === 'income' ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
                            borderRadius: '18px'
                        }}
                    >
                        <TrendingUp size={22} strokeWidth={2.5} />
                        Ingresos
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('expenses');
                            resetModalTrigger();
                        }}
                        className="flex-1 flex items-center justify-center gap-3 text-[16px] font-bold transition-all duration-300"
                        style={{
                            background: activeTab === 'expenses' ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)' : 'transparent',
                            color: activeTab === 'expenses' ? '#ffffff' : '#9ca3af',
                            border: activeTab === 'expenses' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                            boxShadow: activeTab === 'expenses' ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none',
                            borderRadius: '18px'
                        }}
                    >
                        <TrendingDown size={22} strokeWidth={2.5} />
                        Gastos
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative">
                {activeTab === 'income' ? (
                    <Income
                        isNested={true}
                        timeFilter={timeFilter}
                        externalTriggerModal={triggerAddModal}
                        onModalReset={resetModalTrigger}
                    />
                ) : (
                    <Expenses
                        isNested={true}
                        timeFilter={timeFilter}
                        externalTriggerModal={triggerAddModal}
                        onModalReset={resetModalTrigger}
                    />
                )}

            </div>

        </div>
    );
};

export default Activity;
