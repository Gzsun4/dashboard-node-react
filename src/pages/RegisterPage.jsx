import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setError('');
        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[hsl(var(--bg-primary))]">
            {/* Dynamic Background Blobs */}
            <div className="blob bg-green-600 w-72 h-72 top-10 left-10 mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="blob bg-blue-600 w-72 h-72 bottom-10 right-10 mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="glass-card p-10 md:p-12 w-full max-w-[500px] animate-fade-in relative z-10 m-4 border border-white/20 shadow-2xl rounded-[2rem] backdrop-blur-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
                        Crear Cuenta
                    </h2>
                    <p className="text-secondary mt-3 text-lg font-medium">Únete y controla tus finanzas</p>
                </div>

                {error && (
                    <div className="bg-danger-soft text-danger p-4 rounded-xl mb-8 text-center text-sm border border-red-500/20 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-secondary mb-2 ml-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            className="input-field w-full py-3 px-5 rounded-xl border-white/10 text-lg"
                            placeholder="Tu Nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            className="input-field w-full"
                            placeholder="nombre@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="input-field w-full"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary mb-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            required
                            className="input-field w-full"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full justify-center py-3 mt-6 text-lg group"
                        style={{ background: 'linear-gradient(135deg, hsl(var(--accent-success)), #10b981)' }}
                    >
                        {loading ? 'Creando...' : (
                            <>
                                Registrarse <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-secondary">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-primary hover:text-white transition-colors font-semibold">
                        Inicia Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
