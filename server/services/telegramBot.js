import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Goal from '../models/Goal.js';
import OneTimeReminder from '../models/OneTimeReminder.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

let bot;
const userStates = {}; // Almacena el estado de la conversación

// --- CONFIGURACIÓN INTELIGENTE ---

const CATEGORY_MAP = {
    // Gastos
    'Alimentación': ['comida', 'almuerzo', 'cena', 'desayuno', 'snack', 'restaurante', 'mercado', 'supermercado', 'burger', 'pizza', 'pollo', 'bebida', 'menu', 'menú', 'fruta'],
    'Transporte': ['pasaje', 'bus', 'taxi', 'uber', 'tren', 'gasolina', 'combustible', 'peaje', 'combi', 'moto', 'colectivo', 'metro'],
    'Servicios': ['luz', 'agua', 'internet', 'celular', 'plan', 'gas', 'recarga', 'cable', 'servicio'],
    'Salud': ['farmacia', 'medico', 'consulta', 'pastillas', 'cita', 'doctor', 'medicina', 'dentista'],
    'Entretenimiento': ['cine', 'juego', 'salida', 'netflix', 'spotify', 'fiesta', 'entrada', 'concierto', 'steam', 'suscripción'],
    'Educación': ['curso', 'libro', 'clase', 'universidad', 'colegio', 'útiles', 'taller'],
    'Ropa': ['polo', 'camisa', 'pantalon', 'zapatillas', 'ropa', 'vestido', 'zapatos'],
    'Hogar': ['mueble', 'limpieza', 'casa', 'departamento', 'alquiler', 'reparación'],

    // Ingresos
    'Sueldo': ['sueldo', 'pago', 'nómina', 'salario', 'quincena', 'mensualidad'],
    'Freelance': ['freelance', 'trabajito', 'cachuelo', 'proyecto', 'cliente'],
    'Negocio': ['venta', 'ganancia', 'negocio'],
    'Regalo': ['regalo', 'propina'],
    'Inversiones': ['intereses', 'dividendo', 'retorno']
};

const INCOME_TRIGGERS = ['ingreso', 'gane', 'recibi', 'cobre', 'sueldo', 'depositaren', 'abono', 'pago'];
const REMINDER_TRIGGERS = ['alerta', 'recordatorio', 'avisame', 'acuerdame', 'recuerdame', 'alarma', 'programame', 'avisar', 'hazme acuerdo', 'hazme acordar'];

// --- FUNCIONES DE AYUDA (NLP) ---

const normalizeText = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const detectCategory = (text) => {
    const normalized = normalizeText(text);
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => normalized.includes(k))) {
            return category;
        }
    }
    return null;
};

const parseSmartMessage = (text) => {
    const normalized = normalizeText(text);

    // 1. Detectar Tipo (Gasto/Ingreso)
    let type = 'expense'; // Default
    if (INCOME_TRIGGERS.some(trigger => normalized.includes(trigger))) {
        type = 'income';
    }

    // 2. Detectar Monto (Números enteros o decimales)
    const amountMatch = text.match(/(')?(\d+(\.\d{1,2})?)(')?/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

    // 3. Detectar Fecha (Ayer/Hoy/Anteayer)
    // Usamos la hora de Perú para evitar desfases con el servidor (ej. Render en UTC)
    const nowInPeru = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }));
    let date = new Date(nowInPeru);

    if (normalized.includes('ayer') && !normalized.includes('anteayer')) {
        date.setDate(date.getDate() - 1);
    } else if (normalized.includes('anteayer') || normalized.includes('antier')) {
        date.setDate(date.getDate() - 2);
    }

    // Formato YYYY-MM-DD local a la fecha calculada
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // 4. Detectar Categoría
    let category = detectCategory(text);
    if (!category) category = type === 'expense' ? 'Varios' : 'Otros';

    // 5. Limpiar Descripción
    let description = text;
    if (amountMatch) {
        description = description.replace(amountMatch[0], '').trim();
    }

    const stopWords = [...INCOME_TRIGGERS, 'gasto', 'gasté', 'gaste', 'soles', 'ayer', 'hoy', 'anteayer', 'antier', 'nuevo'];
    const words = description.split(/\s+/);
    const cleanWords = words.filter(w => {
        const norm = normalizeText(w);
        return !stopWords.some(sw => norm === sw);
    });

    description = cleanWords.join(' ');

    if (!description) description = category;

    description = description.charAt(0).toUpperCase() + description.slice(1);

    return { type, amount, category, description, date: dateStr };
};

