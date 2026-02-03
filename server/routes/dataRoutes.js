import express from 'express';
const router = express.Router();
import {
    getIncomes, createIncome, updateIncome, deleteIncome,
    getExpenses, createExpense, updateExpense, deleteExpense,
    getGoals, createGoal, updateGoal, deleteGoal,
    getDebts, createDebt, updateDebt, deleteDebt,
    analyzeCreditRisk,
    getFinancialProfile
} from '../controllers/dataController.js';
import { protect } from '../middleware/authMiddleware.js';


router.route('/incomes').get(protect, getIncomes).post(protect, createIncome);
router.route('/incomes/:id').put(protect, updateIncome).delete(protect, deleteIncome);

router.route('/expenses').get(protect, getExpenses).post(protect, createExpense);
router.route('/expenses/:id').put(protect, updateExpense).delete(protect, deleteExpense);

router.route('/goals').get(protect, getGoals).post(protect, createGoal);
router.route('/goals/:id').put(protect, updateGoal).delete(protect, deleteGoal);

router.route('/debts').get(protect, getDebts).post(protect, createDebt);
router.route('/debts/:id').put(protect, updateDebt).delete(protect, deleteDebt);

router.post('/simulation/analyze', protect, analyzeCreditRisk);
router.get('/simulation/profile', protect, getFinancialProfile);

export default router;

