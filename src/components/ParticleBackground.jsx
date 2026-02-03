import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const symbols = ['$', '€', '£', '¥', '₿', 'S/', '₽', '₹', '₩', '₣', '₺', '↗', '↘', 'Ξ', '₮', '₼', '₾', 'BTC', 'ETH'];
        const particles = Array.from({ length: 50 }).map(() => ({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 200,
            symbol: symbols[Math.floor(Math.random() * symbols.length)],
            fontSize: 10 + Math.random() * 20,
            speed: 0.5 + Math.random() * 1.5,
            opacity: 0.1 + Math.random() * 0.3
        }));

        let waveOffset = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Draw Trading Grid (Bloomberg style)
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
            ctx.lineWidth = 0.5;
            const gridSize = 50;

            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // 2. Draw Sine Wave Trend Line
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x++) {
                const y = (canvas.height / 2) + Math.sin(x * 0.005 + waveOffset) * 50;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            waveOffset += 0.01;

            // 3. Draw Floating Symbols
            particles.forEach((p) => {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.font = `${p.fontSize}px Rajdhani`;
                ctx.fillText(p.symbol, p.x, p.y);

                p.y -= p.speed;
                if (p.y < -50) {
                    p.y = canvas.height + 50;
                    p.x = Math.random() * canvas.width;
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default ParticleBackground;
