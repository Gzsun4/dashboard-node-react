import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { sendTelegramMessage } from '../services/telegramService.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;


    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if email domain is valid
    if (!email.endsWith('@pe.com')) {
        res.status(400);
        throw new Error('Solo se permiten correos @pe.com');
    }


    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        // Role defaults to 'User' unless specified (could be dangerous if allowed to be set by user freely, generally we strip this or hardcode default here unless it's a seed script)
        // For safety, we can force default here if we don't want users to register as admin
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            telegramChatId: user.telegramChatId,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            telegramChatId: user.telegramChatId,
            lastLogin: user.lastLogin,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Update telegram chat ID
// @route   PUT /api/auth/telegram
// @access  Private
const updateTelegramChatId = asyncHandler(async (req, res) => {
    const { telegramChatId } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        user.telegramChatId = telegramChatId;
        const updatedUser = await user.save();

        // Send confirmation message to Telegram
        try {
            await sendTelegramMessage(telegramChatId, `<b>✨ ¡Vinculación Exitosa!</b>\n\nHola <b>${user.name}</b>, tu cuenta de Finanzas ha sido vinculada correctamente con este chat. A partir de ahora recibirás notificaciones aquí.`);
        } catch (error) {
            console.error('Could not send Telegram confirmation message:', error);
        }

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            telegramChatId: updatedUser.telegramChatId,
            token: generateToken(updatedUser._id, updatedUser.role)
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export {
    registerUser,
    loginUser,
    updateTelegramChatId
};
