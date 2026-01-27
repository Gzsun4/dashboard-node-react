

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, Wallet, Users, LogOut, Menu, Bell } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Panel', icon: LayoutDashboard },
        { path: '/income', label: 'Ingresos', icon: TrendingUp },
        { path: '/expenses', label: 'Gastos', icon: TrendingDown },
        { path: '/savings', label: 'Ahorros', icon: PiggyBank },
        { path: '/reminders', label: 'Recordatorio', icon: Bell },
    ];

    if (user && user.role === 'Admin') {
        navItems.push({ path: '/admin/users', label: 'Usuarios', icon: Users });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            <button
                className={`mobile-menu-toggle ${isOpen ? 'hidden' : ''}`}
                onClick={toggleSidebar}
                aria-label="Toggle menu"
            >
                <Menu size={24} />
            </button>

            {isOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
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
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <a
                        href="https://www.instagram.com/cd_jeesus/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: '0.75em',
                            opacity: 0.6,
                            textAlign: 'center',
                            marginBottom: '1rem',
                            fontStyle: 'italic',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
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
};

export default Sidebar;
