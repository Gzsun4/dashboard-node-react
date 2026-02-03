import React, { useState, useEffect } from 'react';
import Budgets from './Budgets';
import Savings from './Savings';
import Debts from './Debts';
import MobileHeader from '../components/MobileHeader';
import { Wallet, PiggyBank, CreditCard, Plus } from 'lucide-react';

const Planning = () => {
    const [activeTab, setActiveTab] = useState('budgets'); // 'budgets', 'savings', 'debts'
    const [triggerAddModal, setTriggerAddModal] = useState(0);

    const resetModalTrigger = () => setTriggerAddModal(0);

    // Reset modal trigger when switching tabs to prevent automatic opening
    useEffect(() => {
        resetModalTrigger();
    }, [activeTab]);

    const renderTab = (id, label, Icon) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-all duration-300 flex-1 ${activeTab === id
                ? 'bg-slate-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'
                }`}
        >
            <Icon size={20} className={`mb-1 ${activeTab === id ? 'text-purple-400' : 'opacity-50'}`} />
            {label}
        </button>
    );

    return (
        <div className="animate-fade-in pb-24">
            <MobileHeader
                title="Planificación"
                themeColor={
                    activeTab === 'budgets' ? '#f97316' :
                        activeTab === 'savings' ? '#3b82f6' :
                            '#f43f5e'
                }
                leftContent={
                    <button
                        onClick={() => setTriggerAddModal(prev => prev + 1)}
                        className="p-1 active:scale-90 transition-all"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}
                    >
                        <Plus size={28} strokeWidth={2.5} />
                    </button>
                }
            />

            {/* Custom Tab Switcher - Premium Design */}
            <div className="px-4 mb-16">
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
                        onClick={() => setActiveTab('budgets')}
                        className="flex-1 flex items-center justify-center gap-2 text-[14px] font-bold transition-all duration-300"
                        style={{
                            background: activeTab === 'budgets' ? 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)' : 'transparent',
                            color: activeTab === 'budgets' ? '#ffffff' : '#6b7280',
                            border: activeTab === 'budgets' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                            boxShadow: activeTab === 'budgets' ? '0 0 15px rgba(249, 115, 22, 0.3)' : 'none',
                            borderRadius: '18px'
                        }}
                    >
                        <Wallet size={20} strokeWidth={2.5} />
                        Presupuesto
                    </button>

                    <button
                        onClick={() => setActiveTab('savings')}
                        className="flex-1 flex items-center justify-center gap-2 text-[14px] font-bold transition-all duration-300"
                        style={{
                            background: activeTab === 'savings' ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
                            color: activeTab === 'savings' ? '#ffffff' : '#6b7280',
                            border: activeTab === 'savings' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                            boxShadow: activeTab === 'savings' ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none',
                            borderRadius: '18px'
                        }}
                    >
                        <PiggyBank size={20} strokeWidth={2.5} />
                        Ahorros
                    </button>

                    <button
                        onClick={() => setActiveTab('debts')}
                        className="flex-1 flex items-center justify-center gap-2 text-[14px] font-bold transition-all duration-300"
                        style={{
                            background: activeTab === 'debts' ? 'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)' : 'transparent',
                            color: activeTab === 'debts' ? '#ffffff' : '#6b7280',
                            border: activeTab === 'debts' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                            boxShadow: activeTab === 'debts' ? '0 0 15px rgba(244, 63, 94, 0.3)' : 'none',
                            borderRadius: '18px'
                        }}
                    >
                        <CreditCard size={20} strokeWidth={2.5} />
                        Deudas
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative">
                {activeTab === 'budgets' && (
                    <Budgets
                        isNested={true}
                        triggerAddModal={triggerAddModal}
                        onModalReset={resetModalTrigger}
                    />
                )}
                {activeTab === 'savings' && (
                    <Savings
                        isNested={true}
                        triggerAddModal={triggerAddModal}
                        onModalReset={resetModalTrigger}
                    />
                )}
                {activeTab === 'debts' && (
                    <Debts
                        isNested={true}
                        triggerAddModal={triggerAddModal}
                        onModalReset={resetModalTrigger}
                    />
                )}
            </div>
        </div>
    );
};

export default Planning;
