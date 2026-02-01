
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useDebts } from '../context/DebtContext';
import { LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, Wallet, Users, LogOut, Menu, Bell, Repeat, CreditCard } from 'lucide-react';
import './Sidebar.css';

const HomeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
        <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
    </svg>
);

const TelegramIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
    </svg>
);

const Sidebar = React.forwardRef(({ isOpen, closeSidebar }, ref) => {
    const { user, token, logout } = useAuth();
    const { currency, toggleCurrency } = useCurrency();
    const { activeCount } = useDebts();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', label: 'Panel', icon: HomeIcon },
        { path: '/income', label: 'Ingresos', icon: TrendingUp },
        { path: '/expenses', label: 'Gastos', icon: TrendingDown },
        { path: '/budgets', label: 'Presupuestos', icon: Wallet },
        { path: '/savings', label: 'Ahorros', icon: PiggyBank },
        { path: '/debts', label: 'Deudas', icon: CreditCard, badge: activeCount },
        { path: '/reminders', label: 'Telegram', icon: TelegramIcon },
    ];

    if (user && user.role === 'Admin') {
        navItems.push({ path: '/admin/users', label: 'Usuarios', icon: Users });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {isOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={closeSidebar}
                ></div>
            )}

            <aside
                ref={ref}
                className={`sidebar glass ${isOpen ? 'open' : ''}`}
            >
                <div className="sidebar-header">
                    <div className="logo-icon">
                        <Wallet color="white" size={24} />
                    </div>
                    <h1 className="logo-text">
                        Finanzas
                    </h1>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={closeSidebar}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                            {item.badge > 0 && (
                                <span style={{
                                    marginLeft: 'auto',
                                    background: '#ef4444',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    minWidth: '20px',
                                    textAlign: 'center'
                                }}>
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {/* Footer Actions: Instagram (Left) & Currency Toggle (Right) */}
                    <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <a
                            href="https://www.instagram.com/cd_jeesus/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '0.75em',
                                opacity: 0.6,
                                fontStyle: 'italic',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                            <span>@cd_jeesus</span>
                        </a>

                        <div
                            onClick={toggleCurrency}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '2px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '99px',
                                background: 'rgba(0,0,0,0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                width: 'fit-content',
                                height: 'fit-content'
                            }}
                        >
                            <div style={{
                                padding: '2px 4px',
                                borderRadius: '99px',
                                background: currency === 'PEN' ? 'hsl(var(--accent-primary))' : 'transparent',
                                color: currency === 'PEN' ? 'white' : 'rgba(255,255,255,0.5)',
                                fontWeight: currency === 'PEN' ? 700 : 500,
                                fontSize: '0.7rem',
                                minWidth: '18px',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 1,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                S/
                            </div>
                            <div style={{
                                padding: '2px 4px',
                                borderRadius: '99px',
                                background: currency === 'USD' ? 'hsl(var(--accent-primary))' : 'transparent',
                                color: currency === 'USD' ? 'white' : 'rgba(255,255,255,0.5)',
                                fontWeight: currency === 'USD' ? 700 : 500,
                                fontSize: '0.7rem',
                                minWidth: '18px',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 1,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                $
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        <div className="user-profile-container">
                            <div className="user-profile">
                                <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
                                <div className="user-info">
                                    <p className="user-name">{user?.name || 'Usuario'}</p>
                                    <p className="user-plan" style={{ fontSize: '0.7em', opacity: 0.7 }}>{user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="logout-icon-button"
                                aria-label="Cerrar sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;