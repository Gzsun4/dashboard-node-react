import asyncHandler from 'express-async-handler';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';
import Debt from '../models/Debt.js';
import { getFinancialAdvice } from '../services/aiService.js';

// --- INCOMES ---
const getIncomes = asyncHandler(async (req, res) => {
    console.log(`Getting incomes for user: ${req.user.id} (${req.user.name})`);
    const incomes = await Income.find({ user: req.user.id });
    res.json(incomes);
});

const createIncome = asyncHandler(async (req, res) => {
    const { source, amount, date, category } = req.body;
    if (!source || !amount || !date || !category) {
        res.status(400);
        throw new Error('Please add all fields');
    }
    const income = await Income.create({
        source, amount, date, category, user: req.user.id
    });
    res.status(200).json(income);
});

const updateIncome = asyncHandler(async (req, res) => {
    const income = await Income.findById(req.params.id);
    if (!income) { res.status(404); throw new Error('Income not found'); }
    if (income.user.toString() !== req.user.id) { res.status(401); throw new Error('User not authorized'); }
    const updatedIncome = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedIncome);
});

const deleteIncome = asyncHandler(async (req, res) => {
    const income = await Income.findById(req.params.id);
    if (!income) { res.status(404); throw new Error('Income not found'); }
    if (income.user.toString() !== req.user.id) { res.status(401); throw new Error('User not authorized'); }
    await income.deleteOne();
    res.status(200).json({ id: req.params.id });
});

// --- EXPENSES ---
const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ user: req.user.id });
    res.json(expenses);
});

const createExpense = asyncHandler(async (req, res) => {
    const { description, amount, date, category } = req.body;
    if (!description || !amount || !date || !category) {
        res.status(400);
        throw new Error('Please add all fields');
    }
    const expense = await Expense.create({
        description, amount, date, category, user: req.user.id
    });
    res.status(200).json(expense);
});

const updateExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);
    if (!expense) { res.status(404); throw new Error('Expense not found'); }
    if (expense.user.toString() !== req.user.id) { res.status(401); throw new Error('User not authorized'); }
    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedExpense);
});

const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);
    if (!expense) { res.status(404); throw new Error('Expense not found'); }
    if (expense.user.toString() !== req.user.id) { res.status(401); throw new Error('User not authorized'); }
    await expense.deleteOne();
    res.status(200).json({ id: req.params.id });
});

// --- GOALS ---
const getGoals = asyncHandler(async (req, res) => {
    const goals = await Goal.find({ user: req.user.id });
    res.json(goals);
});

const createGoal = asyncHandler(async (req, res) => {
    const { name, target, current, color, deadline } = req.body;
    if (!name || !target) {
        res.status(400);
        throw new Error('Please add required fields');
    }
    const goal = await Goal.create({
        name, target, current, color, deadline, user: req.user.id
    });
    res.status(200).json(goal);
});

const updateGoal = asyncHandler(async (req, res) => {
    const goal = await Goal.findById(req.params.id);
    if (!goal) { res.status(404); throw new Error('Goal not found'); }
    if (goal.user.toString() !== req.user.id) { res.status(401); throw new Error('User not authorized'); }
    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedGoal);
});

const deleteGoal = asyncHandler(async (req, res) => {
    const goal = await Goal.findById(req.params.id);
    if (!goal) { res.status(404); throw new Error('Goal not found'); }
    if (goal.user.toString() !== req.user.id) { res.status(401); throw new Error('User not authorized'); }
    await goal.deleteOne();
    res.status(200).json({ id: req.params.id });
});

// --- DEBTS ---
const getDebts = asyncHandler(async (req, res) => {
    const debts = await Debt.find({ user: req.user.id });
    res.json(debts);
});

const createDebt = asyncHandler(async (req, res) => {
    const { name, target, current, color, deadline } = req.body;
    if (!name || !target) {
        res.status(400);
        throw new Error('Please add required fields');
    }
    const debt = await Debt.create({
        name, target, current, color, deadline, user: req.user.id
    });
    res.status(200).json(debt);
});

const updateDebt = asyncHandler(async (req, res) => {
    const debt = await Debt.findById(req.params.id);
    if (!debt) { res.status(404); throw new Error('Debt not found'); }
    if (debt.user.toString() !== req.user.id) { res.status(401); throw new Error('User not authorized'); }
    const updatedDebt = await Debt.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedDebt);
});

const deleteDebt = asyncHandler(async (req, res) => {
    const debt = await Debt.findById(req.params.id);
    if (!debt) { res.status(404); throw new Error('Debt not found'); }
    if (debt.user.toString() !== req.user.id) { res.status(401); throw new Error('User not authorized'); }
    await debt.deleteOne();
    res.status(200).json({ id: req.params.id });
});