const parseReminder = (text) => {
    const normalized = normalizeText(text);
    const now = new Date();
    let scheduledTime = null;

    // 1. Detección "En X minutos/horas"
    // Regex flexible para: en 5 min, en 10 minutos, en 1 hora
    const relativeMatch = text.match(/en\s+(\d+)\s*(min|hora|hr)/i);

    if (relativeMatch) {
        const val = parseInt(relativeMatch[1]);
        const unit = relativeMatch[2].toLowerCase();

        if (unit.startsWith('min')) {
            scheduledTime = new Date(now.getTime() + val * 60000);
        } else if (unit.startsWith('hora') || unit.startsWith('hr')) {
            scheduledTime = new Date(now.getTime() + val * 3600000);
        }
    }

    // 2. Detección "A las HH:mm"
    if (!scheduledTime) {
        // Regex para: a las 10, a las 10:30, a las 5pm
        const timeMatch = text.match(/a las\s+(\d{1,2})(:(\d{2}))?\s*(am|pm)?/i);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
            const period = timeMatch[4] ? timeMatch[4].toLowerCase() : null;

            if (period === 'pm' && hours < 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;

            scheduledTime = new Date();
            scheduledTime.setHours(hours, minutes, 0, 0);

            // Si la hora ya pasó hoy en más de 1 minuto, se programa para mañana
            // (Damos 1 min de margen por si el usuario es "exacto")
            if (scheduledTime.getTime() <= now.getTime()) {
                scheduledTime.setDate(scheduledTime.getDate() + 1);
            }
        }
    }

    // 3. Descripción del recordatorio
    // Quitamos los triggers y las expresiones de tiempo para dejar solo el mensaje
    let description = text;

    // Quitar triggers
    REMINDER_TRIGGERS.forEach(trigger => {
        const regex = new RegExp(trigger, 'gi');
        description = description.replace(regex, '');
    });

    // Quitar expresiones de tiempo
    description = description
        .replace(/en\s+(\d+)\s*(min|minutos|hora|horas|hr|hrs)/gi, '')
        .replace(/a las\s+(\d{1,2})(:(\d{2}))?\s*(am|pm)?/gi, '')
        .replace(/programame/gi, '')
        .replace(/para/gi, '')
        .replace(/programar/gi, '')
        .trim();

    // Si queda vacío, poner default
    if (!description) description = "🔔 Recordatorio personal";

    // Capitalizar
    description = description.charAt(0).toUpperCase() + description.slice(1);

    return { scheduledTime, description };
};

// --- INITIALIZATION ---

export const initializeBot = () => {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
        return;
    }

    if (bot) return;

    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    console.log('Telegram bot initialized 🤖');

    // Manejar Mensajes
    bot.on('message', async (msg) => {
        try {
            await handleMessage(msg);
        } catch (error) {
            console.error('Error handling message:', error);
            bot.sendMessage(msg.chat.id, '❌ Ups, algo salió mal.');
        }
    });

    // Manejar Callbacks
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data;

        try {
            const [action, id] = data.split(':');
            const user = await User.findOne({ telegramChatId: String(chatId) });
            if (!user) return;

            if (action === 'EDIT_MENU') {
                await bot.editMessageText(`✏️ <b>¿Qué deseas modificar?</b>`, {
                    chat_id: chatId, message_id: msg.message_id, parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '💰 Monto', callback_data: `EDIT_AMOUNT:${id}` }, { text: '🏷️ Categoría', callback_data: `EDIT_CAT:${id}` }],
                            [{ text: '📅 Fecha', callback_data: `EDIT_DATE:${id}` }, { text: '📝 Descripción', callback_data: `EDIT_DESC:${id}` }],
                            [{ text: '🔙 Cancelar', callback_data: 'CANCEL_EDIT' }]
                        ]
                    }
                });
            } else if (action === 'CANCEL_EDIT') {
                await bot.editMessageText('✅ Edición cancelada.', { chat_id: chatId, message_id: msg.message_id });
                delete userStates[chatId];
            } else if (['EDIT_AMOUNT', 'EDIT_CAT', 'EDIT_DESC', 'EDIT_DATE'].includes(action)) {
                let prompt = '';
                if (action === 'EDIT_AMOUNT') prompt = '🔢 Nuevo monto:';
                if (action === 'EDIT_CAT') prompt = '🏷️ Nueva categoría:';
                if (action === 'EDIT_DESC') prompt = '📝 Nueva descripción:';
                if (action === 'EDIT_DATE') prompt = '📅 Nueva fecha (YYYY-MM-DD) o "hoy"/"ayer":';

                userStates[chatId] = { action: action.replace('EDIT_', 'WAITING_'), txId: id };
                await bot.sendMessage(chatId, prompt);
            }

            bot.answerCallbackQuery(callbackQuery.id);
        } catch (error) {
            console.error(error);
        }
    });

    bot.on('polling_error', (error) => console.error('Polling error:', error));

    // --- CRON JOB PARA RECORDATORIOS (Check every minute) ---
    console.log('🕒 Iniciando servicio de recordatorios...');
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            // Buscar recordatorios pendientes cuya fecha ya pasó (o es ahora)
            const pendingReminders = await OneTimeReminder.find({
                scheduledAt: { $lte: now },
                isSent: false
            });

            for (const reminder of pendingReminders) {
                try {
                    await bot.sendMessage(reminder.chatId, `🔔 <b>RECORDATORIO</b>\n\n${reminder.description}`, { parse_mode: 'HTML' });

                    // Marcar como enviado
                    reminder.isSent = true;
                    await reminder.save();

                } catch (err) {
                    console.error('Error enviando recordatorio:', err);
                }
            }
        } catch (err) {
            console.error('Error en cron de recordatorios:', err);
        }
    });
};

