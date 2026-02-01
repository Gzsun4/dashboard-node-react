import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    limit: {
        type: Number,
        required: [true, 'Please add a limit amount']
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate budgets for the same category per user
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
