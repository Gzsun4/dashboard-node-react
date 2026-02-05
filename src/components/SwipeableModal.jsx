import React, { useState, useRef } from 'react';

const SwipeableModal = ({ children, onClose }) => {
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);

    const handleTouchStart = (e) => {
        startY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;
        if (diff > 0) setDragY(diff);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragY > 100) {
            onClose();
        } else {
            setDragY(0);
        }
    };

    return (
        <div className="modal-wrapper" style={{ opacity: 1 - dragY / 500, transition: isDragging ? 'none' : 'opacity 0.3s ease' }}>
            <div
                className="modal-content-responsive"
                style={{
                    maxWidth: '320px',
                    transform: `translateY(${dragY}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease'
                }}
            >
                <div
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ width: '100%', height: '20px', position: 'absolute', top: 0, left: 0, zIndex: 10, cursor: 'grab', touchAction: 'none' }}
                />
                {children}
            </div>
        </div>
    );
};

export default SwipeableModal;
