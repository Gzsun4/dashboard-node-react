import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Bell, HelpCircle, Save } from 'lucide-react';

const Reminders = () => {
    const { token } = useAuth();
    const [config, setConfig] = useState({
        telegramChatId: '',
        reminderTime: '20:00',
        isActive: true
    });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        if (token) fetchConfig();
    }, [token]);

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/reminders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data) {
                setConfig(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reminder config:', error);
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                setToast({ message: '✅ ¡Alarma configurada con éxito!', type: 'success' });
            } else {
                setToast({ message: '❌ Error al guardar la configuración', type: 'error' });
            }
        } catch (error) {
            console.error('Error saving config:', error);
            setToast({ message: '❌ Error al guardar la configuración', type: 'error' });
        }
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <>
            <div className="animate-fade-in">
                <div className="page-header mb-6">
                    <div>
                        <h2 className="page-title">Recordatorio</h2>
                        <p className="page-subtitle">Configura alertas diarias en Telegram.</p>
                    </div>
                </div>

                <div style={{ maxWidth: '600px' }}>
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-lg bg-primary-soft">
                                <Bell size={28} color="hsl(var(--accent-primary))" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Alertas de Recordatorio</h3>
                                <p className="text-secondary text-sm">Recibe un mensaje en Telegram para recordarte registrar tus gastos.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="mb-4">
                                <label className="text-sm text-secondary mb-2 block font-semibold">
                                    Chat ID de Telegram
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Ej: 123456789"
                                        value={config.telegramChatId}
                                        onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value })}
                                        required
                                        style={{ flex: 1 }}
                                    />
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            type="button"
                                            className="btn glass p-2"
                                            onMouseEnter={() => setShowTooltip(true)}
                                            onMouseLeave={() => setShowTooltip(false)}
                                        >
                                            <HelpCircle size={18} />
                                        </button>
                                        {showTooltip && (
                                            <div
                                                className="glass-card"
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    right: 0,
                                                    marginTop: '0.5rem',
                                                    padding: '0.75rem',
                                                    width: '200px',
                                                    fontSize: '0.875rem',
                                                    zIndex: 100
                                                }}
                                            >
                                                Busca <strong>@userinfobot</strong> en Telegram para obtener tu Chat ID
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-secondary mb-2 block font-semibold">
                                    Hora del Recordatorio
                                </label>
                                <input
                                    type="time"
                                    className="input-field"
                                    value={config.reminderTime}
                                    onChange={(e) => setConfig({ ...config, reminderTime: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-semibold block mb-1">Estado de la Alarma</label>
                                        <p className="text-xs text-secondary">
                                            {config.isActive ? 'Activada' : 'Desactivada'}
                                        </p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={config.isActive}
                                            onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary w-full justify-center">
                                <Save size={18} />
                                Guardar Cambios
                            </button>
                        </form>
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
