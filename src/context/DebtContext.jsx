import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DebtContext = createContext();

export const useDebts = () => {
    return useContext(DebtContext);
};

export const DebtProvider = ({ children }) => {
    const { token } = useAuth();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDebts = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('/api/data/debts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDebts(data);
            } else {
                console.warn("Endpoints de deudas no encontrados");
                setDebts([]);
            }
        } catch (error) {
            console.error("Error fetching debts", error);
            setDebts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDebts();
    }, [token]);

    const activeCount = debts.filter(d => d.current < d.target).length;

    const value = {
        debts,
        loading,
        fetchDebts,
        activeCount
    };

    return (
        <DebtContext.Provider value={value}>
            {children}
        </DebtContext.Provider>
    );
};
