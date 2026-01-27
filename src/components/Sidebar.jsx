import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, Wallet, Users, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { path: '/', label: 'Panel', icon: LayoutDashboard },
        { path: '/income', label: 'Ingresos', icon: TrendingUp },
        { path: '/expenses', label: 'Gastos', icon: TrendingDown },
        { path: '/savings', label: 'Ahorros', icon: PiggyBank },
    ];

    if (user && user.role === 'Admin') {
        navItems.push({ path: '/admin/users', label: 'Usuarios', icon: Users });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar glass">
            <div className="sidebar-header">
                <div className="logo-icon">
                    <Wallet color="white" size={24} />
                </div>
                <h1 className="logo-text">
                    Gzsunnk
                </h1>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon className="nav-icon" />
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile mb-4">
                    <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
                    <div className="user-info">
                        <p className="user-name">{user?.name || 'Usuario'}</p>
                        <p className="user-plan" style={{ fontSize: '0.7em', opacity: 0.7 }}>{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-danger hover:bg-danger-soft transition-colors text-sm"
                >
                    <LogOut size={16} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
