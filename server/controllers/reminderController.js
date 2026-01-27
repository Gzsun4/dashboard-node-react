import asyncHandler from 'express-async-handler';
import ReminderConfig from '../models/ReminderConfig.js';


// @desc    Get user's reminder config
// @route   GET /api/reminders
// @access  Private
const getReminderConfig = asyncHandler(async (req, res) => {
    const config = await ReminderConfig.findOne({ user: req.user.id });

    if (config) {
        res.json(config);
    } else {
        res.json(null);
    }
});

// @desc    Create or update reminder config
// @route   POST /api/reminders
// @access  Private
const saveReminderConfig = asyncHandler(async (req, res) => {
    const { telegramChatId, reminderTime, isActive } = req.body;

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(reminderTime)) {
        res.status(400);
        throw new Error('Invalid time format. Use HH:MM (24-hour format)');
    }

    // Update User model with telegramChatId for bot authentication
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user.id, { telegramChatId });

    const config = await ReminderConfig.findOne({ user: req.user.id });

    if (config) {
        // Update existing config
        config.telegramChatId = telegramChatId;
        config.reminderTime = reminderTime;
        config.isActive = isActive !== undefined ? isActive : config.isActive;

        const updatedConfig = await config.save();
        res.json(updatedConfig);
    } else {
        // Create new config
        const newConfig = await ReminderConfig.create({
            user: req.user.id,
            telegramChatId,
            reminderTime,
            isActive: isActive !== undefined ? isActive : true
        });
        res.status(201).json(newConfig);
    }
});

export { getReminderConfig, saveReminderConfig };
