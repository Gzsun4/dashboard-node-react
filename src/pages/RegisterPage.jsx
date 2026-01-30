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
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(to bottom right, #0a0a0f, #0f0f1a, #1a1a2e)',
            padding: '20px'
        }}>
            {/* Dynamic Background Blobs */}
            <div className="blob bg-green-600 w-72 h-72 top-10 left-10 mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="blob bg-blue-600 w-72 h-72 bottom-10 right-10 mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                position: 'relative',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        background: 'linear-gradient(to right, #34d399, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '12px'
                    }}>
                        Crear Cuenta
                    </h2>
                    <p style={{ color: '#9ca3af', fontSize: '16px' }}>Únete y controla tus finanzas</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        textAlign: 'center',
                        fontSize: '14px',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#9ca3af',
                            marginBottom: '12px'
                        }}>
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            required
                            style={{
                                width: '100%',
                                height: '50px',
                                padding: '0 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            placeholder="Tu Nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#9ca3af',
                            marginBottom: '12px'
                        }}>
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            required
                            style={{
                                width: '100%',
                                height: '50px',
                                padding: '0 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            placeholder="nombre@pe.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#9ca3af',
                            marginBottom: '12px'
                        }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            required
                            style={{
                                width: '100%',
                                height: '50px',
                                padding: '0 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#9ca3af',
                            marginBottom: '12px'
                        }}>
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            required
                            style={{
                                width: '100%',
                                height: '50px',
                                padding: '0 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: '50px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.3s',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
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

                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#9ca3af'
                }}>
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" style={{
                        color: '#8b5cf6',
                        fontWeight: '600',
                        textDecoration: 'none'
                    }}>
                        Inicia Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
