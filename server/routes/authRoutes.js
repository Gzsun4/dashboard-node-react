import express from 'express';
const router = express.Router();
import { registerUser, loginUser, updateTelegramChatId, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/telegram', protect, updateTelegramChatId);
router.put('/profile', protect, updateProfile);

export default router;
