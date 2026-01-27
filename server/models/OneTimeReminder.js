import mongoose from 'mongoose';

const oneTimeReminderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    chatId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    scheduledAt: {
        type: Date,
        required: true
    },
    isSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient querying by date
oneTimeReminderSchema.index({ scheduledAt: 1, isSent: 1 });

export default mongoose.model('OneTimeReminder', oneTimeReminderSchema);
