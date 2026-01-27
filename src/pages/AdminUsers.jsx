import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trash2, Shield, User } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

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
            setUsers(data);
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
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            // Don't auto-login, just refresh list
            fetchUsers();
            setShowModal(false);
            setNewUser({ name: '', email: '', password: '' });
            alert("Usuario creado exitosamente");
        } catch (error) {
            console.error("Error creating user", error);
            alert("Error al crear usuario");
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Gestión de Usuarios</h1>
                    <p className="page-subtitle">Administra los usuarios del sistema</p>
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
                <div className="overflow-x-auto">
                    <table>
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Unido</th>
                                <th className="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center p-8">Cargando usuarios...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-8">No se encontraron usuarios</td></tr>
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
                                            {user.role !== 'Admin' && (
                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    className="p-2 text-danger hover:bg-danger-soft rounded-lg transition-colors group"
                                                    title="Eliminar Usuario"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Agregar Usuario */}
            {showModal && (
                <div className="modal-backdrop" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass-card modal-content p-6" style={{ width: '90%', maxWidth: '400px' }}>
                        <h3 className="mb-4">Nuevo Usuario</h3>
                        <form onSubmit={handleCreateUser}>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Nombre</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Email</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block mb-2 text-sm">Contraseña</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    className="btn glass"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Crear Usuario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
