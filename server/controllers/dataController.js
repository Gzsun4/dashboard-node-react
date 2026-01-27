import asyncHandler from 'express-async-handler';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';

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

export {
    getIncomes, createIncome, deleteIncome,
    getExpenses, createExpense, deleteExpense,
    getGoals, createGoal, updateGoal, deleteGoal
};
