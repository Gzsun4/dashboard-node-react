import TelegramBot from 'node-telegram-bot-api';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Goal from '../models/Goal.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

let bot;
const userStates = {}; // Almacena el estado de la conversación { chatId: { action: 'EDIT_AMOUNT', data: txId } }

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
    // Usamos triggers ya normalizados (sin tildes)
    if (INCOME_TRIGGERS.some(trigger => normalized.includes(trigger))) {
        type = 'income';
    }

    // 2. Detectar Monto (Números enteros o decimales)
    const amountMatch = text.match(/(')?(\d+(\.\d{1,2})?)(')?/); // Mejora leve en regex
    const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

    // 3. Detectar Fecha (Ayer/Hoy/Anteayer)
    let date = new Date();

    // Ajuste de fecha relativa
    if (normalized.includes('ayer') && !normalized.includes('anteayer')) {
        date.setDate(date.getDate() - 1);
    } else if (normalized.includes('anteayer') || normalized.includes('antier')) {
        date.setDate(date.getDate() - 2);
    }
    const dateStr = date.toISOString().split('T')[0];

    // 4. Detectar Categoría
    let category = detectCategory(text);
    if (!category) category = type === 'expense' ? 'Varios' : 'Otros';

    // 5. Limpiar Descripción
    let description = text;
    if (amountMatch) {
        description = description.replace(amountMatch[0], '').trim();
    }

    // Quitar palabras reservadas comunes para limpiar la descripcion
    const stopWords = [...INCOME_TRIGGERS, 'gasto', 'gasté', 'gaste', 'soles', 'ayer', 'hoy', 'anteayer', 'antier', 'nuevo'];

    const words = description.split(/\s+/);
    const cleanWords = words.filter(w => {
        const norm = normalizeText(w);
        return !stopWords.some(sw => norm === sw);
    });

    description = cleanWords.join(' ');

    if (!description) description = category;

    // Capitalizar primera letra descripción
    description = description.charAt(0).toUpperCase() + description.slice(1);

    return { type, amount, category, description, date: dateStr };
};

// --- INITIALIZATION ---

export const initializeBot = () => {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN is not set. Bot will not start.');
        return;
    }

    // Fix: Cancel dragging polling to avoid conflict if called multiple times (though standard usage is once)
    if (bot) return;

    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    console.log('Telegram bot initialized 🤖');

    // Manejar Mensajes de Texto
    bot.on('message', async (msg) => {
        try {
            await handleMessage(msg);
        } catch (error) {
            console.error('Error handling message:', error);
            bot.sendMessage(msg.chat.id, '❌ Ups, algo salió mal. Intenta de nuevo.');
        }
    });

    // Manejar Callbacks (Clics en botones)
    bot.on('callback_query', async (callbackQuery) => {
        const msg = callbackQuery.message;
        const chatId = msg.chat.id;
        const data = callbackQuery.data; // formato: 'action:id'

        try {
            const [action, id] = data.split(':');

            // Autenticar usuario (simple check)
            const user = await User.findOne({ telegramChatId: String(chatId) });
            if (!user) return;

            if (action === 'EDIT_MENU') {
                // Mostrar opciones de qué editar
                await bot.editMessageText(`✏️ <b>¿Qué deseas modificar?</b>`, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '💰 Monto', callback_data: `EDIT_AMOUNT:${id}` }, { text: '🏷️ Categoría', callback_data: `EDIT_CAT:${id}` }],
                            [{ text: '📅 Fecha', callback_data: `EDIT_DATE:${id}` }, { text: '📝 Descripción', callback_data: `EDIT_DESC:${id}` }],
                            [{ text: '🔙 Cancelar', callback_data: 'CANCEL_EDIT' }]
                        ]
                    }
                });
            } else if (action === 'EDIT_AMOUNT') {
                userStates[chatId] = { action: 'WAITING_AMOUNT', txId: id };
                await bot.sendMessage(chatId, '🔢 Ingresa el <b>nuevo monto</b> (ej: 50.00):', { parse_mode: 'HTML' });

            } else if (action === 'EDIT_CAT') {
                userStates[chatId] = { action: 'WAITING_CAT', txId: id };
                await bot.sendMessage(chatId, '🏷️ Ingresa la <b>nueva categoría</b> (ej: Taxi, Comida):', { parse_mode: 'HTML' });

            } else if (action === 'EDIT_DESC') {
                userStates[chatId] = { action: 'WAITING_DESC', txId: id };
                await bot.sendMessage(chatId, '📝 Ingresa la <b>nueva descripción</b>:', { parse_mode: 'HTML' });

            } else if (action === 'EDIT_DATE') {
                userStates[chatId] = { action: 'WAITING_DATE', txId: id };
                await bot.sendMessage(chatId, '📅 Ingresa la <b>nueva fecha</b> (YYYY-MM-DD) o escribe "Hoy"/"Ayer":', { parse_mode: 'HTML' });

            } else if (action === 'CANCEL_EDIT') {
                await bot.editMessageText('✅ Edición cancelada.', {
                    chat_id: chatId,
                    message_id: msg.message_id
                });
                delete userStates[chatId];
            }

            // Responder al callback para quitar el relojito de carga
            bot.answerCallbackQuery(callbackQuery.id);

        } catch (error) {
            console.error(error);
        }
    });

    bot.on('polling_error', (error) => console.error('Polling error:', error));
};