// --- HANDLERS ---

const handleMessage = async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    if (!text) return;

    const user = await User.findOne({ telegramChatId: String(chatId) });

    if (text === '/start') {
        if (!user) {
            return bot.sendMessage(chatId, `👋 <b>¡Hola!</b>\nPara vincular tu cuenta, ingresa este ID en tu web: <code>${chatId}</code>`, { parse_mode: 'HTML' });
        }
        return sendMenu(chatId, user.name);
    }

    if (!user) return bot.sendMessage(chatId, `⛔ Cuenta no vinculada. ID: <code>${chatId}</code>`, { parse_mode: 'HTML' });

    if (userStates[chatId]) {
        await handleConversationState(chatId, text, user);
        return;
    }

    const lowerText = text.toLowerCase();

    // 1. Menú
    if (['/menu', 'menu', 'ayuda'].includes(lowerText)) return sendMenu(chatId, user.name);

    // 2. Editar
    if (lowerText === '/editar' || lowerText.includes('/modificar')) return sendRecentTransactionsForEdit(chatId, user);

    // 3. Deshacer
    if (lowerText === 'deshacer') return handleUndo(user, chatId);


    // 4. RECORDATORIOS (Nueva lógica) - Normalizamos texto y usamos includes
    const normalized = normalizeText(text);
    // Expandimos triggers para cubrir 'hazme acuerdo', 'recuerdame' (sin tilde ya normalizado), etc.
    if (REMINDER_TRIGGERS.some(t => normalized.includes(t)) || normalized.includes('hazme acuerdo')) {
        await processReminderRequest(text, user, chatId);
        return;
    }

    // 5. Transacciones Inteligentes
    if (/\d/.test(text)) {
        await processSmartTransaction(text, user, chatId);
    } else {
        await bot.sendMessage(chatId, '🤔 No entendí. Intenta: "Taxi 15" o "Alerta en 10 min".', { parse_mode: 'HTML' });
    }
};

const sendMenu = async (chatId, userName) => {
    const menu = `
🤖 <b>PANEL DE CONTROL</b> 📊
Hola <b>${userName}</b>!

💸 <b>FINANZAS</b>
• <i>"Taxi 15"</i> → Gasto
• <i>"Gane 50"</i> → Ingreso

🔔 <b>RECORDATORIOS</b> (¡Nuevo!)
• <i>"Alerta en 10 min sacar basura"</i>
• <i>"Recordatorio a las 6 pm reunión"</i>
• <i>"Hazme acuerdo en 1 hora llamar"</i>

✏️ <b>HERRAMIENTAS</b>
• <b>/editar</b> - Corregir errores
• <b>Deshacer</b> - Borrar último
`;
    await bot.sendMessage(chatId, menu, { parse_mode: 'HTML' });
};

