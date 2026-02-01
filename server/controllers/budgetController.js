import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

// @desc    Get all budgets with progress
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });

        const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
            // Find total expenses for this category across ALL time (as requested by user)
            const expenses = await Expense.find({
                user: req.user.id,
                category: { $regex: new RegExp(`^${budget.category}$`, 'i') }
            });

            const spent = expenses.reduce((sum, item) => sum + item.amount, 0);

            return {
                _id: budget._id,
                category: budget.category,
                limit: budget.limit,
                spent: spent,
                percentage: spent === 0 ? 0 : Math.round((spent / budget.limit) * 100)
            };
        }));

        res.status(200).json(budgetsWithProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set/Create a budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = async (req, res) => {
    const { category, limit } = req.body;

    if (!category || !limit) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        // Check if exists
        const exists = await Budget.findOne({ user: req.user.id, category });
        if (exists) {
            return res.status(400).json({ message: 'Budget for this category already exists' });
        }

        const budget = await Budget.create({
            user: req.user.id,
            category,
            limit
        });

        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the budget user
        if (budget.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedBudget = await Budget.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedBudget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (budget.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await budget.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
