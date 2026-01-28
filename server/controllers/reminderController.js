import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Get user's telegram config
// @route   GET /api/reminders
// @access  Private
const getReminderConfig = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        res.json({
            telegramChatId: user.telegramChatId || ''
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update telegram chat ID
// @route   POST /api/reminders
// @access  Private
const saveReminderConfig = asyncHandler(async (req, res) => {
    const { telegramChatId } = req.body;

    // Update User model with telegramChatId for bot authentication
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { telegramChatId },
        { new: true }
    );

    if (updatedUser) {
        res.json({
            telegramChatId: updatedUser.telegramChatId
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { getReminderConfig, saveReminderConfig };
