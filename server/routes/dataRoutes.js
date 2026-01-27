import express from 'express';
const router = express.Router();
import {
    getIncomes, createIncome, updateIncome, deleteIncome,
    getExpenses, createExpense, updateExpense, deleteExpense,
    getGoals, createGoal, updateGoal, deleteGoal
} from '../controllers/dataController.js';
import { protect } from '../middleware/authMiddleware.js';


router.route('/incomes').get(protect, getIncomes).post(protect, createIncome);
router.route('/incomes/:id').put(protect, updateIncome).delete(protect, deleteIncome);

router.route('/expenses').get(protect, getExpenses).post(protect, createExpense);
router.route('/expenses/:id').put(protect, updateExpense).delete(protect, deleteExpense);

router.route('/goals').get(protect, getGoals).post(protect, createGoal);
router.route('/goals/:id').put(protect, updateGoal).delete(protect, deleteGoal);

export default router;
