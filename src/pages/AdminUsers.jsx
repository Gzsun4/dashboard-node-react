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
            const response = await fetch('http://localhost:5000/api/admin/users', {
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
            await fetch(`http://localhost:5000/api/admin/users/${id}`, {
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

    return (
        <div className="animate-fade-in">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage system users and access</p>
                </div>
                <div className="bg-primary-soft p-3 rounded-full">
                    <Shield size={32} className="text-primary" />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center p-8">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-8">No users found</td></tr>
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
                                                    title="Delete User"
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
        </div>
    );
};

export default AdminUsers;
