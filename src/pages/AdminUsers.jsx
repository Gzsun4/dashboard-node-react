import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Shield, User, Key, Menu } from 'lucide-react';
import MobileMenuButton from '../components/MobileMenuButton';
import MobileHeader from '../components/MobileHeader';
import CustomTrashIcon from '../components/CustomTrashIcon';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const { onlineUsers } = useSocket();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error("API Error: Users data is not an array", data);
                setUsers([]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {


        try {
            await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUsers(users.filter(user => user._id !== id));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            fetchUsers();
            setShowModal(false);
            setNewUser({ name: '', email: '', password: '' });
            alert("Usuario creado exitosamente");
        } catch (error) {
            console.error("Error creating user", error);
            alert("Error al crear usuario");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await fetch(`/api/admin/users/${selectedUser._id}/reset-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword })
            });
            setShowPasswordModal(false);
            setNewPassword('');
            setSelectedUser(null);
            alert('Contraseña actualizada exitosamente');
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Error al actualizar contraseña');
        }
    };

    return (
        <>
            <div className="animate-fade-in">
                <MobileHeader
                    title="Usuarios"
                    onAddClick={() => setShowModal(true)}
                    themeColor="#8b5cf6"
                    label="Nuevo"
                />

                <div className="page-header flex justify-between items-center hidden-mobile">
                    <div className="flex items-center gap-2">
                        <div>
                            <h1 className="page-title">Gestión de Usuarios</h1>
                            <p className="page-subtitle">Administra los usuarios del sistema</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            <User size={18} /> Agregar Usuario
                        </button>
                        <div className="bg-primary-soft p-3 rounded-full">
                            <Shield size={32} className="text-primary" />
                        </div>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Estado</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Unido</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center p-8">Cargando usuarios...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center p-8">No se encontraron usuarios</td></tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-secondary-soft flex-center">
                                                        <User size={20} className="text-secondary" />
                                                    </div>
                                                    <span className="font-semibold">{user.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {onlineUsers.includes(user._id) ? (
                                                    <span className="flex items-center gap-2 text-sm">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                        <span className="text-green-500 font-semibold">Online</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2 text-sm">
                                                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                                        <span className="text-gray-500">Offline</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-secondary">{user.email}</td>
                                            <td>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'Admin'
                                                    ? 'bg-primary-soft text-primary border border-blue-500/20'
                                                    : 'bg-secondary-soft text-secondary border border-gray-500/20'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="text-secondary">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowPasswordModal(true);
                                                        }}
                                                        className="p-2 text-primary hover:bg-primary-soft rounded-lg transition-colors"
                                                        title="Resetear Contraseña"
                                                    >
                                                        🔑
                                                    </button>
                                                    {user.role !== 'Admin' && (
                                                        <button
                                                            onClick={() => deleteUser(user._id)}
                                                            className="p-2 text-danger hover:bg-danger-soft rounded-lg transition-colors group"
                                                            title="Eliminar Usuario"
                                                        >
                                                            <CustomTrashIcon size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View - Visible only on Mobile */}
                    <div className="mobile-card-view p-4">
                        {loading ? (
                            <div className="text-center p-8">
                                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-secondary font-medium">Cargando usuarios...</p>
                            </div>
                        ) : !Array.isArray(users) || users.length === 0 ? (
                            <div className="text-center p-8 glass-card rounded-2xl">
                                <User size={48} className="text-secondary/50 mx-auto mb-3" />
                                <p className="text-secondary font-medium">No hay usuarios registrados</p>
                            </div>
                        ) : (
                            <div className="flex flex-col" style={{ gap: '10px' }}>
                                {users.map(user => {
                                    const isOnline = onlineUsers.includes(user._id);
                                    const isAdmin = user.role === 'Admin';

                                    // Get initials
                                    const getInitials = (name) => {
                                        if (!name) return 'U';
                                        const parts = name.trim().split(' ');
                                        if (parts.length >= 2) {
                                            return (parts[0][0] + parts[1][0]).toUpperCase();
                                        }
                                        return name.substring(0, 2).toUpperCase();
                                    };

                                    // Calculate last activity
                                    const getLastActivity = (createdAt) => {
                                        const now = new Date();
                                        const created = new Date(createdAt);
                                        const diffMs = now - created;
                                        const diffMins = Math.floor(diffMs / 60000);
                                        const diffHours = Math.floor(diffMs / 3600000);
                                        const diffDays = Math.floor(diffMs / 86400000);

                                        if (diffMins < 60) return `hace ${diffMins} min`;
                                        if (diffHours < 24) return `hace ${diffHours}h`;
                                        return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
                                    };

                                    return (
                                        <div
                                            key={user._id}
                                            style={{
                                                background: 'rgba(15, 23, 42, 0.8)',
                                                border: '1px solid rgba(71, 85, 105, 0.3)',
                                                borderRadius: '16px',
                                                padding: '20px'
                                            }}
                                        >
                                            {/* Header: Avatar + Name + Badge */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-start gap-3">
                                                    {/* Avatar */}
                                                    <div
                                                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg relative flex-shrink-0"
                                                        style={{
                                                            background: isAdmin
                                                                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                                                : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                                                            color: '#fff'
                                                        }}
                                                    >
                                                        {getInitials(user.name)}

                                                        {/* Online Status Dot */}

                                                    </div>

                                                    {/* Name + Email */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="flex items-center gap-1.5 text-xl text-white font-bold mb-1">
                                                            {user.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 flex-shrink-0">
                                                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                                                <path d="m2 7 10 6 10-6" />
                                                            </svg>
                                                            <span className="text-sm text-white truncate">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Role Badge */}
                                                <span
                                                    className="px-2.5 text-xs font-bold self-start"
                                                    style={{
                                                        background: isAdmin ? 'rgba(99, 102, 241, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                                        color: isAdmin ? '#a5b4fc' : '#94a3b8',
                                                        border: isAdmin ? '1px solid #6366f1' : '1px solid #64748b',
                                                        borderRadius: '6px',
                                                        paddingTop: '2px',
                                                        paddingBottom: '2px',
                                                        height: 'fit-content',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    {user.role}
                                                </span>
                                            </div>

                                            {/* Additional Info - Aligned with email */}
                                            <div style={{ paddingLeft: '60px' }}>
                                                {/* Join Date */}
                                                <div className="flex items-center gap-2" style={{ marginTop: '4px', marginBottom: '0px' }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#94a3b8' }}>
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                        <line x1="16" y1="2" x2="16" y2="6" />
                                                        <line x1="8" y1="2" x2="8" y2="6" />
                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                        Unido el {new Date(user.createdAt).toLocaleDateString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center gap-2 mb-4" style={{ marginTop: '4px' }}>
                                                    {isOnline ? (
                                                        <>
                                                            <div style={{ width: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <div style={{
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#10b981',
                                                                    boxShadow: '0 0 8px rgba(16,185,129,0.5)'
                                                                }}></div>
                                                            </div>
                                                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>En línea</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{ width: '14px', display: 'flex', justifyContent: 'center' }}>
                                                                <span style={{ color: '#94a3b8' }}>•</span>
                                                            </div>
                                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{getLastActivity(user.lastLogin || user.createdAt)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', width: '100%' }} />

                                            {/* Buttons */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowPasswordModal(true);
                                                    }}
                                                    className="flex-1 py-3.5 px-4 font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                                    style={{
                                                        background: '#1e293b',
                                                        color: '#fff',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}
                                                >
                                                    <Key size={16} />
                                                    <span>Contraseña</span>
                                                </button>

                                                {!isAdmin && (
                                                    <button
                                                        onClick={() => deleteUser(user._id)}
                                                        className="p-2 transition-all active:scale-[0.95]"
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#f87171',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <CustomTrashIcon size={24} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                        }
                    </div>
                </div>
            </div>

            {/* Modal Agregar Usuario */}
            {showModal && (
                <div className="modal-backdrop" style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999
                }}>
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                lineHeight: 1
                            }}
                        >
                            ×
                        </button>

                        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Nuevo Usuario
                        </h3>
                        <form onSubmit={handleCreateUser} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-2 ml-1">Nombre</label>
                                <input
                                    type="text"
                                    className="input-field w-full py-3 px-5 rounded-xl border-white/10"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                    placeholder="Nombre completo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-2 ml-1">Email</label>
                                <input
                                    type="email"
                                    className="input-field w-full py-3 px-5 rounded-xl border-white/10"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-2 ml-1">Contraseña</label>
                                <input
                                    type="password"
                                    className="input-field w-full py-3 px-5 rounded-xl border-white/10"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="btn btn-primary px-6 py-2 rounded-xl shadow-lg shadow-primary/25 w-full justify-center">
                                    Crear Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Resetear Contraseña */}
            {showPasswordModal && selectedUser && (
                <div className="modal-backdrop" style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 9999
                }}>
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
                        <button
                            onClick={() => {
                                setShowPasswordModal(false);
                                setSelectedUser(null);
                                setNewPassword('');
                            }}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '1.5rem',
                                lineHeight: 1
                            }}
                        >
                            ×
                        </button>

                        <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Resetear Contraseña
                        </h3>
                        <p className="text-secondary mb-4">
                            Usuario: <strong>{selectedUser.name}</strong> ({selectedUser.email})
                        </p>
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-2 ml-1">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="input-field w-full py-3 px-5 rounded-xl border-white/10"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="btn btn-primary px-6 py-2 rounded-xl shadow-lg shadow-primary/25 w-full justify-center">
                                    Actualizar Contraseña
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminUsers;