const analyzeCreditRisk = asyncHandler(async (req, res) => {
    const { amount, term, tcea, manualIncome, manualDebt } = req.body;

    if (!amount || !term || !tcea) {
        res.status(400);
        throw new Error('Faltan datos de la simulación (monto, plazo, tcea)');
    }

    // 3. Procesar Stocks (Ahorros Totales Hoy)
    const goals = await Goal.find({ user: req.user.id });
    const totalSavings = goals.reduce((acc, goal) => acc + (goal.current || 0), 0);

    // 4. Obtener Perfil Financiero (Calculado o Manual)
    const calculatedProfile = await calculateFinancialProfile(req.user.id);

    const avgIncome = manualIncome !== undefined ? parseFloat(manualIncome) : calculatedProfile.avgIncome;
    const avgLivingExpenses = calculatedProfile.avgLivingExpenses;
    const avgExistingDebtPayment = manualDebt !== undefined ? parseFloat(manualDebt) : calculatedProfile.avgExistingDebtPayment;


    // --- LÓGICA DE SIMULACIÓN ---

    // Paso 1: Cálculo del Nuevo Compromiso (Cuota Francesa)
    // TCEA a TEM (Tasa Efectiva Mensual)
    // Formula: TEM = ((1 + TCEA/100)^(1/12)) - 1
    const tem = Math.pow(1 + (tcea / 100), 1 / 12) - 1;

    // Cuota = P * (TEM * (1+TEM)^n) / ((1+TEM)^n - 1)
    const repaymentTerm = parseInt(term) || 12;
    const loanAmount = parseFloat(amount);

    let newMonthlyInstallment = 0;
    if (tem > 0) {
        newMonthlyInstallment = loanAmount * (tem * Math.pow(1 + tem, repaymentTerm)) / (Math.pow(1 + tem, repaymentTerm) - 1);
    } else {
        newMonthlyInstallment = loanAmount / repaymentTerm; // Sin interes
    }


    // Paso 2: Análisis de Flujo de Caja Libre
    const availableCashFlowCurrent = avgIncome - avgLivingExpenses - avgExistingDebtPayment;
    const projectedCashFlow = availableCashFlowCurrent - newMonthlyInstallment;


    // Paso 3: Análisis de Endeudamiento (DTI)
    const futureDebtLoad = avgExistingDebtPayment + newMonthlyInstallment;
    const dtiRatio = avgIncome > 0 ? (futureDebtLoad / avgIncome) * 100 : 0;


    // Paso 4: Análisis de Resistencia (Runway)
    const futureTotalMonthlyCost = avgLivingExpenses + futureDebtLoad;
    const runwayMonths = futureTotalMonthlyCost > 0 ? (totalSavings / futureTotalMonthlyCost) : 0;


    // Veredicto
    let status = 'VIABLE';
    let riskLevel = 'BAJO';
    let messages = [];

    if (projectedCashFlow < 0) {
        status = 'NO VIABLE';
        riskLevel = 'CRÍTICO';
        messages.push('Tu flujo de caja proyectado sería negativo. No podrías pagar sin quemar ahorros.');
    } else if (dtiRatio > 40) {
        status = 'RIESGOSO';
        riskLevel = 'ALTO';
        messages.push(`Tu endeudamiento superaría el 40% (${dtiRatio.toFixed(1)}%). Bancos tradicionales podrían rechazar.`);
    }

    if (runwayMonths < 3) {
        if (status === 'VIABLE') {
            status = 'PRECAUCIÓN';
            riskLevel = 'MEDIO';
        }
        messages.push(`Tu fondo de seguridad solo cubriría ${runwayMonths.toFixed(1)} meses de tu nuevo estilo de vida. Se recomienda > 3 meses.`);
    }

    // 5. Generar Consejo con IA
    const aiData = {
        usuario: req.user.name || "Usuario",
        prestamo_solicitado: loanAmount,
        nueva_cuota: newMonthlyInstallment,
        cashflow_futuro_restante: projectedCashFlow,
        dti_real_porcentaje: dtiRatio,
        meses_ahorro_runway: runwayMonths
    };

    // Llamada al servicio de IA (No bloqueante o bloqueante según preferencia, aquí async await para mostrarlo inmediato)
    const aiAdvice = await getFinancialAdvice(aiData);

    res.json({
        simulation: {
            loanAmount,
            term: repaymentTerm,
            tcea,
            monthlyInstallment: newMonthlyInstallment
        },
        financialProfile: {
            avgIncome,
            avgLivingExpenses,
            avgExistingDebtPayment,
            totalSavings
        },
        analysis: {
            projectedCashFlow,
            dtiRatio,
            runwayMonths,
            status,
            riskLevel,
            messages
        },
        aiAdvice // Nuevo campo
    });
});


const getFinancialProfile = asyncHandler(async (req, res) => {
    const profile = await calculateFinancialProfile(req.user.id);
    res.json(profile);
});

// Helper function to calculate financial profile
const calculateFinancialProfile = async (userId) => {
    // 1. Definir rango de tiempo (Últimos 6 meses)
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const isWithinLast6Months = (dateStr) => {
        const date = new Date(dateStr);
        return date >= sixMonthsAgo && date <= today;
    };

    // 2. Obtener datos históricos
    const incomes = await Income.find({ user: userId });
    const expenses = await Expense.find({ user: userId });

    // 3. Procesar Flujos (Promedios Mensuales de ultimos 6 meses)
    const recentIncomes = incomes.filter(i => isWithinLast6Months(i.date));
    const recentExpenses = expenses.filter(e => isWithinLast6Months(e.date));

    // Calcular totales
    const totalIncome6m = recentIncomes.reduce((acc, i) => acc + i.amount, 0);

    const debtKeywords = ['deuda', 'deudas', 'préstamo', 'prestamo', 'crédito', 'credito', 'tarjeta'];
    let totalLivingExpenses6m = 0;
    let totalDebtPayments6m = 0;

    recentExpenses.forEach(e => {
        const cat = e.category.toLowerCase();
        const isDebt = debtKeywords.some(keyword => cat.includes(keyword));

        if (isDebt) {
            totalDebtPayments6m += e.amount;
        } else {
            totalLivingExpenses6m += e.amount;
        }
    });

    return {
        avgIncome: totalIncome6m / 6,
        avgLivingExpenses: totalLivingExpenses6m / 6,
        avgExistingDebtPayment: totalDebtPayments6m / 6
    };
};

export {
    getIncomes, createIncome, updateIncome, deleteIncome,
    getExpenses, createExpense, updateExpense, deleteExpense,
    getGoals, createGoal, updateGoal, deleteGoal,
    getDebts, createDebt, updateDebt, deleteDebt,
    analyzeCreditRisk,
    getFinancialProfile
};
