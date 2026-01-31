import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import User from '../models/User.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Goal from '../models/Goal.js';
import OneTimeReminder from '../models/OneTimeReminder.js';

let bot;
let model;
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

const INCOME_TRIGGERS = ['ingreso', 'gane', 'recibi', 'cobre', 'sueldo', 'depositaren', 'abono', 'pago', 'recibí', 'gané'];
const DEBT_TRIGGERS = ['debo', 'deuda', 'preste', 'prestamo', 'le debo', 'debo pagar', 'presté', 'préstamo', 'deber'];
const SAVINGS_TRIGGERS = ['ahorre', 'ahorro', 'guarde', 'ahorré', 'guardé', 'para mi meta', 'para mi ahorro'];
const REMINDER_TRIGGERS = ['alerta', 'recordatorio', 'avisame', 'acuerdame', 'recuerdame', 'alarma', 'programame', 'avisar', 'hazme acuerdo', 'hazme acordar', 'avísame', 'acuérdame', 'recuérdame', 'prográmame'];

// --- FUNCIONES DE AYUDA (NLP) ---

const getFinancialContext = async (userId) => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await Expense.find({ user: userId, date: { $gte: firstDay } });
    const incomes = await Income.find({ user: userId, date: { $gte: firstDay } });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const balance = totalIncome - totalExpense;

    // Top Categories
    const catMap = {};
    expenses.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const topCategories = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amount]) => `${cat}: S/.${amount.toFixed(2)}`)
        .join(', ');

    return `
    Resumen del Mes:
    - Ingresos: S/. ${totalIncome.toFixed(2)}
    - Gastos: S/. ${totalExpense.toFixed(2)}
    - Balance: S/. ${balance.toFixed(2)}
    - Top Gastos: ${topCategories || "Ninguno"}
    `;
};

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

    // 1. Detectar Tipo (Gasto/Ingreso/Deuda/Ahorro)
    let type = 'expense'; // Default
    let isAmbiguous = false;

    const hasIncomeTrigger = INCOME_TRIGGERS.some(trigger => normalized.includes(trigger));
    const hasDebtTrigger = DEBT_TRIGGERS.some(trigger => normalized.includes(trigger));
    const hasSavingsTrigger = SAVINGS_TRIGGERS.some(trigger => normalized.includes(trigger));

    if (hasIncomeTrigger) {
        type = 'income';
    } else if (hasDebtTrigger) {
        type = 'debt';
    } else if (hasSavingsTrigger) {
        type = 'goal';
    } else {
        // Si no tiene disparadores claros pero tiene monto y descripción, es ambiguo
        // Excepto si la descripción coincide con una categoría de gasto clara (ej. "Pizza 20")
        const category = detectCategory(text);
        if (!category) {
            isAmbiguous = true;
        }
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

    return { type, isAmbiguous, amount, category, description, date: dateStr };
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
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
        return;
    }

    if (bot) return;

    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🔑 Gemini API Key Status:", apiKey ? `Present (Starts with ${apiKey.substring(0, 4)}...)` : "MISSING");

    const genAI = new GoogleGenerativeAI(apiKey || '');
    model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "Eres un asistente financiero experto y amigable llamado 'FinanzasBot'. Ayudas a Jesús (un estudiante de economía en 8vo ciclo) a entender sus gastos y conceptos económicos. Tienes acceso a su resumen financiero del mes. Sé conciso, usa emojis y da consejos prácticos. Si te preguntan algo fuera de finanzas, responde brevemente que solo sabes de economía."
    });

    console.log('Telegram bot initialized 🤖');

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
            } else if (action === 'CONFIRM_AS') {
                const [_, type, idx] = data.split(':');
                const pending = userStates[chatId]?.pendingData;
                if (pending) {
                    pending.type = type.toLowerCase();
                    await processSmartTransaction(null, user, chatId, pending);
                }
            } else if (action === 'DEBT_REMIND') {
                const [_, days] = data.split(':');
                const debtName = userStates[chatId]?.lastDebtName;
                if (debtName) {
                    const scheduledTime = new Date();
                    scheduledTime.setDate(scheduledTime.getDate() + parseInt(days));
                    scheduledTime.setHours(10, 0, 0, 0); // Recordatorio a las 10 am

                    await OneTimeReminder.create({
                        user: user._id,
                        chatId,
                        description: `🔔 Pagar deuda: ${debtName}`,
                        scheduledAt: scheduledTime
                    });
                    await bot.editMessageText(`✅ Recordatorio programado para dentro de ${days} día(s).`, { chat_id: chatId, message_id: msg.message_id });
                }
                delete userStates[chatId];
            } else if (action === 'NO_REMIND') {
                await bot.editMessageText('👍 Entendido, sin recordatorios.', { chat_id: chatId, message_id: msg.message_id });
                delete userStates[chatId];
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

export const sendNotification = async (chatId, message) => {
    if (bot) {
        try {
            await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
            return true;
        } catch (error) {
            console.error('Error sending notification via bot:', error.message);
            return false;
        }
    } else {
        console.warn('Bot not initialized, skipping notification');
        return false;
    }
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
        const parsed = parseSmartMessage(text);
        if (parsed.isAmbiguous && parsed.amount) {
            userStates[chatId] = { pendingData: parsed };
            const keyboard = {
                inline_keyboard: [
                    [{ text: '💸 Gasto Normal', callback_data: `CONFIRM_AS:EXPENSE` }],
                    [{ text: '🚩 Deuda Pendiente', callback_data: `CONFIRM_AS:DEBT` }],
                    [{ text: '❌ Cancelar', callback_data: 'CANCEL_EDIT' }]
                ]
            };
            return bot.sendMessage(chatId, `❓ <b>¿Qué registramos, ${user.name.split(' ')[0]}?</b>\nDetecté <b>S/. ${parsed.amount.toFixed(2)}</b> para <i>"${parsed.description}"</i>.\n\n¿Es un gasto que ya pagaste o una deuda pendiente?`, { parse_mode: 'HTML', reply_markup: keyboard });
        }
        await processSmartTransaction(text, user, chatId, parsed);
    } else {
        // 6. IA / Fallback
        await processAIQuery(text, user, chatId);
    }
};

