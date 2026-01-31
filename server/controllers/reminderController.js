import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { sendNotification } from '../services/telegramBot.js';

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

    let updatedUser;
    try {
        // Update User model with telegramChatId for bot authentication
        updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { telegramChatId },
            { new: true }
        );
    } catch (error) {
        if (error.code === 11000) {
            res.status(409);
            throw new Error('Este ID de Telegram ya está vinculado a otra cuenta');
        }
        throw error;
    }

    if (updatedUser) {
        // Send welcome message if telegramChatId is provided
        if (telegramChatId) {
            try {
                await sendNotification(
                    telegramChatId,
                    "<b>¡Vinculación exitosa!</b> 🚀\n\nTu cuenta de Finanzas ha sido conectada correctamente. Aquí recibirás tus recordatorios y notificaciones."
                );
            } catch (error) {
                console.error("Failed to send welcome message:", error);
                // Don't fail the request if the message fails, just log it
            }
        }

        res.json({
            telegramChatId: updatedUser.telegramChatId
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { getReminderConfig, saveReminderConfig };
