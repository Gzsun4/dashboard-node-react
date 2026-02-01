import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },
    telegramChatId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    lastLogin: {
        type: Date
    }

}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);
