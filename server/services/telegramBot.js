import TelegramBot from 'node-telegram-bot-api';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Goal from '../models/Goal.js';


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

let bot;

/**
 * Initialize the Telegram bot
 */
export const initializeBot = () => {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
        return;
    }

    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    console.log('Telegram bot initialized and listening for messages...');

    // Handle all incoming messages
    bot.on('message', async (msg) => {
        try {
            await handleMessage(msg);
        } catch (error) {
            console.error('Error handling message:', error);
            bot.sendMessage(msg.chat.id, '❌ Error procesando tu mensaje. Intenta de nuevo.');
        }
    });

    // Handle errors
    bot.on('polling_error', (error) => {
        console.error('Polling error:', error);
    });
};

/**
 * Main message handler
 */
const handleMessage = async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (!text) return;

    // Authenticate user
    const user = await User.findOne({ telegramChatId: String(chatId) });

    if (!user) {
        await bot.sendMessage(
            chatId,
            `⛔ <b>Error: Usuario no vinculado</b>\\n\\nTu cuenta no está vinculada a este chat de Telegram.\\n\\n📱 <b>Para vincular:</b>\\n1. Ve a tu dashboard web\\n2. Entra a "Recordatorio"\\n3. Pega este ID: <code>${chatId}</code>\\n4. Guarda los cambios`,
            { parse_mode: 'HTML' }
        );
        return;
    }

    // Parse and execute command
    await parseCommand(text, user, chatId);
};

/**
 * Parse and execute commands
 */
const parseCommand = async (text, user, chatId) => {
    const lowerText = text.toLowerCase();

    // Command: Gasto [amount] [description]
    if (lowerText.startsWith('gasto ')) {
        await handleExpense(text, user, chatId);
        return;
    }

    // Command: Ingreso [amount] [description]
    if (lowerText.startsWith('ingreso ')) {
        await handleIncome(text, user, chatId);
        return;
    }

    // Command: Ahorro [amount] [description]
    if (lowerText.startsWith('ahorro ')) {
        await handleSaving(text, user, chatId);
        return;
    }

    // Command: Deshacer / Borrar ultimo
    if (lowerText === 'deshacer' || lowerText === 'borrar ultimo' || lowerText === 'borrar último') {
        await handleUndo(user, chatId);
        return;
    }

    // Command: Corregir monto [amount]
    if (lowerText.startsWith('corregir monto ')) {
        await handleCorrectAmount(text, user, chatId);
        return;
    }

    // Unknown command
    await bot.sendMessage(
        chatId,
        `⚠️ <b>No te entendí</b>\\n\\n<b>Comandos disponibles:</b>\\n• Gasto 50 Taxi al centro\\n• Ingreso 1200 Sueldo mensual\\n• Ahorro 200 Fondo emergencia\\n• Deshacer\\n• Corregir monto 75`,
        { parse_mode: 'HTML' }
    );
};

const handleExpense = async (text, user, chatId) => {
    const parts = text.split(' ');
    const amount = parseFloat(parts[1]);
    const description = parts.slice(2).join(' ') || 'Sin descripción';

    if (isNaN(amount) || amount <= 0) {
        await bot.sendMessage(chatId, '⚠️ El monto debe ser un número válido mayor a 0.');
        return;
    }

    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const expense = await Expense.create({
            user: user._id,
            description,
            amount,
            category: 'Varios',
            date: today
        });

        await bot.sendMessage(
            chatId,
            `✅ <b>Gasto registrado</b>\\n\\n💸 Monto: S/. ${amount.toFixed(2)}\\n📝 Descripción: ${description}`,
            { parse_mode: 'HTML' }
        );
    } catch (error) {
        console.error('Error creating expense:', error);
        await bot.sendMessage(chatId, '❌ Error al registrar el gasto.');
    }
};


const handleIncome = async (text, user, chatId) => {
    const parts = text.split(' ');
    const amount = parseFloat(parts[1]);
    const source = parts.slice(2).join(' ') || 'Sin descripción';

    if (isNaN(amount) || amount <= 0) {
        await bot.sendMessage(chatId, '⚠️ El monto debe ser un número válido mayor a 0.');
        return;
    }

    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const income = await Income.create({
            user: user._id,
            source,
            amount,
            category: 'Otros',
            date: today
        });

        await bot.sendMessage(
            chatId,
            `✅ <b>Ingreso registrado</b>\\n\\n💰 Monto: S/. ${amount.toFixed(2)}\\n📝 Fuente: ${source}`,
            { parse_mode: 'HTML' }
        );
    } catch (error) {
        console.error('Error creating income:', error);
        await bot.sendMessage(chatId, '❌ Error al registrar el ingreso.');
    }
};


/**
 * Handle saving creation
 */