// Helper to delay (for exponential backoff)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const tryGenerateContent = async (prompt) => {
    // Try primary (2.0), then lite (2.0), then legacy standard (1.0 pro)
    // Removed 1.5-flash as it returned 404 for this key
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-pro"];
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    for (const modelName of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            try {
                // Exponential backoff: 4s, then 8s... (increased to avoid rapid 429s)
                if (attempts > 0) {
                    console.log(`⏳ Rate limit hit for ${modelName}. Retrying in ${4000 * attempts}ms...`);
                    await delay(4000 * attempts);
                }

                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: "Eres un asistente financiero experto y amigable llamado 'FinanzasBot'. Ayudas a Jesús (un estudiante de economía en 8vo ciclo) a entender sus gastos y conceptos económicos. Tienes acceso a su resumen financiero del mes. Sé conciso, usa emojis y da consejos prácticos. Si te preguntan algo fuera de finanzas, responde brevemente que solo sabes de economía."
                });

                const result = await model.generateContent(prompt);
                return result.response.text();

            } catch (error) {
                const msg = error.message || '';
                if (msg.includes("429") || msg.includes("503")) {
                    attempts++;
                    console.warn(`⚠️ Warning: ${modelName} hit ${msg.includes("429") ? "Rate Limit" : "Overload"}. Attempt ${attempts}/${maxAttempts}`);
                    if (attempts >= maxAttempts) break; // Move to next model
                } else {
                    // If it's not a rate limit (e.g., 404, Auth), fail this model immediately
                    console.warn(`❌ Error: ${modelName} failed with ${msg}. Skipping.`);
                    break;
                }
            }
        }
    }
    throw new Error("All models failed after retries.");
};

const processAIQuery = async (text, user, chatId) => {
    bot.sendChatAction(chatId, 'typing');
    try {
        const context = await getFinancialContext(user._id);
        const prompt = `
        Contexto Financiero de ${user.name}:
        ${context}

        Pregunta del usuario: "${text}"
        
        Responde como un asistente financiero personal.
        `;

        const response = await tryGenerateContent(prompt);
        await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });

    } catch (error) {
        console.error("Error Gemini Final:", error.message);
        // Fallback friendly message
        await bot.sendMessage(chatId, '⏳ Estoy procesando mucha información ahora mismo. Por favor, pregúntame de nuevo en 30 segundos.');
    }
};

