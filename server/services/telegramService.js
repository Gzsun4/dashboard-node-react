const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Send a message to a Telegram chat
 * @param {string} chatId - The Telegram chat ID
 * @param {string} message - The message to send
 * @returns {Promise} - Axios response
 */
const sendTelegramMessage = async (chatId, message) => {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
        return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const response = await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
        return response.data;
    } catch (error) {
        console.error('Error sending Telegram message:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    sendTelegramMessage
};
