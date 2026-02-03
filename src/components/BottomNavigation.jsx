import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, ArrowLeftRight, Target, Sliders } from 'lucide-react';

const BottomNavigation = () => {
    const location = useLocation();
    const [isVisible, setIsVisible] = React.useState(true);
    const lastScrollY = React.useRef(0);

    React.useEffect(() => {
        const scroller = document.getElementById('root');
        if (!scroller) return;

        let lastScroll = scroller.scrollTop;

        const handleScroll = () => {
            const currentScroll = scroller.scrollTop;

            // Detectar dirección del scroll
            if (currentScroll > lastScroll && currentScroll > 70) {
                // Hacia abajo - ocultar
                setIsVisible(false);
            } else if (currentScroll < lastScroll) {
                // Hacia arriba - mostrar
                setIsVisible(true);
            }

            lastScroll = currentScroll;
        };

        // Escuchar directamente en el contenedor que tiene el scroll
        scroller.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            scroller.removeEventListener('scroll', handleScroll);
        };
    }, []); // Listener persistente

    const navItems = [
        { path: '/', icon: LayoutGrid, label: 'Panel' },
        { path: '/activity', icon: ArrowLeftRight, label: 'Actividad' },
        { path: '/planning', icon: Target, label: 'Planificación' },
        { path: '/settings', icon: Sliders, label: 'Ajustes' },
    ];

    const activeIndex = navItems.findIndex(item => item.path === location.pathname);

    return (
        <div
            id="bottom-navigation-container"
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(120px)',
                opacity: isVisible ? 1 : 0,
                transition: isVisible
                    ? 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // Aparecer un poco más elástico
                    : 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)', // Desaparecer más lento y suave
                zIndex: 999999,
                width: '90%',
                maxWidth: '420px',
                pointerEvents: isVisible ? 'auto' : 'none'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0', // Removed horizontal padding to fix indicator math
                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1.5px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '35px',
                boxShadow: `
                    0 20px 40px -10px rgba(0, 0, 0, 0.7),
                    0 0 60px -15px rgba(139, 92, 246, 0.2)
                `,
                position: 'relative',
                height: '70px' // Fixed height for consistent vertical centering
            }}>
                {/* Sliding Highlight Indicator */}
                <div
                    style={{
                        position: 'absolute',
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                        boxShadow: '0 0 25px rgba(139, 92, 246, 0.6), 0 0 50px rgba(139, 92, 246, 0.3)',
                        left: `${(activeIndex * 25) + 12.5}%`, // Simple percentage based centering
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        zIndex: 0
                    }}
                >
                    {/* Inner Glow */}
                    <div style={{
                        position: 'absolute',
                        inset: '0',
                        background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent 60%)',
                        borderRadius: '50%'
                    }} />

                    {/* Glowing Dot */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#a78bfa',
                        boxShadow: '0 0 12px rgba(167, 139, 250, 1), 0 0 20px rgba(167, 139, 250, 0.6)',
                        animation: 'pulse 2s infinite'
                    }} />
                </div>

                {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={{
                                flex: 1,
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textDecoration: 'none',
                                zIndex: 1
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '52px',
                                    height: '52px'
                                }}
                            >
                                <Icon
                                    size={26}
                                    color={isActive ? '#ffffff' : '#94a3b8'}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    style={{
                                        transition: 'all 0.4s ease',
                                        transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                        filter: isActive ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none'
                                    }}
                                />
                            </div>
                        </NavLink>
                    );
                })}
            </div>

            {/* Añadir animación de pulso para el puntito */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.7;
                        transform: scale(1.2);
                    }
                }
            `}</style>
        </div>
    );
};

export default BottomNavigation;
