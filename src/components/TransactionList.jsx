import React, { useState } from 'react';
import { ChevronDown, ChevronUp, LayoutList, Search, X } from 'lucide-react';
import TransactionItem from './TransactionItem';

const TransactionList = ({ transactions, onEdit, onDelete, type, defaultOpen = false, searchQuery, setSearchQuery }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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
                            overflow: hidden !important; 
                            height: auto !important;
                            max-height: none !important;
                        }
                        .mobile-list-content {
                            border-top: 1px solid rgba(255, 255, 255, 0.1);
                            overflow: hidden !important;
                            max-height: 0;
                            opacity: 0;
                            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        }
                        .mobile-list-content.is-open {
                            max-height: 2000px; /* High enough for most lists */
                            opacity: 1;
                            padding-top: 4px; /* Small gap after header */
                        }
                    }
                `}
            </style>

            <div className="w-full mobile-transaction-card">
                <div
                    className="flex items-center justify-between p-4 cursor-pointer select-none transition-colors hover:bg-white/5 mobile-toggle-header"
                    style={{
                        color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                    onClick={() => !isSearchExpanded && setIsOpen(!isOpen)}
                >
                    {!isSearchExpanded ? (
                        <>
                            <div className="flex items-center gap-2 font-medium">
                                <div style={{
                                    background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    display: 'flex'
                                }}>
                                    <LayoutList size={20} className={isOpen ? "text-purple-400" : "text-gray-500"} />
                                </div>
                                <span style={{ fontSize: '18px' }}>
                                    {isOpen ? 'Ocultar movimientos' : 'Ver movimientos'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                {setSearchQuery && (
                                    <button
                                        className="p-2 transition-colors active:scale-95"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsSearchExpanded(true);
                                            setIsOpen(true);
                                        }}
                                    >
                                        <Search size={22} />
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center w-full gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="p-2 transition-colors active:scale-95"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={() => {
                                    setIsSearchExpanded(false);
                                    setSearchQuery('');
                                }}
                            >
                                <ChevronDown size={22} style={{ transform: 'rotate(90deg)' }} />
                            </button>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'white',
                                    fontSize: '16px',
                                    flex: 1,
                                    padding: '8px 4px'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    className="p-2 transition-colors active:scale-95"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-secondary)'
                                    }}
                                    onClick={() => setSearchQuery('')}
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* List - Always shown on Desktop, Toggled on Mobile */}
                <div
                    className={`transaction-list-container mobile-list-content hide-scrollbar ${isOpen ? 'is-open' : ''}`}
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


                </div>
            </div>
        </>
    );
};

export default TransactionList;
