import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/ParticleBackground';
import MobileHeader from '../components/MobileHeader';
import { User, Send, ChevronRight, Moon, LogOut, Shield, Instagram, Save, Lock, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../modal-animations.css';

const Settings = () => {
    const { user, logout, token, updateUserData } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(true);
    const [showTelegramModal, setShowTelegramModal] = useState(false);
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false); // New state for profile modal
    const [isClosing, setIsClosing] = useState(false); // Animation state
    const [telegramId, setTelegramId] = useState('');
    const [whatsappId, setWhatsappId] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: ''
            });
        }
    }, [user]);

    // Handle closing with animation
    const handleCloseProfile = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowProfileModal(false);
            setIsClosing(false);
        }, 300); // Match CSS animation duration
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar perfil');
            }

            updateUserData(data);
            handleCloseProfile(); // Close with animation
            // Optional: Add success toast/notification here if you have one
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isConnected = !!user?.telegramChatId;
    const isWhatsappConnected = !!user?.whatsappId;

    useEffect(() => {
        if (user?.telegramChatId) {
            setTelegramId(user.telegramChatId);
        }
        if (user?.whatsappId) {
            setWhatsappId(user.whatsappId);
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleConnectTelegram = async () => {
        if (!telegramId.trim()) {
            alert('Por favor ingresa tu ID de Telegram');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/telegram', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ telegramChatId: telegramId.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al conectar');
            }

            updateUserData({ telegramChatId: telegramId });
            setShowTelegramModal(false);
            alert('¡Telegram conectado correctamente!');
        } catch (error) {
            console.error('Error al conectar Telegram:', error);
            alert(error.message || 'Error al conectar. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleConnectWhatsapp = async () => {
        if (!whatsappId.trim()) {
            alert('Por favor ingresa tu ID de WhatsApp');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/whatsapp', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ whatsappId: whatsappId.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al conectar');
            }

            updateUserData({ whatsappId: whatsappId });
            setShowWhatsappModal(false);
            alert('¡WhatsApp conectado correctamente!');
        } catch (error) {
            console.error('Error al conectar WhatsApp:', error);
            alert(error.message || 'Error al conectar. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="animate-fade-in"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '100dvh',
                    width: '100vw',
                    overflow: 'hidden',
                    touchAction: 'none',
                    zIndex: 0
                }}
            >
                <ParticleBackground />
                <MobileHeader
                    title="Ajustes"
                    themeColor="#3b82f6"
                    style={{ marginBottom: '0' }}
                />

                <div
                    className="flex flex-col gap-3"
                    style={{
                        padding: '25px 16px 10px 16px',
                        height: '100%',
                        width: '100%',
                        overflow: 'hidden'
                    }}
                >

                    {/* Profile Card - Premium Style */}
                    <div
                        className="flex items-center justify-between group"
                        onClick={() => setShowProfileModal(true)} // Open profile modal
                        style={{
                            background: '#1C1C1E',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px',
                            padding: '16px',
                            transition: 'all 0.3s',
                            cursor: 'pointer' // Add cursor pointer
                        }}
                    >
                        <div className="flex items-center gap-4">
                            <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                                {/* Subtle glow behind avatar */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: '50%',
                                        filter: 'blur(8px)',
                                        opacity: 0.4,
                                        background: '#3b82f6'
                                    }}
                                ></div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: 'white',
                                        position: 'relative',
                                        zIndex: 10,
                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)'
                                    }}
                                >
                                    {user?.name?.charAt(0).toUpperCase() || 'P'}
                                </div>
                            </div>
                            <div>
                                <h3 style={{
                                    fontWeight: '700',
                                    fontSize: '17px',
                                    color: 'white',
                                    letterSpacing: '-0.01em',
                                    margin: 0
                                }}>{user?.name || 'Jesus Guerrero'}</h3>
                                <p style={{
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#8E8E93',
                                    margin: 0,
                                    marginTop: '2px'
                                }}>Gestionar cuenta</p>
                            </div>
                        </div>
                        <ChevronRight size={20} style={{ color: '#636366' }} />
                    </div>

                    {/* Telegram Connect - Premium Card */}
                    <div
                        className="flex flex-col gap-5"
                        style={{
                            background: '#1C1C1E',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '24px',
                            padding: '20px'
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <h3 style={{
                                fontWeight: '700',
                                fontSize: '17px',
                                color: 'white',
                                margin: 0,
                                letterSpacing: '-0.01em'
                            }}>Conectar Telegram</h3>
                            <div
                                style={{
                                    paddingLeft: '12px',
                                    paddingRight: '12px',
                                    paddingTop: '4px',
                                    paddingBottom: '4px',
                                    borderRadius: '999px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: isConnected ? 'rgba(52, 199, 89, 0.15)' : '#2C2C2E',
                                    color: isConnected ? '#34C759' : '#8E8E93',
                                    border: isConnected ? '1px solid rgba(52, 199, 89, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                            >
                                {isConnected ? 'Conectado' : 'No conectado'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4" style={{ marginTop: '10px' }}>
                            <div
                                style={{
                                    width: '54px',
                                    height: '54px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    background: '#0088CC',
                                    color: 'white',
                                    boxShadow: '0 4px 10px rgba(0, 136, 204, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    overflow: 'hidden'
                                }}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="white" />
                                </svg>
                            </div>
                            <p style={{
                                fontSize: '14px',
                                lineHeight: '1.4',
                                fontWeight: '500',
                                color: '#8E8E93',
                                margin: 0
                            }}>
                                Recibe notificaciones y consejos de IA en tu chat.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowTelegramModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#8E8E93',
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                outline: 'none',
                                marginTop: '10px'
                            }}
                            className="transition-all active:opacity-60"
                        >
                            <ChevronRight size={18} />
                            <span>Toca para {isConnected ? 'gestionar' : 'conectar'}</span>
                        </button>
                    </div>

                    {/* WhatsApp Connect - Premium Card */}
                    <div
                        className="flex flex-col gap-5"
                        style={{
                            background: '#1C1C1E',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '24px',
                            padding: '20px'
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <h3 style={{
                                fontWeight: '700',
                                fontSize: '17px',
                                color: 'white',
                                margin: 0,
                                letterSpacing: '-0.01em'
                            }}>Conectar WhatsApp</h3>
                            <div
                                style={{
                                    paddingLeft: '12px',
                                    paddingRight: '12px',
                                    paddingTop: '4px',
                                    paddingBottom: '4px',
                                    borderRadius: '999px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: isWhatsappConnected ? 'rgba(37, 211, 102, 0.15)' : '#2C2C2E',
                                    color: isWhatsappConnected ? '#25D366' : '#8E8E93',
                                    border: isWhatsappConnected ? '1px solid rgba(37, 211, 102, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                            >
                                {isWhatsappConnected ? 'Conectado' : 'No conectado'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4" style={{ marginTop: '10px' }}>
                            <div
                                style={{
                                    width: '54px',
                                    height: '54px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    background: '#25D366',
                                    color: 'white',
                                    boxShadow: '0 4px 10px rgba(37, 211, 102, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    overflow: 'hidden'
                                }}
                            >
                                <MessageCircle size={28} />
                            </div>
                            <p style={{
                                fontSize: '14px',
                                lineHeight: '1.4',
                                fontWeight: '500',
                                color: '#8E8E93',
                                margin: 0
                            }}>
                                Registra gastos, ingresos y consulta a la IA por WhatsApp.
                            </p>
                        </div>

                        <button
                            onClick={() => setShowWhatsappModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#8E8E93',
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                outline: 'none',
                                marginTop: '10px'
                            }}
                            className="transition-all active:opacity-60"
                        >
                            <ChevronRight size={18} />
                            <span>Toca para {isWhatsappConnected ? 'gestionar' : 'conectar'}</span>
                        </button>
                    </div>

                    {/* Admin Actions (Conditional) */}
                    {user && (user.role === 'admin' || user.role === 'Admin' || user.name?.toLowerCase() === 'jesus guerrero') && (
                        <button
                            onClick={() => navigate('/admin/users')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                width: '100%',
                                textAlign: 'left',
                                background: '#1C1C1E',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '24px',
                                padding: '20px',
                                color: '#34C759',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                            className="transition-all active:scale-[0.98]"
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(52, 199, 89, 0.1)'
                            }}>
                                <Shield size={20} />
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '15px' }}>Panel de Administración</span>
                            <ChevronRight size={18} style={{ marginLeft: 'auto', color: '#636366' }} />
                        </button>
                    )}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            width: '100%',
                            textAlign: 'left',
                            background: '#1C1C1E',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '24px',
                            padding: '20px',
                            color: '#FF3B30',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                        className="transition-all active:scale-[0.98]"
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 59, 48, 0.1)'
                        }}>
                            <LogOut size={20} />
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '15px' }}>Cerrar Sesión</span>
                        <ChevronRight size={18} style={{ marginLeft: 'auto', color: '#636366' }} />
                    </button>



                    {/* Contact & Support Section */}
                    <div className="flex flex-col items-center gap-4 mt-8 mb-4">
                        <p style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            color: '#ffffff',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            opacity: 0.9
                        }}>
                            Contacto & Soporte
                        </p>

                        <a
                            href="https://www.instagram.com/cd_jeesus/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 transition-all active:scale-[0.98]"
                            style={{
                                background: '#121214',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '999px',
                                padding: '10px 24px',
                                textDecoration: 'none',
                                color: 'white'
                            }}
                        >
                            <Instagram size={22} style={{ color: '#ffffff', opacity: 0.8 }} />
                            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <span style={{ fontWeight: '600', fontSize: '15px', color: '#ffffff', letterSpacing: '0.02em', opacity: 0.9 }}>Gszunnk</span>
                            <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open('https://t.me/gzsunk', '_blank');
                                }}
                            >
                                <Send size={20} style={{ color: '#ffffff', opacity: 0.8 }} />
                            </div>
                        </a>
                    </div>

                    {/* Version Info */}
                    <p style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginTop: '10px',
                        color: '#ffffff',
                        letterSpacing: '0.02em',
                        opacity: 0.6
                    }}>
                        Finanzas App v1.2.0 • Build 2026.02
                    </p>
                </div>
            </div>

            {showTelegramModal && createPortal(
                <div
                    className="fixed inset-0 flex items-center justify-center p-4 animate-pure-fade"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        transition: 'all 0.4s ease'
                    }}
                    onClick={() => setShowTelegramModal(false)}
                >
                    <div
                        className="relative w-full max-w-[340px] animate-scale-in"
                        style={{
                            backgroundColor: '#050505',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '32px',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
                            padding: '32px 20px',
                            animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' // Smoother, slower scale-in
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="flex flex-col items-center text-center"
                            style={{ marginBottom: '0.7rem' }}
                        >
                            <div
                                className="flex items-center justify-center mb-6 relative"
                                style={{
                                    width: '74px',
                                    height: '74px',
                                    minWidth: '74px',
                                    minHeight: '74px',
                                    background: '#0088CC',
                                    borderRadius: '14px',
                                    boxShadow: '0 8px 16px rgba(0, 136, 204, 0.2)',
                                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    className="absolute inset-0 border border-white/20"
                                    style={{ borderRadius: '14px' }}
                                ></div>
                                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="white" />
                                </svg>
                            </div>
                            <h3 className="text-[20px] font-bold text-white mb-2 tracking-tight">
                                Conectar Telegram
                            </h3>
                            <p className="text-[14px] leading-relaxed text-[#8E8E93] max-w-[240px]">
                                Vincula tu cuenta para recibir notificaciones
                            </p>
                        </div>
                        <div style={{ height: '8px' }}></div>
                        {/* Input */}
                        <div style={{ marginBottom: '0.7rem' }}>
                            <label
                                htmlFor="telegram-id"
                                className="block text-[12px] font-medium text-white italic text-left"
                                style={{ marginBottom: '0' }}
                            >
                                ID de Telegram Chat
                            </label>
                            <div style={{ height: '8px' }}></div>
                            <input
                                id="telegram-id"
                                name="telegramId"
                                type="text"
                                value={telegramId}
                                onChange={(e) => setTelegramId(e.target.value)}
                                placeholder="123456789"
                                autoFocus
                                className="w-full px-4 text-[16px] font-normal text-white placeholder-[#585858] focus:outline-none"
                                style={{
                                    height: '52px',
                                    borderRadius: '14px',
                                    backgroundColor: '#1C1C1E',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        {/* Info Hint */}
                        {/* Info Hint */}
                        <div
                            className="flex items-start gap-3"
                            style={{
                                marginBottom: '0.7rem',
                                padding: '5px 12px',
                                borderRadius: '16px',
                                backgroundColor: 'rgba(42, 171, 238, 0.08)',
                                border: '1px solid rgba(42, 171, 238, 0.15)'
                            }}
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#5AC8FA" strokeWidth="2" />
                                    <path d="M12 16V12M12 8H12.01" stroke="#5AC8FA" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-[11px] leading-[1.4] text-[#EBEBF5] font-normal text-left">
                                Encuentra tu ID en Telegram escribiendo a{' '}
                                <a
                                    href="https://t.me/Gszunk_bot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#5AC8FA] hover:underline cursor-pointer font-semibold"
                                >
                                    @Gszunk
                                </a>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowTelegramModal(false)}
                                className="flex-1 text-[15px] font-semibold text-white transition-all active:scale-[0.96]"
                                style={{
                                    height: '52px',
                                    borderRadius: '14px',
                                    backgroundColor: '#1C1C1E',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConnectTelegram}
                                disabled={loading}
                                className="flex-1 text-[15px] font-bold text-white transition-all active:scale-[0.96] hover:opacity-90 disabled:opacity-50"
                                style={{
                                    height: '52px',
                                    borderRadius: '14px',
                                    backgroundColor: '#2AABEE',
                                    boxShadow: '0 0 20px rgba(42, 171, 238, 0.35)',
                                    border: 'none'
                                }}
                            >
                                {loading ? 'Conectando...' : (isConnected ? 'Actualizar ID' : 'Conectar Ahora')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showWhatsappModal && createPortal(
                <div
                    className="fixed inset-0 flex items-center justify-center p-4 animate-pure-fade"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        transition: 'all 0.4s ease'
                    }}
                    onClick={() => setShowWhatsappModal(false)}
                >
                    <div
                        className="relative w-full max-w-[340px] animate-scale-in"
                        style={{
                            backgroundColor: '#050505',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '32px',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
                            padding: '32px 20px',
                            animation: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="flex flex-col items-center text-center"
                            style={{ marginBottom: '0.7rem' }}
                        >
                            <div
                                className="flex items-center justify-center mb-6 relative"
                                style={{
                                    width: '74px',
                                    height: '74px',
                                    minWidth: '74px',
                                    minHeight: '74px',
                                    background: '#25D366',
                                    borderRadius: '14px',
                                    boxShadow: '0 8px 16px rgba(37, 211, 102, 0.2)',
                                    border: '1.5px solid rgba(255, 255, 255, 0.4)',
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    className="absolute inset-0 border border-white/20"
                                    style={{ borderRadius: '14px' }}
                                ></div>
                                <MessageCircle size={34} color="white" />
                            </div>
                            <h3 className="text-[20px] font-bold text-white mb-2 tracking-tight">
                                Conectar WhatsApp
                            </h3>
                            <p className="text-[14px] leading-relaxed text-[#8E8E93] max-w-[240px]">
                                Vincula tu cuenta para usar el bot de WhatsApp
                            </p>
                        </div>
                        <div style={{ height: '8px' }}></div>
                        {/* Input */}
                        <div style={{ marginBottom: '0.7rem' }}>
                            <label
                                htmlFor="whatsapp-id"
                                className="block text-[12px] font-medium text-white italic text-left"
                                style={{ marginBottom: '0' }}
                            >
                                ID de WhatsApp
                            </label>
                            <div style={{ height: '8px' }}></div>
                            <input
                                id="whatsapp-id"
                                name="whatsappId"
                                type="text"
                                value={whatsappId}
                                onChange={(e) => setWhatsappId(e.target.value)}
                                placeholder="51987654321@c.us"
                                autoFocus
                                className="w-full px-4 text-[16px] font-normal text-white placeholder-[#585858] focus:outline-none"
                                style={{
                                    height: '52px',
                                    borderRadius: '14px',
                                    backgroundColor: '#1C1C1E',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        {/* Info Hint */}
                        <div
                            className="flex items-start gap-3"
                            style={{
                                marginBottom: '0.7rem',
                                padding: '5px 12px',
                                borderRadius: '16px',
                                backgroundColor: 'rgba(37, 211, 102, 0.08)',
                                border: '1px solid rgba(37, 211, 102, 0.15)'
                            }}
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#25D366" strokeWidth="2" />
                                    <path d="M12 16V12M12 8H12.01" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-[11px] leading-[1.4] text-[#EBEBF5] font-normal text-left">
                                Escribe <b>/start</b> al bot de WhatsApp para obtener tu ID.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowWhatsappModal(false)}
                                className="flex-1 text-[15px] font-semibold text-white transition-all active:scale-[0.96]"
                                style={{
                                    height: '52px',
                                    borderRadius: '14px',
                                    backgroundColor: '#1C1C1E',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConnectWhatsapp}
                                disabled={loading}
                                className="flex-1 text-[15px] font-bold text-white transition-all active:scale-[0.96] hover:opacity-90 disabled:opacity-50"
                                style={{
                                    height: '52px',
                                    borderRadius: '14px',
                                    backgroundColor: '#25D366',
                                    boxShadow: '0 0 20px rgba(37, 211, 102, 0.35)',
                                    border: 'none'
                                }}
                            >
                                {loading ? 'Conectando...' : (isWhatsappConnected ? 'Actualizar ID' : 'Conectar Ahora')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}


            {/* Edit Profile Full Screen Modal */}
            {showProfileModal && createPortal(
                <div
                    className={`fixed inset-0 z-[99999] ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(5, 5, 5, 0.8)', // Slightly darker for better contrast
                        backdropFilter: 'blur(15px)', // Moderate blur
                        WebkitBackdropFilter: 'blur(15px)',
                        overflowY: 'auto'
                    }}
                >
                    <div className="flex flex-col h-full relative font-sans">
                        {/* Header */}
                        <div className="flex items-center p-6 pb-2" style={{ marginTop: '20px' }}>
                            <button
                                onClick={handleCloseProfile}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-active active:scale-95"
                                style={{
                                    background: '#1C1C1E',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-bold text-white" style={{ letterSpacing: '-0.5px', marginLeft: '25px' }}>Editar Perfil</h2>
                        </div>

                        <div
                            className="flex-1 flex flex-col items-center w-full"
                            style={{
                                paddingLeft: '30px',
                                paddingRight: '30px',
                                paddingTop: '16px',
                                paddingBottom: '40px'
                            }}
                        >

                            {/* Avatar Section - Matching design */}
                            <div className="relative mb-3 mt-4">
                                {/* Glow Effect */}
                                <div style={{
                                    position: 'absolute',
                                    inset: '-30px',
                                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)',
                                    filter: 'blur(25px)',
                                    zIndex: 0
                                }}></div>

                                {/* Avatar Circle */}
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '48px',
                                    fontWeight: '700',
                                    color: 'white',
                                    position: 'relative',
                                    zIndex: 1,
                                    border: '4px solid hsl(220, 30%, 7%)', // Match modal bg
                                    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)' // Outer thin border
                                }}>
                                    {user?.name?.charAt(0).toUpperCase() || 'J'}
                                </div>
                            </div>

                            {/* Name & Badge */}
                            <h3 className="text-2xl font-bold text-white mb-1 mt-2">{user?.name || 'Jesus Guerrero'}</h3>
                            <div className="px-4 py-1.5 rounded-full bg-[#1e1e24] border border-[#2f2f36]" style={{ marginBottom: '25px' }}>
                                <span className="text-[#6366f1] text-sm font-semibold">Usuario Premium</span>
                            </div>

                            {/* Form Fields */}
                            {/* Form Fields */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '24rem' }}>
                                {/* Name Input */}
                                <div>
                                    <label className="block text-[#6b7280] text-[11px] font-bold uppercase tracking-wider">
                                        Nombre Completo
                                    </label>
                                    <div style={{ height: '12px' }}></div>
                                    <div className="relative group">
                                        <div className="absolute top-1/2 -translate-y-1/2 text-[#6b7280] group-focus-within:text-[#3b82f6] transition-colors" style={{ left: '25px' }}>
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Tu nombre completo"
                                            className="w-full focus:ring-1 focus:ring-[#3b82f6] transition-all outline-none"
                                            style={{
                                                backgroundColor: '#121214',
                                                border: '1px solid #27272a',
                                                color: 'white',
                                                borderRadius: '16px',
                                                paddingTop: '16px',
                                                paddingBottom: '16px',
                                                paddingLeft: '65px',
                                                paddingRight: '16px',
                                                fontSize: '15px',
                                                fontWeight: '500',
                                                width: '100%',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label className="block text-[#6b7280] text-[11px] font-bold uppercase tracking-wider">
                                        Correo Electrónico
                                    </label>
                                    <div style={{ height: '12px' }}></div>
                                    <div className="relative group">
                                        <div className="absolute top-1/2 -translate-y-1/2 text-[#6b7280] group-focus-within:text-[#3b82f6] transition-colors" style={{ left: '25px' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            readOnly
                                            placeholder="tu@email.com"
                                            className="w-full focus:ring-1 focus:ring-[#3b82f6] transition-all outline-none"
                                            style={{
                                                backgroundColor: '#121214',
                                                border: '1px solid #27272a',
                                                color: '#9ca3af',
                                                fontStyle: 'italic',
                                                borderRadius: '16px',
                                                paddingTop: '16px',
                                                paddingBottom: '16px',
                                                paddingLeft: '65px',
                                                paddingRight: '60px',
                                                fontSize: '15px',
                                                fontWeight: '500',
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                cursor: 'not-allowed',
                                                opacity: 0.7
                                            }}
                                        />
                                        <div className="absolute top-1/2 -translate-y-1/2 text-[#6b7280] opacity-50" style={{ right: '25px' }}>
                                            <Lock size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label className="block text-[#6b7280] text-[11px] font-bold uppercase tracking-wider">
                                        Contraseña
                                    </label>
                                    <div style={{ height: '12px' }}></div>
                                    <div className="relative group">
                                        <div className="absolute top-1/2 -translate-y-1/2 text-[#6b7280] group-focus-within:text-[#3b82f6] transition-colors" style={{ left: '25px' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                        </div>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full focus:ring-1 focus:ring-[#3b82f6] transition-all outline-none"
                                            style={{
                                                backgroundColor: '#121214',
                                                border: '1px solid #27272a',
                                                color: 'white',
                                                borderRadius: '16px',
                                                paddingTop: '16px',
                                                paddingBottom: '16px',
                                                paddingLeft: '65px',
                                                paddingRight: '16px',
                                                fontSize: '15px',
                                                fontWeight: '500',
                                                width: '100%',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: '#3b82f6',
                                        color: 'white',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginTop: '10px',
                                        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                                        border: 'none',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <Save size={20} />
                                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default Settings;
