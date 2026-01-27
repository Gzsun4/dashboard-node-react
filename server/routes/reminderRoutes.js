import express from 'express';
import { getReminderConfig, saveReminderConfig } from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getReminderConfig)
    .post(protect, saveReminderConfig);

export default router;

