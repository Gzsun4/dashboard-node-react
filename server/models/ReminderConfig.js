const mongoose = require('mongoose');

const reminderConfigSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    telegramChatId: {
        type: String,
        required: true
    },
    reminderTime: {
        type: String, // Format: "HH:MM" (24-hour format)
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure one config per user
reminderConfigSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('ReminderConfig', reminderConfigSchema);
