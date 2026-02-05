import Expense from '../models/Expense.js';
import Income from '../models/Income.js';

export const getFinancialContext = async (userId) => {
    const now = new Date();
    // Expand to Last 90 Days (~3 Months)
    const past90Days = new Date();
    past90Days.setDate(now.getDate() - 90);

    // Formatting for query
    const year = past90Days.getFullYear();
    const month = String(past90Days.getMonth() + 1).padStart(2, '0');
    const day = String(past90Days.getDate()).padStart(2, '0');
    const filterDateStr = `${year}-${month}-${day}`;

    // Fetch transactions from last 90 days
    const expenses = await Expense.find({ user: userId, date: { $gte: filterDateStr } });
    const incomes = await Income.find({ user: userId, date: { $gte: filterDateStr } });

    // Calculate totals for the *Current Month* specifically for the summary section
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    // Filter helper
    const getMonthData = (data, pYear, pMonth) => {
        return data.filter(item => item.date.startsWith(`${pYear}-${pMonth}`));
    };

    // Current Month Totals
    const curExpenses = getMonthData(expenses, currentYear, currentMonth);
    const curTotalExp = curExpenses.reduce((sum, e) => sum + e.amount, 0);
    const curTotalInc = getMonthData(incomes, currentYear, currentMonth).reduce((sum, i) => sum + i.amount, 0);
    const curBalance = curTotalInc - curTotalExp;

    // Top Categories
    const catMap = {};
    expenses.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const topCategories = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amount]) => `${cat}: S/.${amount.toFixed(2)}`)
        .join(', ');

    // Recent Transactions
    const allTransactions = [
        ...expenses.map(e => ({ ...e.toObject(), type: 'Gasto' })),
        ...incomes.map(i => ({ ...i.toObject(), type: 'Ingreso' }))
    ].sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 30);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const todayStr = now.toLocaleDateString('es-CA', { timeZone: 'America/Lima' });
    const yesterdayStr = yesterday.toLocaleDateString('es-CA', { timeZone: 'America/Lima' });

    const groupedTx = {};
    allTransactions.forEach(t => {
        if (!groupedTx[t.date]) groupedTx[t.date] = [];
        groupedTx[t.date].push(t);
    });

    const recentTxText = Object.keys(groupedTx)
        .sort((a, b) => b.localeCompare(a))
        .map(date => {
            let label = `[${date}]`;
            if (date === todayStr) label += " (HOY)";
            if (date === yesterdayStr) label += " (AYER)";
            const txs = groupedTx[date].map(t =>
                `      * ${t.type}: S/. ${t.amount} (${t.category} - ${t.description || t.source || 'Sin desc.'})`
            ).join('\n');
            return `${label}:\n${txs}`;
        }).join('\n\n    ');

    return `
    [CONTEXTO FINANCIERO]
    Hoy: ${todayStr} | Ayer: ${yesterdayStr}
    Resumen Mes: Ing: S/. ${curTotalInc.toFixed(2)} | Gas: S/. ${curTotalExp.toFixed(2)} | Bal: S/. ${curBalance.toFixed(2)}
    Top Gastos: ${topCategories || "Ninguno"}
    Historial Reciente:
    ${recentTxText || "No hay movimientos recientes."}
    `;
};
