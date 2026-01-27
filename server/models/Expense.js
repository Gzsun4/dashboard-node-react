import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    date: {
        type: String,
        required: [true, 'Please add a date']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    }
}, {
    timestamps: true
});

export default mongoose.model('Expense', expenseSchema);
