import React, { useState } from 'react';
import { ChevronDown, ChevronUp, LayoutList } from 'lucide-react';
import TransactionItem from './TransactionItem';

const TransactionList = ({ transactions, onEdit, onDelete, type, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                No hay movimientos
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    @media (min-width: 769px) {
                        .mobile-transaction-card {
                            background: transparent !important;
                            border: none !important;
                            border-radius: 0 !important;
                            overflow: visible !important;
                        }
                        .mobile-toggle-header {
                            display: none !important;
                        }
                        .mobile-list-content {
                            display: block !important;
                            border: none !important;
                        }
                        .mobile-footer {
                            display: none !important;
                        }
                    }
                    @media (max-width: 768px) {
                        .mobile-transaction-card {
                            border-radius: 16px;
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            background: rgba(255, 255, 255, 0.05);
                            overflow: hidden;
                        }
                        .mobile-list-content {
                            border-top: 1px solid rgba(255, 255, 255, 0.1);
                        }
                    }
                `}
            </style>

            <div className="w-full mobile-transaction-card">
                {/* Header / Toggle - Mobile Only */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between p-4 cursor-pointer select-none transition-colors hover:bg-white/5 mobile-toggle-header"
                    style={{
                        color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                >
                    <div className="flex items-center gap-2 font-medium">
                        <div style={{
                            background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                            padding: '6px',
                            borderRadius: '8px',
                            display: 'flex'
                        }}>
                            <LayoutList size={20} className={isOpen ? "text-purple-400" : "text-gray-500"} />
                        </div>
                        <span>
                            {isOpen ? 'Ocultar movimientos' : 'Ver movimientos'}
                        </span>
                    </div>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                {/* List - Always shown on Desktop, Toggled on Mobile */}
                <div
                    className={`transaction-list-container mobile-list-content ${!isOpen ? 'hidden' : ''}`}
                // Force display block on desktop via CSS override above to ignore the hidden class if needed, 
                // or better logic: On desktop we don't use 'isOpen' state to hide. 
                // But standard CSS display:none takes precedence? 
                // We need to ensure desktop ALWAYS shows.
                >
                    <div>
                        {transactions.map((item) => (
                            <TransactionItem
                                key={item._id}
                                data={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                type={type}
                            />
                        ))}
                    </div>

                    {/* View All footer link - Mobile Only */}
                    <div
                        className="text-center py-4 mobile-footer"
                        style={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <button
                            className="text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors cursor-pointer"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                                padding: 0,
                                margin: 0,
                                width: 'auto',
                                height: 'auto'
                            }}
                        >
                            Ver todos
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionList;
