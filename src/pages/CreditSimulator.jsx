import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';

const CreditSimulator = () => {
    const { token, user } = useAuth();
    console.log('CreditSimulator User:', user); // Debug log

    // Inputs del simulador
    const [amount, setAmount] = useState('');
    const [tcea, setTcea] = useState('');
    const [term, setTerm] = useState(''); // Meses
    const [destination, setDestination] = useState('');
    const [currency, setCurrency] = useState('PEN'); // 'PEN' | 'USD'

    const currencySymbol = currency === 'PEN' ? 'S/.' : '$';

    // Estado de la petición
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Modal de Contexto
    const [showContextModal, setShowContextModal] = useState(false);
    const [manualIncome, setManualIncome] = useState('');
    const [manualDebt, setManualDebt] = useState('');
    const [fetchingProfile, setFetchingProfile] = useState(false);

    const handleAnalyzeClick = async () => {
        // Validar inputs básicos antes de abrir el modal
        if (!amount || !tcea || !term) {
            setError("Por favor completa todos los campos del préstamo.");
            return;
        }
        setError(null);
        setFetchingProfile(true);
        setShowContextModal(true);

        try {
            const response = await fetch('http://localhost:5000/api/data/simulation/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setManualIncome(data.avgIncome.toFixed(2));
                setManualDebt(data.avgExistingDebtPayment.toFixed(2));
            }
        } catch (error) {
            console.error("Error fetching financial profile:", error);
        } finally {
            setFetchingProfile(false);
        }
    };

    const executeAnalysis = async () => {
        setShowContextModal(false);
        console.log('--- Execute Analysis Triggered ---');
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const payload = {
                amount: parseFloat(amount),
                tcea: parseFloat(tcea.replace(',', '.')),
                term: parseInt(term),
                manualIncome: manualIncome ? parseFloat(manualIncome) : undefined,
                manualDebt: manualDebt ? parseFloat(manualDebt) : undefined
            };
            // ...

            console.log('Payload:', payload);
            console.log('Token:', token ? 'Present' : 'Missing');

            const response = await fetch('http://localhost:5000/api/data/simulation/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            console.log('Response Status:', response.status);
            const data = await response.json();
            console.log('Response Data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error en la simulación');
            }

            setResult(data);
        } catch (err) {
            console.error('Simulation Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError(null);
    };

    // Renderizado del Resultado
    const renderResult = () => {
        if (!result) return null;

        const { analysis, simulation } = result;
        const { status, riskLevel, messages, runwayMonths, dtiRatio } = analysis;

        let statusColor = '#22c55e'; // Green
        if (status === 'RIESGOSO') statusColor = '#ef4444'; // Red
        if (status === 'PRECAUCIÓN') statusColor = '#eab308'; // Yellow
        if (status === 'NO VIABLE') statusColor = '#ef4444'; // Red

        return (
            <div className="animate-fade-in" style={{ marginTop: '25px' }}>
                {/* Tarjeta de Cuota */}
                <div style={{
                    padding: '20px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                        Cuota Mensual Estimada
                    </p>
                    <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: 0 }}>
                        {currencySymbol} {simulation.monthlyInstallment.toFixed(2)}
                    </h2>
                </div>
                {/* Resumen: Interés y Total */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    {/* Interés + Seguros */}
                    <div style={{
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#0f172a', // Slate 900
                        border: '1px solid #1e293b'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#2a2d3d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px'
                        }}>
                            <span style={{ color: '#f97316', fontSize: '14px' }}>↗</span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '5px' }}>
                            Interés + Seguros
                        </p>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#f97316', margin: 0 }}>
                            {currencySymbol} {((simulation.monthlyInstallment * simulation.term) - simulation.loanAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>

                    {/* Monto Total */}
                    <div style={{
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#0f172a',
                        border: '1px solid #1e293b'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px',
                            border: '1px solid #334155'
                        }}>
                            <span style={{ color: '#6366f1', fontSize: '14px' }}>$</span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '5px' }}>
                            Monto Total a Pagar
                        </p>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: 0 }}>
                            {currencySymbol} {(simulation.monthlyInstallment * simulation.term).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </div>
                </div>

                {/* Veredicto de Viabilidad */}
                <div style={{
                    padding: '20px 15px',
                    borderRadius: '20px',
                    background: `${statusColor}20`, // low opacity bg
                    border: `1px solid ${statusColor}`,
                    marginBottom: '20px'
                }}>

                    {/* (existing verdict card content) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: statusColor, fontWeight: '800', fontSize: '18px' }}>{status}</span>
                        <span style={{
                            background: statusColor,
                            color: '#000',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            fontSize: '10px',
                            fontWeight: '800',
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap',
                            display: 'inline-block',
                            width: 'fit-content'
                        }}>
                            RIESGO {riskLevel}
                        </span>
                    </div>

                    {/* Data Points */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '11px' }}>Endeudamiento (DTI)</p>
                            <p style={{ color: 'white', fontWeight: '700' }}>{dtiRatio.toFixed(1)}%</p>
                        </div>
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '11px' }}>Runway (Ahorros)</p>
                            <p style={{ color: 'white', fontWeight: '700' }}>{runwayMonths.toFixed(1)} Meses</p>
                        </div>
                    </div>
                    {/* ... */}
                    {/* Consejo IA Integrado */}
                    {result.aiAdvice && (
                        <div style={{
                            marginTop: '20px',
                            paddingTop: '15px',
                            borderTop: `1px solid ${statusColor}40`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                                }}>
                                    <span style={{ fontSize: '12px' }}>✨</span>
                                </div>
                                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e0e7ff', margin: 0 }}>
                                    {result.aiAdvice.titulo_corto || "Análisis Inteligente"}
                                </h3>
                            </div>
                            <p style={{
                                color: '#e0e7ff',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                fontWeight: '400',
                                opacity: 0.9,
                                margin: 0,
                                background: 'rgba(0,0,0,0.2)',
                                padding: '10px',
                                borderRadius: '12px'
                            }}>
                                "{result.aiAdvice.consejo_detallado}"
                            </p>
                        </div>
                    )}
                </div>
                {/* ... AI Advice ... */}



                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleReset}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                        <RotateCcw size={14} /> Nueva Simulación
                    </button>
                </div>
            </div >
        );
    };

    const isMaintenanceMode = true; // TOGGLE THIS TO DISABLE/ENABLE

    return (
        <div className="page-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <MobileHeader
                title="Simulador de Crédito"
                themeColor="#38bdf8"
                style={{ marginBottom: '20px' }}
            />

            {/* Modal de Validación de Contexto */}
            {showContextModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="animate-fade-in" style={{
                        width: '100%',
                        maxWidth: '340px',
                        background: '#0f172a', // Slate 900
                        borderRadius: '24px',
                        padding: '25px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        {/* Icono */}
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(249, 115, 22, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px'
                        }}>
                            <CheckCircle2 color="#f97316" size={24} />
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
                            Validar Contexto
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '25px' }}>
                            Para un cálculo preciso, confirma tus datos financieros actuales.
                            {fetchingProfile && <span style={{ marginLeft: '10px', color: '#f97316' }}>Cargando datos...</span>}
                        </p>

                        {/* Input Ingresos */}
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Ingreso Mensual (Promedio)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 'bold' }}>$</span>
                                <input
                                    type="number"
                                    value={manualIncome}
                                    onChange={(e) => setManualIncome(e.target.value)}
                                    placeholder="0.00"
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 35px',
                                        background: '#1e293b', // Slate 800
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Input Deudas */}
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Deudas Actuales (Cuota Total)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 'bold' }}>$</span>
                                <input
                                    type="number"
                                    value={manualDebt}
                                    onChange={(e) => setManualDebt(e.target.value)}
                                    placeholder="0.00"
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 35px',
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Botones */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                                onClick={() => setShowContextModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'transparent',
                                    color: '#94a3b8',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executeAnalysis}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'white',
                                    color: 'black',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Overlay */}
            {isMaintenanceMode && user?.role?.toLowerCase() !== 'admin' && (
                <div className="animate-fade-in" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 50,
                    backdropFilter: 'blur(8px)',
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        padding: '30px',
                        borderRadius: '24px',
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        maxWidth: '90%'
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '15px' }}>🚧</div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '10px' }}>
                            Construyendo un Mejor Sistema
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                            Estamos realizando mejoras para brindarte una simulación más precisa. Esta sección estará disponible pronto.
                        </p>
                    </div>
                </div>
            )}

            <div className={`content-wrapper ${isMaintenanceMode ? 'pointer-events-none opacity-50' : ''}`} style={{ position: 'relative', zIndex: 1, maxWidth: '100%', margin: '0 auto', padding: '0 0px' }}>

                <div style={{
                    padding: '20px 8px',
                    borderRadius: '24px',
                    background: '#15151b', // Dark background matching image
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                    {/* Header Card with Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(249, 115, 22, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{ color: '#f97316', fontWeight: 'bold', fontSize: '18px' }}>+</div>
                            </div>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>Nuevo Préstamo</h2>
                        </div>

                        {/* Currency Toggle */}
                        <div style={{
                            background: '#0a0a0c',
                            borderRadius: '20px',
                            padding: '4px',
                            display: 'flex',
                            border: '1px solid #27272a'
                        }}>
                            <button
                                onClick={() => setCurrency('PEN')}
                                style={{
                                    background: currency === 'PEN' ? '#22c55e' : 'transparent',
                                    color: currency === 'PEN' ? 'white' : '#64748b',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '4px 12px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                S/.
                            </button>
                            <button
                                onClick={() => setCurrency('USD')}
                                style={{
                                    background: currency === 'USD' ? '#3b82f6' : 'transparent',
                                    color: currency === 'USD' ? 'white' : '#64748b',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '4px 12px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                $
                            </button>
                        </div>
                    </div>

                    {/* Simulación Form (Solo visible si no hay resultado) */}
                    {!result && (
                        <>
                            {/* Input: Monto */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                    Monto a solicitar
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '20px', fontWeight: 'bold' }}>{currencySymbol}</div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Monto"
                                        style={{
                                            width: '100%',
                                            padding: '16px 16px 16px 50px', // Adjusted padding for larger symbol
                                            borderRadius: '16px',
                                            background: '#0a0a0c',
                                            border: '1px solid #27272a',
                                            color: 'white',
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Grid: Tasa y Plazo */}
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                {/* Tasa */}
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                        Tasa (TCEA)
                                        <span style={{ fontSize: '10px', cursor: 'pointer', opacity: 0.7 }}>ⓘ</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            value={tcea}
                                            onChange={(e) => setTcea(e.target.value)}
                                            placeholder="Tasa %"
                                            style={{
                                                width: '100%',
                                                padding: '16px 16px 16px 16px',
                                                borderRadius: '16px',
                                                background: '#0a0a0c',
                                                border: '1px solid #27272a',
                                                color: 'white',
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Plazo */}
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                        Plazo
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            value={term}
                                            onChange={(e) => setTerm(e.target.value)}
                                            placeholder="Meses"
                                            style={{
                                                width: '100%',
                                                padding: '16px 16px 16px 16px',
                                                borderRadius: '16px',
                                                background: '#0a0a0c',
                                                border: '1px solid #27272a',
                                                color: 'white',
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Input: Destino */}
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                    Destino del dinero
                                </label>
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="Ej. Compra de deuda, Auto nuevo..."
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        background: '#0a0a0c',
                                        border: '1px solid #27272a',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Mensaje de Error */}
                            {error && (
                                <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '13px', background: '#ef444410', padding: '10px', borderRadius: '10px' }}>
                                    {error}
                                </div>
                            )}

                            {/* Botón Analizar */}
                            {/* Botón Analizar (Abre Modal) */}
                            <button
                                onClick={handleAnalyzeClick}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    borderRadius: '16px',
                                    background: loading ? '#444' : '#ea580c', // Orange or Grey
                                    color: 'white',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: loading ? 'none' : '0 4px 20px rgba(234, 88, 12, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: loading ? 0.7 : 1
                                }}>
                                {loading ? 'Analizando...' : (
                                    <>
                                        Analizar Impacto
                                        <span style={{ fontSize: '18px' }}>›</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {/* Resultado */}
                    {renderResult()}

                </div>
            </div>
        </div>
    );
};

export default CreditSimulator;
