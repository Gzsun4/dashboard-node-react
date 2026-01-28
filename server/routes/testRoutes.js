import express from 'express';
import { sendTelegramMessage } from '../services/telegramService.js';

const router = express.Router();

// Test route to send a Telegram message
router.get('/test-telegram/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const message = '🎉 <b>¡Prueba exitosa!</b>\n\n¡Hola! El sistema de Telegram está funcionando correctamente.\n\n✅ Tu bot está conectado.';

        await sendTelegramMessage(chatId, message);
        res.json({
            success: true,
            message: 'Mensaje enviado correctamente a Telegram',
            chatId: chatId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.data || 'No additional details'
        });
    }
});



// Debug route to check user linkage
router.get('/check-user-link/:chatId', async (req, res) => {
    try {
        const User = (await import('../models/User.js')).default;
        const { chatId } = req.params;

        const user = await User.findOne({ telegramChatId: chatId });

        if (user) {
            res.json({
                linked: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    telegramChatId: user.telegramChatId
                }
            });
        } else {
            res.json({
                linked: false,
                message: 'No user found with this Chat ID',
                searchedChatId: chatId
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