const handleSaving = async (text, user, chatId) => {
    const parts = text.split(' ');
    const amount = parseFloat(parts[1]);
    const description = parts.slice(2).join(' ') || 'Sin descripción';

    if (isNaN(amount) || amount <= 0) {
        await bot.sendMessage(chatId, '⚠️ El monto debe ser un número válido mayor a 0.');
        return;
    }

    try {
        // Find or create a default savings goal
        let goal = await Goal.findOne({ user: user._id, name: 'Ahorros desde Telegram' });

        if (!goal) {
            goal = await Goal.create({
                user: user._id,
                name: 'Ahorros desde Telegram',
                target: 10000,
                current: 0,
                icon: 'PiggyBank',
                color: '#10b981'
            });
        }

        // Add to goal
        goal.current += amount;
        goal.history.push({
            amount,
            date: new Date(),
            description
        });
        await goal.save();

        await bot.sendMessage(
            chatId,
            `✅ <b>Ahorro registrado</b>\\n\\n🐷 Monto: S/. ${amount.toFixed(2)}\\n📝 Descripción: ${description}\\n💰 Total ahorrado: S/. ${goal.current.toFixed(2)}`,
            { parse_mode: 'HTML' }
        );
    } catch (error) {
        console.error('Error creating saving:', error);
        await bot.sendMessage(chatId, '❌ Error al registrar el ahorro.');
    }
};

const handleUndo = async (user, chatId) => {
    try {
        // Find last expense and income
        const lastExpense = await Expense.findOne({ user: user._id }).sort({ createdAt: -1 });
        const lastIncome = await Income.findOne({ user: user._id }).sort({ createdAt: -1 });

        let lastTransaction = null;
        let type = '';

        // Determine which is more recent
        if (lastExpense && lastIncome) {
            if (lastExpense.createdAt > lastIncome.createdAt) {
                lastTransaction = lastExpense;
                type = 'Gasto';
            } else {
                lastTransaction = lastIncome;
                type = 'Ingreso';
            }
        } else if (lastExpense) {
            lastTransaction = lastExpense;
            type = 'Gasto';
        } else if (lastIncome) {
            lastTransaction = lastIncome;
            type = 'Ingreso';
        }

        if (!lastTransaction) {
            await bot.sendMessage(chatId, '⚠️ No hay transacciones para deshacer.');
            return;
        }

        const amount = lastTransaction.amount;
        const description = lastTransaction.description || lastTransaction.source || 'Sin descripción';

        if (type === 'Gasto') {
            await Expense.findByIdAndDelete(lastTransaction._id);
        } else {
            await Income.findByIdAndDelete(lastTransaction._id);
        }

        await bot.sendMessage(
            chatId,
            `🗑️ <b>Eliminada tu última transacción</b>\\n\\n${type} de S/. ${amount.toFixed(2)}\\n📝 ${description}`,
            { parse_mode: 'HTML' }
        );
    } catch (error) {
        console.error('Error undoing transaction:', error);
        await bot.sendMessage(chatId, '❌ Error al deshacer la transacción.');
    }
};


const handleCorrectAmount = async (text, user, chatId) => {
    const parts = text.split(' ');
    const newAmount = parseFloat(parts[2]);

    if (isNaN(newAmount) || newAmount <= 0) {
        await bot.sendMessage(chatId, '⚠️ El monto debe ser un número válido mayor a 0.');
        return;
    }

    try {
        // Find last expense and income
        const lastExpense = await Expense.findOne({ user: user._id }).sort({ createdAt: -1 });
        const lastIncome = await Income.findOne({ user: user._id }).sort({ createdAt: -1 });

        let lastTransaction = null;
        let Model = null;

        // Determine which is more recent
        if (lastExpense && lastIncome) {
            if (lastExpense.createdAt > lastIncome.createdAt) {
                lastTransaction = lastExpense;
                Model = Expense;
            } else {
                lastTransaction = lastIncome;
                Model = Income;
            }
        } else if (lastExpense) {
            lastTransaction = lastExpense;
            Model = Expense;
        } else if (lastIncome) {
            lastTransaction = lastIncome;
            Model = Income;
        }

        if (!lastTransaction) {
            await bot.sendMessage(chatId, '⚠️ No hay transacciones para corregir.');
            return;
        }

        const oldAmount = lastTransaction.amount;
        lastTransaction.amount = newAmount;
        await lastTransaction.save();

        await bot.sendMessage(
            chatId,
            `✏️ <b>Monto corregido</b>\\n\\n❌ Anterior: S/. ${oldAmount.toFixed(2)}\\n✅ Nuevo: S/. ${newAmount.toFixed(2)}`,
            { parse_mode: 'HTML' }
        );
    } catch (error) {
        console.error('Error correcting amount:', error);
        await bot.sendMessage(chatId, '❌ Error al corregir el monto.');
    }
};


export default bot;
