import React from 'react';

const Card = ({ children, className = '', style = {}, ...props }) => {
    return (
        <div
            className={`glass-card p-4 rounded-2xl ${className}`}
            style={{
                background: 'rgba(30, 35, 55, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                ...style
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
