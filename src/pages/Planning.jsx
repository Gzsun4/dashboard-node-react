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
            <div className="px-4 mb-14">
                <div
                    className="flex p-1.5 relative overflow-hidden"
                    style={{
                        background: '#0a0a0a',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        height: '54px',
                        borderRadius: '24px'
                    }}
                >
                    {/* Sliding Highlighter */}
                    <div
                        className="absolute transition-all duration-500"
                        style={{
                            top: '6px',
                            left: '6px',
                            width: 'calc((100% - 12px) / 3)',
                            height: 'calc(100% - 12px)',
                            background:
                                activeTab === 'budgets' ? 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)' :
                                    activeTab === 'savings' ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' :
                                        'linear-gradient(180deg, #f43f5e 0%, #e11d48 100%)',
                            borderRadius: '18px',
                            transform:
                                activeTab === 'budgets' ? 'translateX(0)' :
                                    activeTab === 'savings' ? 'translateX(100%)' :
                                        'translateX(200%)',
                            boxShadow:
                                activeTab === 'budgets' ? '0 0 20px rgba(249, 115, 22, 0.4)' :
                                    activeTab === 'savings' ? '0 0 20px rgba(59, 130, 246, 0.4)' :
                                        '0 0 20px rgba(244, 63, 94, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            zIndex: 1,
                            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    />

                    <button
                        onClick={() => setActiveTab('budgets')}
                        className="flex-1 flex items-center justify-center gap-2 text-[12px] font-bold transition-all duration-300 active:scale-95 relative px-1"
                        style={{
                            color: activeTab === 'budgets' ? '#ffffff' : '#6b7280',
                            zIndex: 2,
                            background: 'transparent',
                            border: 'none'
                        }}
                    >
                        <Wallet
                            size={17}
                            strokeWidth={2.5}
                            className={activeTab === 'budgets' ? 'icon-pop' : ''}
                        />
                        Proyección
                    </button>

                    <button
                        onClick={() => setActiveTab('savings')}
                        className="flex-1 flex items-center justify-center gap-2 text-[12px] font-bold transition-all duration-300 active:scale-95 relative px-1"
                        style={{
                            color: activeTab === 'savings' ? '#ffffff' : '#6b7280',
                            zIndex: 2,
                            background: 'transparent',
                            border: 'none'
                        }}
                    >
                        <PiggyBank
                            size={17}
                            strokeWidth={2.5}
                            className={activeTab === 'savings' ? 'icon-pop' : ''}
                        />
                        Ahorros
                    </button>

                    <button
                        onClick={() => setActiveTab('debts')}
                        className="flex-1 flex items-center justify-center gap-2 text-[12px] font-bold transition-all duration-300 active:scale-95 relative px-1"
                        style={{
                            color: activeTab === 'debts' ? '#ffffff' : '#6b7280',
                            zIndex: 2,
                            background: 'transparent',
                            border: 'none'
                        }}
                    >
                        <CreditCard
                            size={17}
                            strokeWidth={2.5}
                            className={activeTab === 'debts' ? 'icon-pop' : ''}
                        />
                        Deudas
                    </button>
                </div>
            </div>

            {/* Content Area - Animated Transition */}
            <div
                key={activeTab}
                className={`relative ${activeTab === 'budgets' ? 'slide-from-left' :
                    activeTab === 'debts' ? 'slide-from-right' :
                        'slide-up-fade' // Center tab (savings) uses a fade/up instead of lateral
                    }`}
            >
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
