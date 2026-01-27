import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    source: {
        type: String,
        required: [true, 'Please add a source']
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    date: {
        type: String, // Storing as string YYYY-MM-DD for simplicity as per frontend, or Date
        required: [true, 'Please add a date']
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    }
}, {
    timestamps: true
});

export default mongoose.model('Income', incomeSchema);
