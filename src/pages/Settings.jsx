import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import MobileHeader from '../components/MobileHeader';
import { User, Send, ChevronRight, Moon, LogOut, Shield, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { user, logout, token, updateUserData } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(true);
    const [showTelegramModal, setShowTelegramModal] = useState(false);
    const [telegramId, setTelegramId] = useState('');
    const [loading, setLoading] = useState(false);

    const isConnected = !!user?.telegramChatId;

    useEffect(() => {
        if (user?.telegramChatId) {
            setTelegramId(user.telegramChatId);
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
                body: JSON.stringify({ telegramChatId: telegramId })
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

    return (
        <>
            <div className="animate-fade-in pb-24" style={{ minHeight: '100vh' }}>
                <MobileHeader
                    title="Ajustes"
                    themeColor="#3b82f6"
                />

                <div className="flex flex-col gap-4" style={{ paddingLeft: '10px', paddingRight: '10px', minHeight: 'calc(100vh - 200px)' }}>

                    {/* Profile Card - Premium Style */}
                    <div
                        className="flex items-center justify-between group"
                        style={{
                            background: '#1C1C1E',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '24px',
                            padding: '20px',
                            transition: 'all 0.3s'
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

                    {/* Admin Actions (Conditional) */}
                    {user?.role === 'admin' && (
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

                    {/* Spacer to push content to bottom */}
                    <div style={{ flex: 1 }}></div>

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
                    className="fixed inset-0 flex items-center justify-center p-4"
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
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                    }}
                    onClick={() => setShowTelegramModal(false)}
                >
                    <div
                        className="relative w-full max-w-[340px]"
                        style={{
                            backgroundColor: '#050505',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '32px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                            padding: '32px 20px'
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
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
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
                                    href="https://t.me/gzsunk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#5AC8FA] hover:underline cursor-pointer font-semibold"
                                >
                                    @gzsunk
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
            )
            }
        </>
    );
};

export default Settings;
