import React, { useState } from 'react';

const TestButton = () => {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        console.log('¡Botón clickeado!', count);
        setCount(count + 1);
        alert(`Has clickeado ${count + 1} veces`);
    };

    return (
        <div style={{ padding: '20px', background: 'white', color: 'black', margin: '20px' }}>
            <h2>Test de Botón</h2>
            <button
                onClick={handleClick}
                style={{
                    padding: '10px 20px',
                    background: 'blue',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Click aquí ({count})
            </button>
            <p>Contador: {count}</p>
        </div>
    );
};

export default TestButton;
