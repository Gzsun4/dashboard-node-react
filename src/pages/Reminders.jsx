import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Send, Hash, Save, ShieldCheck, CheckCircle, Menu, Smartphone, Search, Play, Phone } from 'lucide-react';
import MobileMenuButton from '../components/MobileMenuButton';
import MobileHeader from '../components/MobileHeader';

const Reminders = () => {
    const { token } = useAuth();
    const [telegramChatId, setTelegramChatId] = useState('');
    const [originalId, setOriginalId] = useState('');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (token) fetchConfig();
    }, [token]);

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/reminders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data && data.telegramChatId) {
                setTelegramChatId(data.telegramChatId);
                setOriginalId(data.telegramChatId);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching config:', error);
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch('/api/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ telegramChatId })
            });

            if (response.ok) {
                setOriginalId(telegramChatId);
                setToast({ message: 'Actualizado con éxito', type: 'success' });
            } else {
                setToast({ message: '❌ Error al guardar', type: 'error' });
            }
        } catch (error) {
            console.error('Error saving config:', error);
            setToast({ message: '❌ Error de conexión', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = telegramChatId !== originalId;
    const isLinked = originalId && originalId.length > 0;


    // Removed blocking loader as per user request
    // if (loading) return (...)


    return (
        <>
            <div className="animate-fade-in max-w-5xl mx-auto">
                <MobileHeader
                    title="Telegram"
                    themeColor="#0ea5e9"
                />

                {/* PC/Desktop Layout (Hidden on Mobile) */}
                <div className="hidden lg:block mt-8">
                    <div className="telegram-container">
                        {/* LEFT PANEL */}
                        <div className="telegram-left-panel">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                                <Hash size={24} className="text-blue-400" />
                            </div>

                            <h2 className="telegram-title">Configurar ID</h2>
                            <p className="telegram-desc">
                                Conecta tu cuenta para recibir notificaciones en tiempo real directamente en <span className="text-blue-400 font-medium">Telegram</span>.
                            </p>

                            <form onSubmit={handleSave}>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2 block">
                                    Telegram Chat ID
                                </label>

                                <div className="telegram-input-group">
                                    {isLinked ? (
                                        <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                        <div className="text-slate-500">
                                            <Hash size={20} />
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        className="telegram-input"
                                        placeholder="colocar aquí"
                                        value={telegramChatId}
                                        onChange={(e) => setTelegramChatId(e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mb-6 flex items-center gap-1.5 pl-1">
                                    <ShieldCheck size={14} />
                                    Solo se permiten números
                                </p>

                                <button
                                    type="submit"
                                    disabled={!hasChanges || isSaving}
                                    className="telegram-btn-primary"
                                    style={{ opacity: (!hasChanges && !isSaving) ? 0.7 : 1, cursor: (!hasChanges && !isSaving) ? 'not-allowed' : 'pointer' }}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            <span>{isLinked ? 'Actualizar ID' : 'Vincular'}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* RIGHT PANEL - Steps */}
                        <div className="telegram-right-panel">
                            <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-10">
                                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm">?</span>
                                ¿Cómo obtener tu ID?
                            </h3>

                            <div className="telegram-steps">
                                {/* Step 1 */}
                                <div className="telegram-step-item">
                                    <div className="telegram-lines"></div>
                                    <div className="telegram-step-icon">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="telegram-step-title">Abre Telegram</h4>
                                        <p className="telegram-step-desc">
                                            Ingresa a tu aplicación de mensajería desde tu teléfono o computadora.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="telegram-step-item">
                                    <div className="telegram-lines"></div>
                                    <div className="telegram-step-icon">
                                        <Search size={20} />
                                    </div>
                                    <div>
                                        <h4 className="telegram-step-title">Busca el Bot</h4>
                                        <p className="telegram-step-desc">
                                            Escribe <span className="telegram-highlight">@userinfobot</span> en la barra de búsqueda global.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="telegram-step-item">
                                    <div className="telegram-step-icon">
                                        <Play size={20} style={{ marginLeft: '4px' }} />
                                    </div>
                                    <div>
                                        <h4 className="telegram-step-title">Inicia el Bot</h4>
                                        <p className="telegram-step-desc">
                                            Presiona el botón "Iniciar" o envía el comando <span className="telegram-highlight">/start</span>. El bot te responderá con tu ID numérico.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-8 text-xs text-slate-500 italic border-t border-white/5 pt-6">
                                Tus datos están seguros y se utilizan únicamente para el envío de alertas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile Layout (Visible on Mobile Only) - Dark Theme matched to image */}
                <div className="lg:hidden flex flex-col gap-0 items-start relative z-10 p-0 overflow-hidden mx-4" style={{ background: '#080c14', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)', borderRadius: '40px' }}>
                    {/* Config Section */}
                    <div className="p-6 pb-2 w-full">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                            <Hash size={20} className="text-blue-400" />
                        </div>

                        <h3 className="telegram-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                            Configurar ID
                        </h3>
                        <p className="telegram-desc" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Conecta tu cuenta para recibir notificaciones en tiempo real directamente en <span className="text-blue-400 font-medium">Telegram</span>.
                        </p>

                        <form onSubmit={handleSave} className="flex flex-col mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-2 block">
                                Telegram Chat ID
                            </label>

                            <div className="telegram-input-group">
                                {isLinked ? (
                                    <CheckCircle size={20} className="text-green-500" />
                                ) : (
                                    <div className="text-slate-500">
                                        <ShieldCheck size={20} />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    className="telegram-input"
                                    placeholder="colocar aquí"
                                    value={telegramChatId}
                                    onChange={(e) => setTelegramChatId(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 pl-1 mb-6">
                                <CheckCircle size={14} className="text-slate-600" />
                                Solo se permiten números
                            </p>

                            <button
                                type="submit"
                                disabled={!hasChanges || isSaving}
                                className="telegram-btn-primary"
                                style={{
                                    marginTop: '0',
                                    opacity: (!hasChanges && !isSaving) ? 0.9 : 1
                                }}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} className="rotate-45 mb-1 mr-1" />
                                        <span>{isLinked ? 'Actualizar ID' : 'Vincular'}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Instructions Section */}
                    <div className="p-6 w-full relative" style={{ background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>

                        <h3 className="flex items-center gap-3 text-lg font-bold text-white" style={{ marginBottom: '1rem' }}>
                            {/* Glass Box for Question Mark */}
                            <div className="w-10 h-10 flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', color: '#60a5fa' }}>?</div>
                            ¿Cómo obtener tu ID?
                        </h3>

                        <div className="space-y-0 pl-1">
                            {/* Step 1 */}
                            <div className="telegram-step-item" style={{ marginBottom: '1.5rem', gap: '1.25rem' }}>
                                <div className="telegram-lines" style={{ left: '21px', top: '44px', bottom: '-22px' }}></div>
                                <div className="telegram-step-icon">
                                    <Smartphone size={18} />
                                </div>
                                <div className="pt-2">
                                    <h4 className="telegram-step-title" style={{ fontSize: '0.95rem' }}>Abre Telegram</h4>
                                    <p className="telegram-step-desc" style={{ fontSize: '0.85rem' }}>
                                        Ingresa a tu aplicación de mensajería desde tu teléfono o computadora.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="telegram-step-item" style={{ marginBottom: '1.5rem', gap: '1.25rem' }}>
                                <div className="telegram-lines" style={{ left: '21px', top: '44px', bottom: '-22px' }}></div>
                                <div className="telegram-step-icon">
                                    <Search size={18} />
                                </div>
                                <div className="pt-2">
                                    <h4 className="telegram-step-title" style={{ fontSize: '0.95rem' }}>Busca el Bot</h4>
                                    <p className="telegram-step-desc" style={{ fontSize: '0.85rem' }}>
                                        Escribe <span className="telegram-highlight">@userinfobot</span> en la búsqueda.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="telegram-step-item" style={{ gap: '1.25rem' }}>
                                <div className="telegram-step-icon">
                                    <Play size={18} style={{ marginLeft: '3px' }} />
                                </div>
                                <div className="pt-2">
                                    <h4 className="telegram-step-title" style={{ fontSize: '0.95rem' }}>Inicia el Bot</h4>
                                    <p className="telegram-step-desc" style={{ fontSize: '0.85rem' }}>
                                        Presiona "Iniciar" o envía <span className="telegram-highlight">/start</span>. El bot responderá con tu ID.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default Reminders;
