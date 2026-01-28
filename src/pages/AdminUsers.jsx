import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Trash2, Shield, User, Key, Menu } from 'lucide-react';
import MobileMenuButton from '../components/MobileMenuButton';

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
        if (!window.confirm('Are you sure you want to delete this user?')) return;

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
                <div className="page-header flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <MobileMenuButton />
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
                                                            <Trash2 size={18} />
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
                    <div className="mobile-card-view p-4 space-y-4">
                        {loading ? (
                            <p className="text-center p-4 text-secondary">Cargando usuarios...</p>
                        ) : !Array.isArray(users) || users.length === 0 ? (
                            <p className="text-center p-4 text-secondary">No hay usuarios</p>
                        ) : (
                            users.map(user => (
                                <div key={user._id} className="glass-card p-4 flex items-center justify-between gap-3 relative mb-3">
                                    {/* Left Side: Info */}
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-full bg-secondary-soft flex-center shrink-0">
                                            <User size={20} className="text-secondary" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-white truncate max-w-[120px]">{user.name}</h3>
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'Admin' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                                                    {user.role === 'Admin' ? 'ADM' : 'USR'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-secondary mt-0.5">
                                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                                {onlineUsers.includes(user._id) && (
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Actions (Inline) */}
                                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setShowPasswordModal(true); }}
                                            className="p-3 text-secondary active:scale-95 transition-all flex-center"
                                            style={{ background: 'transparent', minWidth: '44px', minHeight: '44px' }}
                                        >
                                            <Key size={18} />
                                        </button>
                                        {user.role !== 'Admin' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteUser(user._id); }}
                                                className="p-3 text-danger active:scale-95 transition-all flex-center"
                                                style={{ background: 'transparent', minWidth: '44px', minHeight: '44px' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
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