// --- HANDLERS ---

const handleMessage = async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    if (!text) return;

    // 1. Auth Check
    const user = await User.findOne({ telegramChatId: String(chatId) });

    // Comando START (sin auth)
    if (text === '/start') {
        if (!user) {
            return bot.sendMessage(chatId, `👋 <b>¡Hola! Soy tu Asistente Financiero</b> 🤖\n\n⛔ <b>Aún no estás vinculado.</b>\n\n1. Ve a tu Dashboard Web\n2. Ve a Configuración/Recordatorios\n3. Ingresa este ID: <code>${chatId}</code>`, { parse_mode: 'HTML' });
        }
        return sendMenu(chatId, user.name);
    }

    if (!user) {
        return bot.sendMessage(chatId, `⛔ <b>Cuenta no vinculada.</b>\nID de Chat: <code>${chatId}</code>`, { parse_mode: 'HTML' });
    }

    // 2. Estado de Conversación (Flujos de Edición)
    if (userStates[chatId]) {
        await handleConversationState(chatId, text, user);
        return;
    }

    // 3. Comandos Directos
    const lowerText = text.toLowerCase();

    if (lowerText === '/menu' || lowerText === 'menu' || lowerText === 'ayuda') {
        return sendMenu(chatId, user.name);
    }

    if (lowerText === '/editar' || lowerText.includes('editar') || lowerText.includes('modificar')) {
        return sendRecentTransactionsForEdit(chatId, user);
    }

    if (lowerText === 'deshacer') {
        return handleUndo(user, chatId);
    }

    // 4. Procesamiento Inteligente de Transacciones
    // Si tiene números, asumimos que es una transacción
    if (/\d/.test(text)) {
        await processSmartTransaction(text, user, chatId);
    } else {
        await bot.sendMessage(chatId, '🤔 No entendí. Si quieres registrar un gasto, incluye el monto. Ej: "Taxi 15". Escribe /menu para ver opciones.');
    }
};

const sendMenu = async (chatId, userName) => {
    const menu = `
🤖 <b>PANEL DE CONTROL</b> 📊
Hola <b>${userName}</b>, aquí tienes lo que puedo hacer:

💸 <b>REGISTRAR TRANSACCIONES</b>
Simplemente escribe lo que hiciste, ¡yo entiendo!
• <i>"Gasto 20 menu"</i> → Gasto en Alimentación
• <i>"Pasaje 5 soles"</i> → Gasto en Transporte
• <i>"Cobre 1500 sueldo"</i> → Ingreso
• <i>"30 farmacia"</i> → Gasto en Salud

✏️ <b>EDICIÓN</b>
• Escribe <b>/editar</b> o "Modificar" para cambiar tus últimos movimientos.
• Escribe <b>Deshacer</b> para borrar el último registro al instante.

📈 <b>CONSULTAS</b> (Pronto)
• Puedes ver tu resumen en el Dashboard Web.

💡 <b>Tip:</b> No necesitas ser ordenado. <i>"Ayer taxi 15"</i> funciona igual de bien.
`;
    await bot.sendMessage(chatId, menu, { parse_mode: 'HTML' });
};

const processSmartTransaction = async (text, user, chatId) => {
    const { type, amount, category, description, date } = parseSmartMessage(text); // Ahora recibe fecha

    if (!amount) {
        return bot.sendMessage(chatId, '⚠️ Detecté una intención pero <b>me falta el monto</b>. Ej: "Taxi 15"', { parse_mode: 'HTML' });
    }

    // La fecha ya viene calculada desde el parser (hoy, ayer, etc.)

    try {
        if (type === 'expense') {
            await Expense.create({
                user: user._id,
                description,
                amount,
                category,
                date: date // Usar la fecha parseada
            });
            await bot.sendMessage(chatId, `✅ <b>Gasto Registrado</b> (${date})\n\n💸 <b>-${amount.toFixed(2)}</b> (${category})\n📝 ${description}`, { parse_mode: 'HTML' });
        } else {
            await Income.create({
                user: user._id,
                source: description,
                amount,
                category,
                date: date // Usar la fecha parseada
            });
            await bot.sendMessage(chatId, `✅ <b>Ingreso Registrado</b> (${date})\n\n💰 <b>+${amount.toFixed(2)}</b> (${category})\n📝 ${description}`, { parse_mode: 'HTML' });
        }
    } catch (error) {
        console.error(error);
        await bot.sendMessage(chatId, '❌ Error guardando en base de datos.');
    }
};