const sendMenu = async (chatId, userName) => {
    const firstName = userName.split(' ')[0];
    const menu = `
🤖 <b>ASISTENTE PERSONAL</b>

Dime qué registramos hoy, <b>${firstName}</b>:

💸 <b>DINERO DEL DÍA</b>
• <i>"Almuerzo 15"</i> o <i>"Venta 30"</i>

📒 <b>AHORROS O DEUDAS</b>
• <i>"Ahorre 50 soles para viaje"</i>
• <i>"Debo 20 en la tienda"</i>
• <i>"Le preste 100 a Juan"</i>

⏰ <b>RECORDATORIOS</b>
• <i>"Avísame en 1 hora pagar luz"</i>
• <i>"Alerta a las 6 pm reunión"</i>

👇 <b>ACCIONES RÁPIDAS</b>
/balance  |  /editar  |  /deshacer
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

const processSmartTransaction = async (text, user, chatId, preParsed = null) => {
    const { type, amount, category, description, date } = preParsed || parseSmartMessage(text);

    if (!amount) {
        return bot.sendMessage(chatId, '⚠️ Falta el monto. Ej: "Taxi 15"', { parse_mode: 'HTML' });
    }

    try {
        if (type === 'expense') {
            await Expense.create({ user: user._id, description, amount, category, date });
            await bot.sendMessage(chatId, `✅ <b>Gasto Registrado</b>\n\n💸 <b>-S/. ${amount.toFixed(2)}</b>\n📝 ${description}\n📂 ${category}\n📅 ${date}`, { parse_mode: 'HTML' });
        } else if (type === 'income') {
            await Income.create({ user: user._id, source: description, amount, category, date });
            await bot.sendMessage(chatId, `✅ <b>Ingreso Registrado</b>\n\n💰 <b>+S/. ${amount.toFixed(2)}</b>\n📝 ${description}\n📂 ${category}\n📅 ${date}`, { parse_mode: 'HTML' });
        } else if (type === 'debt') {
            const Debt = (await import('../models/Debt.js')).default;
            await Debt.create({ user: user._id, name: description, target: amount, current: 0, date });

            userStates[chatId] = { lastDebtName: description };
            const keyboard = {
                inline_keyboard: [
                    [{ text: '⏰ Mañana', callback_data: 'DEBT_REMIND:1' }, { text: '⏰ En 3 días', callback_data: 'DEBT_REMIND:3' }],
                    [{ text: '⏰ En una semana', callback_data: 'DEBT_REMIND:7' }],
                    [{ text: '❌ No recordar', callback_data: 'NO_REMIND' }]
                ]
            };

            await bot.sendMessage(chatId, `🚩 <b>Nueva Deuda Detectada</b>\n\n👤 <b>${description}</b>\n💰 <b>Monto: S/. ${amount.toFixed(2)}</b>\n🏷 Estado: Pendiente\n\n💡 <i>Dime "Abonar a ${description} 10" cuando hagas un pago.</i>\n\n<b>¿Quieres que te lo recuerde?</b>`, { parse_mode: 'HTML', reply_markup: keyboard });
        } else if (type === 'goal') {
            const Goal = (await import('../models/Goal.js')).default;
            // Buscar meta que coincida con la descripción o usar 'Ahorro General'
            let goal = await Goal.findOne({ user: user._id, name: new RegExp(description, 'i') });
            if (!goal) goal = await Goal.findOne({ user: user._id }); // Usar la primera si no encuentra coincidencia

            if (goal) {
                goal.current += amount;
                goal.history.push({ amount, date, note: 'Desde Telegram' });
                await goal.save();
                await bot.sendMessage(chatId, `🎯 <b>¡Ahorro Registrado!</b>\n\n💰 <b>+S/. ${amount.toFixed(2)}</b> para <b>${goal.name}</b>\n\n📈 <i>Progreso: S/. ${goal.current} / S/. ${goal.target}</i>`, { parse_mode: 'HTML' });
            } else {
                await bot.sendMessage(chatId, `⚠️ No encontré una meta de ahorro llamada "${description}". Regístrala primero en la web.`, { parse_mode: 'HTML' });
            }
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
