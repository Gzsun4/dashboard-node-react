import mongoose from 'mongoose';

const debtSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a debt name']
    },
    target: {
        type: Number,
        required: [true, 'Please add a total amount']
    },
    current: {
        type: Number,
        default: 0
    },
    color: {
        type: String,
        default: '#ef4444'
    },
    deadline: {
        type: String
    },
    history: [{
        amount: Number,
        date: String,
        note: String
    }]
}, {
    timestamps: true
});

export default mongoose.model('Debt', debtSchema);
