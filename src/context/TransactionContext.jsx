import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
    const { token } = useAuth();
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [goals, setGoals] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasLoaded, setHasLoaded] = useState(false);

    const fetchAll = useCallback(async (silent = false) => {
        if (!token) {
            setLoading(false);
            return;
        }

        if (!silent) setLoading(true);

        try {
            const [incRes, expRes, goalsRes, budRes] = await Promise.all([
                fetch('/api/data/incomes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/data/expenses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/data/goals', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/budgets', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (incRes.ok) {
                const incData = await incRes.json();
                setIncomes(incData);
            }

            if (expRes.ok) {
                const expData = await expRes.json();
                setExpenses(expData);
            }

            if (goalsRes.ok) {
                const goalsData = await goalsRes.json();
                setGoals(goalsData);
            }

            if (budRes.ok) {
                const budData = await budRes.json();
                setBudgets(budData);
            }

            setHasLoaded(true);
        } catch (error) {
            console.error("Error fetching financial data", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchAll();
        } else {
            setIncomes([]);
            setExpenses([]);
            setGoals([]);
            setBudgets([]);
            setHasLoaded(false);
        }
    }, [token, fetchAll]);

    const value = {
        incomes,
        setIncomes,
        expenses,
        setExpenses,
        goals,
        setGoals,
        budgets,
        setBudgets,
        loading,
        hasLoaded,
        fetchAll,
        refresh: () => fetchAll(true)
    };

    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    );
};
