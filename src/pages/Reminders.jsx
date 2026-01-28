import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Send, Hash, Save, ShieldCheck, CheckCircle } from 'lucide-react';

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
                <div className="page-header mb-8 text-center sm:text-left">
                    <div>
                        <h2 className="page-title flex items-center justify-center sm:justify-start gap-3">
                            <Send size={32} className="text-blue-500" />
                            Integración Telegram
                        </h2>
                        <p className="page-subtitle mt-2">
                            Vincula tu cuenta para interactuar con nuestro bot y recibir notificaciones.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
                    <Card className="transform transition-all duration-300 hover:shadow-lg border-t-4 border-t-blue-500">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <Hash className="text-primary" size={24} />
                                Configurar ID
                            </h3>
                            <p className="text-secondary text-sm">
                                Ingresa tu Chat ID único de Telegram para habilitar la conexión.
                            </p>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="mb-6 relative group">
                                <label className="text-sm text-secondary mb-2 block font-semibold uppercase tracking-wider">
                                    Telegram Chat ID
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className={`input-field w-full transition-all duration-300 ${isLinked ? 'border-green-500/50 bg-green-500/5' : ''
                                            }`}
                                        placeholder="Ej: 123456789"
                                        value={telegramChatId}
                                        onChange={(e) => setTelegramChatId(e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                    {isLinked && (
                                        <CheckCircle
                                            size={18}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-pulse"
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                                    <ShieldCheck size={12} />
                                    Solo números permitidos
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!hasChanges || isSaving}
                                className={`btn w-full justify-center gap-2 shadow-lg transition-all duration-300 ${isSaving ? 'opacity-70 cursor-wait' :
                                        hasChanges ? 'btn-primary translate-y-0' : 'btn-secondary opacity-50'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {isLinked ? 'Actualizar ID' : 'Vincular Telegram'}
                                    </>
                                )}
                            </button>
                        </form>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-0">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-blue-400">¿Cómo obtener tu ID?</h3>

                            <div className="space-y-6 relative ml-2">
                                {/* Vertical line only for connecting dots */}
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-blue-500/20"></div>

                                <div className="relative flex gap-4 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-4 h-4 mt-1 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"></div>
                                    <div>
                                        <p className="font-semibold text-gray-100">Abre Telegram</p>
                                        <p className="text-sm text-secondary mt-1">Entra a tu aplicación de mensajería.</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-4 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-4 h-4 mt-1 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"></div>
                                    <div>
                                        <p className="font-semibold text-gray-100">Busca @userinfobot</p>
                                        <p className="text-sm text-secondary mt-1">
                                            Escribe <code className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">@userinfobot</code> en el buscador.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative flex gap-4 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-4 h-4 mt-1 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"></div>
                                    <div>
                                        <p className="font-semibold text-gray-100">Inicia el bot</p>
                                        <p className="text-sm text-secondary mt-1">Presiona "Iniciar" o escribe <strong>/start</strong>.</p>
                                    </div>
                                </div>

                                <div className="relative flex gap-4 items-start">
                                    <div className="relative z-10 flex-shrink-0 w-4 h-4 mt-1 rounded-full bg-blue-500 border-2 border-slate-900 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]"></div>
                                    <div>
                                        <p className="font-semibold text-gray-100">Copia tu ID</p>
                                        <p className="text-sm text-secondary mt-1">El bot te responderá con tu ID numérico. Cópialo y pégalo aquí.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                                <div className="flex gap-3">
                                    <span className="text-xl">💡</span>
                                    <p className="text-blue-200/80 leading-relaxed">
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
