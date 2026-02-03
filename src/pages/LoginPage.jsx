import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Instagram, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const cardRef = useRef(null);
    const [tiltStyles, setTiltStyles] = useState({});
    const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Spotlight position
        setSpotlightPos({ x, y });

        // 3D Tilt calculation
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * 10; // Max 10 deg
        const rotateY = ((centerX - x) / centerX) * 10;

        setTiltStyles({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: 'transform 0.1s ease-out'
        });
    };

    const handleMouseLeave = () => {
        setTiltStyles({
            transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)`,
            transition: 'transform 0.5s ease-out'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Error de autenticación');
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
                className="glow-card"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '60px 40px',
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
                {/* Spotlight Cursor Mask */}
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

                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '9px',
                    color: 'var(--cyber-text-muted)',
                    letterSpacing: '2px',
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: 'Orbitron'
                }}>
                    SECURE ACCESS PROTOCOL
                </div>

                <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
                    <h1 className="text-shimmer" style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        letterSpacing: '8px',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        fontFamily: 'Orbitron, sans-serif',
                        color: 'var(--cyber-text-pure)',
                        display: 'block',
                        width: '100%'
                    }}>
                        BIENVENIDO
                    </h1>
                    <p style={{
                        color: 'var(--cyber-accent-cyan)',
                        fontSize: '10px',
                        fontWeight: '600',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        opacity: 0.8
                    }}>
                        INGRESA A TU PANEL FINANCIERO
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.05)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '24px',
                        textAlign: 'center',
                        fontSize: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        ERROR: {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'var(--cyber-text-muted)',
                            marginBottom: '10px',
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
                                    height: '52px',
                                    paddingLeft: '44px',
                                    paddingRight: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    color: 'white',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'border 0.3s',
                                    fontStyle: 'italic',
                                    fontFamily: 'Rajdhani'
                                }}
                                placeholder="usuario@pe.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: 'var(--cyber-text-muted)',
                            marginBottom: '10px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            CLAVE DE ACCESO
                        </label>
                        <div className="animate-scan" style={{ position: 'relative' }}>
                            <Lock size={16} style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--cyber-accent-cyan)'
                            }} />
                            <input
                                type="password"
                                required
                                style={{
                                    width: '100%',
                                    height: '52px',
                                    paddingLeft: '44px',
                                    paddingRight: '16px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    color: 'white',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'border 0.3s',
                                    fontFamily: 'Rajdhani'
                                }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            height: '56px',
                            borderRadius: '12px',
                            border: 'none',
                            background: loading ? 'var(--cyber-text-muted)' : 'var(--cyber-btn-gradient)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '700',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s',
                            boxShadow: '0 10px 20px -5px rgba(6, 182, 212, 0.4)',
                            fontFamily: 'Orbitron',
                            marginBottom: '15px'
                        }}
                    >
                        {loading ? 'CONECTANDO...' : 'CONECTAR AHORA'}
                    </button>

                    {/* Social Authorization Section */}
                    <div style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '10px',
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
                            marginBottom: '10px',
                            opacity: 0.6
                        }}>
                            Solicita tu acceso vía:
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '20px',
                            marginBottom: '-20px'
                        }}>
                            <a href="https://www.instagram.com/cd_jeesus/" target="_blank" rel="noopener noreferrer" style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--cyber-text-muted)',
                                transition: 'all 0.3s',
                                background: 'rgba(255, 255, 255, 0.02)'
                            }} className="social-icon-hover">
                                <Instagram size={18} />
                            </a>
                            <a href="https://t.me/gzsunk" target="_blank" rel="noopener noreferrer" style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--cyber-text-muted)',
                                transition: 'all 0.3s',
                                background: 'rgba(255, 255, 255, 0.02)'
                            }} className="social-icon-hover">
                                <Send size={18} />
                            </a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
