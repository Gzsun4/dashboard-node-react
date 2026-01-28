import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Send, Hash, Save, ShieldCheck, CheckCircle, Menu } from 'lucide-react';
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

    if (loading) return (
        <div className="flex justify-center items-center h-64 animate-fade-in">
            <div className="loader"></div>
        </div>
    );

    return (
        <>
            <div className="animate-fade-in max-w-4xl mx-auto">
                <MobileHeader
                    title="Telegram"
                    themeColor="#0ea5e9"
                />

                <div className="page-header mb-8 hidden-mobile">
                    <div className="flex items-center gap-2">
                        <div>
                            <h2 className="page-title flex items-center gap-3">
                                <Send size={32} className="text-blue-500" />
                                Integración Telegram
                            </h2>
                            <p className="page-subtitle mt-2">
                                Vincula tu cuenta para interactuar con nuestro bot y recibir notificaciones.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
                    <Card className="transform transition-all duration-300 hover:shadow-lg border-t-4 border-t-blue-500 p-8 sm:p-10">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                                <Hash className="text-primary" size={28} />
                                Configurar ID
                            </h3>
                            <p className="text-secondary text-base leading-relaxed">
                                Ingresa tu Chat ID único de Telegram para habilitar la conexión.
                            </p>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="mb-8 relative group">
                                <label className="text-sm text-secondary mb-3 block font-semibold uppercase tracking-wider">
                                    Telegram Chat ID
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`input-field w-full py-4 transition-all duration-300 ${isLinked ? 'border-green-500/50 bg-green-500/5' : ''
                                            }`}
                                        placeholder="Ej: 123456789"
                                        value={telegramChatId}
                                        onChange={(e) => setTelegramChatId(e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                    {isLinked && (
                                        <CheckCircle
                                            size={20}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse"
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-secondary mt-3 flex items-center gap-1.5">
                                    <ShieldCheck size={14} />
                                    Solo números permitidos
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!hasChanges || isSaving}
                                className={`btn w-full py-4 justify-center gap-2 shadow-lg transition-all duration-300 ${isSaving ? 'opacity-70 cursor-wait' :
                                    hasChanges ? 'btn-primary translate-y-0' : 'btn-secondary opacity-50'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        {isLinked ? 'Actualizar ID' : 'Vincular Telegram'}
                                    </>
                                )}
                            </button>
                        </form>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-0 p-8 sm:p-10">
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-blue-400 mb-6">¿Cómo obtener tu ID?</h3>

                            <div className="space-y-8 relative ml-2">
                                {/* Vertical line only for connecting dots */}
                                <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-blue-500/20"></div>

                                <div className="relative flex gap-5 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-4 h-4 mt-1.5 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"></div>
                                    <div>
                                        <p className="font-bold text-lg text-gray-100">Abre Telegram</p>
                                        <p className="text-secondary mt-2 leading-relaxed">Entra a tu aplicación de mensajería.</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-5 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-4 h-4 mt-1.5 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"></div>
                                    <div>
                                        <p className="font-bold text-lg text-gray-100">Busca @userinfobot</p>
                                        <p className="text-secondary mt-2 leading-relaxed">
                                            Escribe <code className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-mono text-sm">@userinfobot</code> en el buscador.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative flex gap-5 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-4 h-4 mt-1.5 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"></div>
                                    <div>
                                        <p className="font-bold text-lg text-gray-100">Inicia el bot</p>
                                        <p className="text-secondary mt-2 leading-relaxed">Presiona "Iniciar" o escribe <strong>/start</strong>.</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-5 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-4 h-4 mt-1.5 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"></div>
                                    <div>
                                        <p className="font-bold text-lg text-gray-100">Copia tu ID</p>
                                        <p className="text-secondary mt-2 leading-relaxed">El bot te responderá con tu ID numérico. Cópialo y pégalo aquí.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm shadow-inner">
                                <div className="flex gap-4 items-start">
                                    <span className="text-2xl mt-1">💡</span>
                                    <p className="text-blue-200/90 leading-relaxed text-base">
                                        <strong>Tip:</strong> Una vez vinculado, podrás recibir recordatorios personalizados directamente en tu chat.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
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