const sendRecentTransactionsForEdit = async (chatId, user) => {
    // Buscar ultimos 5 gastos e ingresos mezclados
    const expenses = await Expense.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean();
    const incomes = await Income.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean();

    // Combinar, ordenar y tomar 5
    const all = [
        ...expenses.map(e => ({ ...e, type: 'Gasto', icon: '💸' })),
        ...incomes.map(i => ({ ...i, type: 'Ingreso', icon: '💰' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    if (all.length === 0) {
        return bot.sendMessage(chatId, '📭 No tienes transacciones recientes para editar.');
    }

    const keyboard = all.map(tx => ([{
        text: `${tx.icon} S/.${tx.amount} - ${tx.description || tx.source} (${new Date(tx.createdAt).toLocaleDateString()})`,
        callback_data: `EDIT_MENU:${tx._id}`
    }]));

    keyboard.push([{ text: '❌ Cancelar', callback_data: 'CANCEL_EDIT' }]);

    await bot.sendMessage(chatId, '📝 <b>Selecciona qué transacción editar:</b>', {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
    });
};

const handleConversationState = async (chatId, text, user) => {
    const state = userStates[chatId];

    try {
        // Encontrar documento
        let doc = await Expense.findById(state.txId);
        let modelName = 'Gasto';
        let isExpense = true;

        if (!doc) {
            doc = await Income.findById(state.txId);
            modelName = 'Ingreso';
            isExpense = false;
        }

        if (!doc) {
            await bot.sendMessage(chatId, '❌ No encontré la transacción original.');
            delete userStates[chatId];
            return;
        }

        // --- EDICIÓN DE MONTO ---
        if (state.action === 'WAITING_AMOUNT') {
            const newAmount = parseFloat(text);
            if (isNaN(newAmount) || newAmount <= 0) {
                return bot.sendMessage(chatId, '⚠️ Por favor ingresa un número válido.');
            }
            doc.amount = newAmount;
            await doc.save();
            await bot.sendMessage(chatId, `✅ <b>Monto actualizado</b> a S/. ${newAmount.toFixed(2)}`, { parse_mode: 'HTML' });
        }

        // --- EDICIÓN DE CATEGORÍA ---
        else if (state.action === 'WAITING_CAT') {
            // Intentar detectar categoría inteligente
            let newCat = detectCategory(text);
            // Si no detecta, usa el texto exacto (capitalizado)
            if (!newCat) newCat = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

            doc.category = newCat;
            await doc.save();
            await bot.sendMessage(chatId, `✅ <b>Categoría actualizada</b> a: ${newCat}`, { parse_mode: 'HTML' });
        }

        // --- EDICIÓN DE DESCRIPCIÓN ---
        else if (state.action === 'WAITING_DESC') {
            if (isExpense) doc.description = text;
            else doc.source = text;

            await doc.save();
            await bot.sendMessage(chatId, `✅ <b>Descripción actualizada</b> a: "${text}"`, { parse_mode: 'HTML' });
        }

        // --- EDICIÓN DE FECHA ---
        else if (state.action === 'WAITING_DATE') {
            let newDate = text;
            const lower = text.toLowerCase();

            const today = new Date();

            if (lower === 'hoy') {
                newDate = today.toISOString().split('T')[0];
            } else if (lower === 'ayer') {
                today.setDate(today.getDate() - 1);
                newDate = today.toISOString().split('T')[0];
            } else if (lower === 'anteayer') {
                today.setDate(today.getDate() - 2);
                newDate = today.toISOString().split('T')[0];
            }

            // Validar formato YYYY-MM-DD
            if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                return bot.sendMessage(chatId, '⚠️ Formato inválido. Usa YYYY-MM-DD o escribe "hoy"/"ayer".');
            }

            doc.date = newDate;
            await doc.save();
            await bot.sendMessage(chatId, `✅ <b>Fecha actualizada</b> a: ${newDate}`, { parse_mode: 'HTML' });
        }

    } catch (err) {
        console.error(err);
        await bot.sendMessage(chatId, '❌ Error actualizando la transacción.');
    }

    // Limpiar estado
    delete userStates[chatId];
};

const handleUndo = async (user, chatId) => {
    try {
        const lastExpense = await Expense.findOne({ user: user._id }).sort({ createdAt: -1 });
        const lastIncome = await Income.findOne({ user: user._id }).sort({ createdAt: -1 });

        if (!lastExpense && !lastIncome) {
            return bot.sendMessage(chatId, '📭 No hay transacciones recientes para deshacer.');
        }

        let target = null;
        let Model = null;
        let type = '';

        if (lastExpense && lastIncome) {
            if (lastExpense.createdAt > lastIncome.createdAt) {
                target = lastExpense;
                Model = Expense;
                type = 'Gasto';
            } else {
                target = lastIncome;
                Model = Income;
                type = 'Ingreso';
            }
        } else if (lastExpense) {
            target = lastExpense;
            Model = Expense;
            type = 'Gasto';
        } else {
            target = lastIncome;
            Model = Income;
            type = 'Ingreso';
        }

        const amount = target.amount;
        const desc = target.description || target.source;

        await Model.findByIdAndDelete(target._id);

        await bot.sendMessage(chatId, `🗑️ <b>Deshecho:</b> Último ${type} eliminado.\n❌ S/. ${amount} - ${desc}`, { parse_mode: 'HTML' });

    } catch (error) {
        console.error(error);
        await bot.sendMessage(chatId, '❌ Error al deshacer.');
    }
};

export default bot;
