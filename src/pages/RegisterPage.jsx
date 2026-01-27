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
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#1a1a2e]">
            {/* Dynamic Background Blobs */}
            <div className="blob bg-green-600 w-72 h-72 top-10 left-10 mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="blob bg-blue-600 w-72 h-72 bottom-10 right-10 mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="glass-card w-full max-w-[450px] mx-4 p-6 md:p-10 animate-fade-in relative z-10 border border-white/10 shadow-2xl rounded-[20px] backdrop-blur-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
                        Crear Cuenta
                    </h2>
                    <p className="text-secondary mt-2 text-base font-medium">Únete y controla tus finanzas</p>
                </div>

                {error && (
                    <div className="bg-danger-soft text-danger p-4 rounded-xl mb-6 text-center text-sm border border-red-500/20 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-secondary mb-2 ml-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            className="input-field w-full h-[50px] px-4 rounded-xl border-white/10 focus:border-primary/50 text-base transition-all bg-white/5"
                            placeholder="Tu Nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-secondary mb-2 ml-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            className="input-field w-full h-[50px] px-4 rounded-xl border-white/10 focus:border-primary/50 text-base transition-all bg-white/5"
                            placeholder="nombre@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-secondary mb-2 ml-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="input-field w-full h-[50px] px-4 rounded-xl border-white/10 focus:border-primary/50 text-base transition-all bg-white/5"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-secondary mb-2 ml-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            required
                            className="input-field w-full h-[50px] px-4 rounded-xl border-white/10 focus:border-primary/50 text-base transition-all bg-white/5"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-[50px] rounded-xl text-base font-bold tracking-wide shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, hsl(var(--accent-success)), #10b981)',
                                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            {loading ? 'Creando...' : (
                                <>
                                    Registrarse <UserPlus size={20} />
                                </>
                            )}
                        </button>
                    </div>
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
