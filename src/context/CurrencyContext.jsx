import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    // Default to 'PEN' (Soles) or read from localStorage
    const [currency, setCurrency] = useState(() => {
        const saved = localStorage.getItem('app_currency');
        return saved || 'PEN';
    });

    useEffect(() => {
        localStorage.setItem('app_currency', currency);
    }, [currency]);

    const toggleCurrency = () => {
        setCurrency(prev => prev === 'PEN' ? 'USD' : 'PEN');
    };

    const formatCurrency = (amount) => {
        const symbol = currency === 'PEN' ? 'S/' : '$';
        return `${symbol} ${Number(amount).toFixed(2)}`;
    };

    const value = {
        currency,
        toggleCurrency,
        formatCurrency,
        symbol: currency === 'PEN' ? 'S/' : '$'
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
