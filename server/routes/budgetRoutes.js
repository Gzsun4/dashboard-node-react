import express from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getBudgets)
    .post(protect, createBudget);

router.route('/:id')
    .put(protect, updateBudget)
    .delete(protect, deleteBudget);

export default router;
