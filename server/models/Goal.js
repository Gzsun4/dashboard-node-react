import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a goal name']
    },
    target: {
        type: Number,
        required: [true, 'Please add a target amount']
    },
    current: {
        type: Number,
        default: 0
    },
    color: {
        type: String,
        default: '#8884d8'
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

export default mongoose.model('Goal', goalSchema);
