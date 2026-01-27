import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[hsl(var(--bg-primary))]">
            {/* Dynamic Background Blobs */}
            <div className="blob bg-purple-600 w-72 h-72 top-0 left-0 mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="blob bg-blue-600 w-72 h-72 top-0 right-0 mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="blob bg-pink-600 w-72 h-72 -bottom-8 left-20 mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="glass-card p-8 md:p-10 w-full max-w-[420px] animate-fade-in relative z-10 m-4 border border-white/20 shadow-2xl rounded-[2rem] backdrop-blur-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
                        Bienvenido
                    </h2>
                    <p className="text-secondary mt-3 text-lg font-medium">Ingresa a tu panel financiero</p>
                </div>

                {error && (
                    <div className="bg-danger-soft text-danger p-4 rounded-xl mb-8 text-center text-sm border border-red-500/20 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-sm font-semibold text-secondary mb-3 ml-1">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            className="input-field w-full py-4 px-5 rounded-xl border-white/10 focus:border-primary/50 text-lg transition-all"
                            placeholder="nombre@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-secondary mb-3 ml-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="input-field w-full py-4 px-5 rounded-xl border-white/10 focus:border-primary/50 text-lg transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full justify-center py-4 rounded-xl text-lg font-bold tracking-wide shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5"
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-secondary">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="text-primary hover:text-white transition-colors font-semibold">
                        Regístrate aquí
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
