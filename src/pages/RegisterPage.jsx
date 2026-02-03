import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight, Instagram, Send } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const cardRef = useRef(null);
    const [tiltStyles, setTiltStyles] = useState({});
    const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

    const { register } = useAuth();
    const navigate = useNavigate();

    const updateTilt = (clientX, clientY) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        setSpotlightPos({ x, y });

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * 10;
        const rotateY = ((centerX - x) / centerX) * 10;

        setTiltStyles({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: 'transform 0.1s ease-out'
        });
    };

    const handleMouseMove = (e) => {
        updateTilt(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
        if (e.touches.length > 0) {
            updateTilt(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleMouseLeave = () => {
        setTiltStyles({
            transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)`,
            transition: 'transform 0.5s ease-out'
        });
    };

    const handleTouchEnd = () => {
        handleMouseLeave();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        setError('');
        setLoading(true);

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cyber-theme" style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(to bottom, var(--cyber-bg-deep), #0c1120)',
            padding: '20px'
        }}>
            <ParticleBackground />

            {/* Main Cyber Card */}
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchStart={handleTouchMove}
                className="glow-card"
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    padding: '50px 40px',
                    position: 'relative',
                    zIndex: 10,
                    background: 'var(--cyber-bg-card)',
                    backdropFilter: 'blur(32px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    boxShadow: '0 0 50px -10px rgba(6, 182, 212, 0.3), 0 0 50px -10px rgba(139, 92, 246, 0.3)',
                    overflow: 'hidden',
                    ...tiltStyles
                }}
            >
                {/* Corner Decals */}
                <div className="quantum-corner corner-tl" />
                <div className="quantum-corner corner-tr" />
                <div className="quantum-corner corner-bl" />
                <div className="quantum-corner corner-br" />
                {/* Spotlight Mask */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    background: `radial-gradient(circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(34, 211, 238, 0.1) 0%, transparent 80%)`,
                    zIndex: 0
                }} />


                <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                    <h1 className="text-shimmer" style={{
                        fontSize: '32px',
                        fontWeight: '900',
                        letterSpacing: '4px',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        fontFamily: 'Orbitron, sans-serif',
                        color: 'var(--cyber-text-pure)'
                    }}>
                        NUEVO REGISTRO
                    </h1>
                    <p style={{
                        color: 'var(--cyber-accent-cyan)',
                        fontSize: '10px',
                        fontWeight: '600',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        opacity: 0.8
                    }}>
                        SOLICITUD DE CREDENCIALES NIVEL 1
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        textTransform: 'uppercase'
                    }}>
                        ALERTA: {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: '700',
                            color: 'var(--cyber-text-muted)',
                            marginBottom: '8px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            NOMBRE COMPLETO
                        </label>
                        <div className="animate-scan" style={{ position: 'relative' }}>
                            <User size={16} style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--cyber-accent-cyan)'
                            }} />
                            <input
                                type="text"
                                required
                                style={{
                                    width: '100%',
                                    height: '48px',
                                    paddingLeft: '44px',
                                    paddingRight: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    fontFamily: 'Rajdhani'
                                }}
                                placeholder="NOMBRE DEL OPERADOR"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '10px',
                            fontWeight: '700',
                            color: 'var(--cyber-text-muted)',
                            marginBottom: '8px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            IDENTIDAD DIGITAL
                        </label>
                        <div className="animate-scan" style={{ position: 'relative' }}>
                            <Mail size={16} style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--cyber-accent-cyan)'
                            }} />
                            <input
                                type="email"
                                required
                                style={{
                                    width: '100%',
                                    height: '48px',
                                    paddingLeft: '44px',
                                    paddingRight: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    fontStyle: 'italic',
                                    fontFamily: 'Rajdhani'
                                }}
                                placeholder="usuario@pe.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: 'var(--cyber-text-muted)',
                                    marginBottom: '8px',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase'
                                }}>
                                    CLAVE
                                </label>
                                <div className="animate-scan" style={{ position: 'relative' }}>
                                    <Lock size={16} style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#06B6D4'
                                    }} />
                                    <input
                                        type="password"
                                        required
                                        style={{
                                            width: '100%',
                                            height: '48px',
                                            paddingLeft: '38px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'Rajdhani'
                                        }}
                                        placeholder="••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: 'var(--cyber-text-muted)',
                                    marginBottom: '8px',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase'
                                }}>
                                    CONFIRMAR
                                </label>
                                <div className="animate-scan" style={{ position: 'relative' }}>
                                    <Lock size={16} style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#06B6D4'
                                    }} />
                                    <input
                                        type="password"
                                        required
                                        style={{
                                            width: '100%',
                                            height: '48px',
                                            paddingLeft: '38px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none',
                                            fontFamily: 'Rajdhani'
                                        }}
                                        placeholder="••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            height: '52px',
                            borderRadius: '12px',
                            border: 'none',
                            background: loading ? 'var(--cyber-text-muted)' : 'var(--cyber-btn-gradient)',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '700',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'all 0.3s',
                            boxShadow: '0 10px 20px -5px rgba(6, 182, 212, 0.3)',
                            fontFamily: 'Orbitron',
                            marginBottom: '12px'
                        }}
                    >
                        {loading ? 'MODO: REGISTRANDO' : 'GENERAR CUENTA'}
                    </button>

                    {/* Social Authorization Section */}
                    <div style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '8px',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            color: 'var(--cyber-text-muted)',
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '1px',
                            marginBottom: '4px',
                            opacity: 0.8
                        }}>
                            ¿Te gustaría probar la app?
                        </p>
                        <p style={{
                            color: 'var(--cyber-text-muted)',
                            fontSize: '9px',
                            fontWeight: '600',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            marginBottom: '8px',
                            opacity: 0.6
                        }}>
                            Solicita tu acceso vía:
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '15px',
                            marginBottom: '-20px'
                        }}>
                            <a href="https://www.instagram.com/cd_jeesus/" target="_blank" rel="noopener noreferrer" style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--cyber-text-muted)',
                                transition: 'all 0.3s',
                                background: 'rgba(255, 255, 255, 0.02)'
                            }} className="social-icon-hover">
                                <Instagram size={16} />
                            </a>
                            <a href="https://t.me/gzsunk" target="_blank" rel="noopener noreferrer" style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--cyber-text-muted)',
                                transition: 'all 0.3s',
                                background: 'rgba(255, 255, 255, 0.02)'
                            }} className="social-icon-hover">
                                <Send size={16} />
                            </a>
                        </div>
                    </div>
                </form>

                <div style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#475569',
                    fontFamily: 'Orbitron'
                }}>
                    ¿YA TIENES CREDENCIALES?{' '}
                    <Link to="/login" style={{
                        color: '#6366f1',
                        fontWeight: '700',
                        textDecoration: 'none'
                    }}>
                        ACCEDER
                    </Link>
                </div>
            </div>
        </div >
    );
};

export default RegisterPage;