const processReminderRequest = async (text, user, chatId) => {
    const { scheduledTime, description } = parseReminder(text);

    if (!scheduledTime) {
        return bot.sendMessage(chatId, '⚠️ Entendí que quieres una alerta, pero no detecté la hora.\nPrueba: <i>"en 5 min"</i> o <i>"a las 4 pm"</i>.', { parse_mode: 'HTML' });
    }

    try {
        await OneTimeReminder.create({
            user: user._id,
            chatId,
            description,
            scheduledAt: scheduledTime
        });

        // FIX: Mostrar hora en zona horaria de Perú (America/Lima)
        const timeParams = { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima' };
        const dateParams = { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'America/Lima' };

        const timeStr = scheduledTime.toLocaleTimeString('es-PE', timeParams);
        const dateStr = scheduledTime.toLocaleDateString('es-PE', dateParams);

        await bot.sendMessage(chatId, `✅ <b>Recordatorio Programado</b>\n📅 Para: ${dateStr} a las ${timeStr}\n📝 "${description}"`, { parse_mode: 'HTML' });

    } catch (error) {
        console.error(error);
        await bot.sendMessage(chatId, '❌ Error al programar recordatorio.');
    }
};

const processSmartTransaction = async (text, user, chatId) => {
    const { type, amount, category, description, date } = parseSmartMessage(text);

    if (!amount) {
        return bot.sendMessage(chatId, '⚠️ Falta el monto. Ej: "Taxi 15"', { parse_mode: 'HTML' });
    }

    try {
        if (type === 'expense') {
            await Expense.create({ user: user._id, description, amount, category, date });
            await bot.sendMessage(chatId, `✅ <b>Gasto Registrado</b> (${date})\n\n💸 <b>-${amount.toFixed(2)}</b> (${category})\n📝 ${description}`, { parse_mode: 'HTML' });
        } else {
            await Income.create({ user: user._id, source: description, amount, category, date });
            await bot.sendMessage(chatId, `✅ <b>Ingreso Registrado</b> (${date})\n\n💰 <b>+${amount.toFixed(2)}</b> (${category})\n📝 ${description}`, { parse_mode: 'HTML' });
        }
    } catch (error) {
        console.error(error);
        await bot.sendMessage(chatId, '❌ Error guardando.');
    }
};

const sendRecentTransactionsForEdit = async (chatId, user) => {
    const expenses = await Expense.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean();
    const incomes = await Income.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean();

    const all = [
        ...expenses.map(e => ({ ...e, type: 'Gasto', icon: '💸' })),
        ...incomes.map(i => ({ ...i, type: 'Ingreso', icon: '💰' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    if (all.length === 0) return bot.sendMessage(chatId, '📭 No hay transacciones para editar.');

    const keyboard = all.map(tx => ([{
        text: `${tx.icon} S/.${tx.amount} - ${tx.description || tx.source} (${new Date(tx.createdAt).toLocaleDateString()})`,
        callback_data: `EDIT_MENU:${tx._id}`
    }]));
    keyboard.push([{ text: '❌ Cancelar', callback_data: 'CANCEL_EDIT' }]);

    await bot.sendMessage(chatId, '📝 <b>Selecciona para editar:</b>', { reply_markup: { inline_keyboard: keyboard }, parse_mode: 'HTML' });
};

const handleConversationState = async (chatId, text, user) => {
    const state = userStates[chatId];
    try {
        let doc = await Expense.findById(state.txId) || await Income.findById(state.txId);
        if (!doc) { delete userStates[chatId]; return bot.sendMessage(chatId, '❌ Transacción no encontrada.'); }

        const isIncome = doc.source !== undefined;

        if (state.action === 'WAITING_AMOUNT') {
            const val = parseFloat(text);
            if (val > 0) { doc.amount = val; await doc.save(); await bot.sendMessage(chatId, '✅ Monto actualizado.'); }
        } else if (state.action === 'WAITING_CAT') {
            doc.category = text; await doc.save(); await bot.sendMessage(chatId, '✅ Categoría actualizada.');
        } else if (state.action === 'WAITING_DESC') {
            if (isIncome) doc.source = text; else doc.description = text;
            await doc.save(); await bot.sendMessage(chatId, '✅ Descripción actualizada.');
        } else if (state.action === 'WAITING_DATE') {
            let newDate = text;
            if (text.toLowerCase() === 'hoy') newDate = new Date().toISOString().split('T')[0];
            else if (text.toLowerCase() === 'ayer') { const d = new Date(); d.setDate(d.getDate() - 1); newDate = d.toISOString().split('T')[0]; }
            else if (text.toLowerCase() === 'anteayer') { const d = new Date(); d.setDate(d.getDate() - 2); newDate = d.toISOString().split('T')[0]; }

            if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return bot.sendMessage(chatId, '⚠️ Formato inválido. Usa YYYY-MM-DD o escribe "hoy"/"ayer".');

            doc.date = newDate; await doc.save(); await bot.sendMessage(chatId, '✅ Fecha actualizada.');
        }
    } catch (e) { console.error(e); }
    delete userStates[chatId];
};

const handleUndo = async (user, chatId) => {
    const lastExpense = await Expense.findOne({ user: user._id }).sort({ createdAt: -1 });
    const lastIncome = await Income.findOne({ user: user._id }).sort({ createdAt: -1 });

    let target = (!lastExpense && !lastIncome) ? null :
        (!lastIncome) ? lastExpense :
            (!lastExpense) ? lastIncome :
                (lastExpense.createdAt > lastIncome.createdAt) ? lastExpense : lastIncome;

    if (target) {
        const amount = target.amount;
        const desc = target.description || target.source;
        if (target.source) await Income.findByIdAndDelete(target._id); else await Expense.findByIdAndDelete(target._id);
        await bot.sendMessage(chatId, `🗑️ Último registro eliminado.\n❌ S/. ${amount} - ${desc}`, { parse_mode: 'HTML' });
    } else {
        await bot.sendMessage(chatId, '📭 Nada que deshacer.');
    }
};

export default bot;
