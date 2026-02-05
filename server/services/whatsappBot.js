import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    downloadMediaMessage,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";

import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Debt from '../models/Debt.js';
import Goal from '../models/Goal.js';
import { getFinancialContext } from './financialService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sock;
let groq;

// Map categories and triggers (Shared with Telegram)
const CATEGORY_MAP = {
    'Alimentación': ['comida', 'almuerzo', 'cena', 'desayuno', 'snack', 'restaurante', 'mercado', 'supermercado', 'burger', 'pizza', 'pollo', 'bebida', 'menu', 'menú', 'fruta'],
    'Transporte': ['pasaje', 'bus', 'taxi', 'uber', 'tren', 'gasolina', 'combustible', 'peaje', 'combi', 'moto', 'colectivo', 'metro'],
    'Servicios': ['luz', 'agua', 'internet', 'celular', 'plan', 'gas', 'recarga', 'cable', 'servicio'],
    'Entretenimiento': ['cine', 'juego', 'salida', 'netflix', 'spotify', 'fiesta', 'entrada', 'concierto', 'steam', 'suscripción'],
    'Salud': ['farmacia', 'medico', 'consulta', 'pastillas', 'cita', 'doctor', 'medicina', 'dentista'],
    'Educación': ['curso', 'libro', 'clase', 'universidad', 'colegio', 'útiles', 'taller'],
    'Hogar': ['mueble', 'limpieza', 'casa', 'departamento', 'alquiler', 'reparación'],
    'Otros': ['regalo', 'otros', 'varios', 'compra', 'tienda'],
    'Sueldo': ['sueldo', 'pago', 'nómina', 'salario', 'quincena', 'mensualidad'],
    'Freelance': ['freelance', 'trabajito', 'cachuelo', 'proyecto', 'cliente'],
    'Negocio': ['venta', 'ganancia', 'negocio']
};

const INCOME_TRIGGERS = ['ingreso', 'gane', 'recibi', 'cobre', 'sueldo', 'depositaren', 'abono', 'pago', 'recibí', 'gané'];
const DEBT_TRIGGERS = ['debo', 'deuda', 'preste', 'prestamo', 'le debo', 'debo pagar', 'presté', 'préstamo', 'deber'];
const SAVINGS_TRIGGERS = ['ahorre', 'ahorro', 'guarde', 'ahorré', 'guardé', 'para mi meta', 'para mi ahorro'];

const normalizeText = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const detectCategory = (text) => {
    const normalized = normalizeText(text);
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => normalized.includes(k))) return category;
    }
    return null;
};

const parseSmartMessage = (text) => {
    const normalized = normalizeText(text);
    let type = 'expense';
    const words = normalized.split(/\s+/);

    const hasIncomeTrigger = INCOME_TRIGGERS.some(trigger => words.includes(normalizeText(trigger)));
    const hasDebtTrigger = DEBT_TRIGGERS.some(trigger => words.includes(normalizeText(trigger)));
    const hasSavingsTrigger = SAVINGS_TRIGGERS.some(trigger => words.includes(normalizeText(trigger)));

    if (hasIncomeTrigger) {
        type = 'income';
    } else if (hasDebtTrigger) {
        type = 'debt';
    } else if (hasSavingsTrigger) {
        type = 'goal';
    }

    const amountMatch = text.match(/(\d+(\.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

    let category = detectCategory(text);
    if (!category) category = type === 'expense' ? 'Varios' : 'Otros';

    let description = text;
    if (amountMatch) {
        description = description.replace(amountMatch[0], '').trim();
    }

    const stopWords = [...INCOME_TRIGGERS, ...DEBT_TRIGGERS, ...SAVINGS_TRIGGERS, 'gasto', 'gasté', 'gaste', 'soles', 'ayer', 'hoy', 'anteayer', 'antier', 'nuevo'];
    const descWords = description.split(/\s+/);
    const cleanWords = descWords.filter(w => {
        const norm = normalizeText(w);
        return !stopWords.some(sw => norm === sw);
    });

    description = cleanWords.join(' ');
    if (!description) description = category;
    description = description.charAt(0).toUpperCase() + description.slice(1);

    const dateObj = new Date();
    if (normalized.includes('ayer') && !normalized.includes('anteayer')) {
        dateObj.setDate(dateObj.getDate() - 1);
    } else if (normalized.includes('anteayer') || normalized.includes('antier')) {
        dateObj.setDate(dateObj.getDate() - 2);
    }

    const dateStr = dateObj.toLocaleDateString("en-CA", { timeZone: "America/Lima" });
    return { type, amount, category, description, date: dateStr };
};

export const initializeWhatsAppBot = async () => {
    console.log('🚀 Iniciando WhatsApp Bot (Lightweight via Baileys)...');

    const authPath = path.join(__dirname, '../../.baileys_auth');
    if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['GZSun Finanzas', 'MacOS', '3.0']
    });

    // Initialize Groq
    if (process.env.GROQ_API_KEY) {
        groq = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1"
        });
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('📲 ESCANEA ESTE CÓDIGO QR PARA CONECTAR WHATSAPP:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ WhatsApp: Conexión cerrada. Reconectando:', shouldReconnect);
            if (shouldReconnect) {
                initializeWhatsAppBot();
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp Bot: Conexión abierta con éxito!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const senderId = msg.key.remoteJid;
        if (senderId.endsWith('@g.us') || senderId === 'status@broadcast') return;

        try {
            let text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            const isAudio = msg.message.audioMessage;

            // Handle Audio/Voice Messages
            if (isAudio && groq) {
                console.log("🎙️ Recibí un audio de WhatsApp...");
                try {
                    const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage });
                    const tempFile = path.join(__dirname, `../../voice_wa_${Date.now()}.ogg`);
                    fs.writeFileSync(tempFile, buffer);

                    console.log("🎙️ Transcribiendo audio con Groq Whisper...");
                    const trans = await groq.audio.transcriptions.create({
                        file: fs.createReadStream(tempFile),
                        model: "whisper-large-v3",
                        language: "es",
                    });

                    text = trans.text;
                    fs.unlinkSync(tempFile);

                    await sock.sendMessage(senderId, { text: `🎤 _"${text}"_` }, { quoted: msg });
                } catch (err) {
                    console.error("Error processing audio:", err);
                    await sock.sendMessage(senderId, { text: "❌ No pude procesar tu mensaje de voz." });
                    return;
                }
            }

            if (!text) return;

            // Search user
            const user = await User.findOne({ whatsappId: senderId });

            if (text.toLowerCase() === '/start') {
                if (!user) {
                    return sock.sendMessage(senderId, { text: `👋 ¡Hola! Soy tu asistente de Finanzas.\n\nPara vincular tu cuenta, ingresa este ID en el panel web: ${senderId}` });
                }
                return sock.sendMessage(senderId, { text: `👋 ¡Hola de nuevo, ${user.name}! Estoy listo para tus gastos.` });
            }

            if (!user) {
                return sock.sendMessage(senderId, { text: `⛔ Cuenta no vinculada. Por favor, regístrate en la web y vincula tu WhatsApp usando este ID: ${senderId}` });
            }

            // Smart Transactions
            if (/\d/.test(text)) {
                const parsed = parseSmartMessage(text);
                if (parsed.amount) {
                    if (parsed.type === 'expense') {
                        await Expense.create({ user: user._id, amount: parsed.amount, category: parsed.category, description: parsed.description, date: parsed.date });
                        return sock.sendMessage(senderId, { text: `✅ *Gasto Registrado*\n💰 Monto: S/. ${parsed.amount.toFixed(2)}\n🏷️ Categoría: ${parsed.category}\n📝 Detalle: ${parsed.description}` });
                    } else if (parsed.type === 'income') {
                        await Income.create({ user: user._id, amount: parsed.amount, category: parsed.category, source: parsed.description, date: parsed.date });
                        return sock.sendMessage(senderId, { text: `✅ *Ingreso Registrado*\n💰 Monto: S/. ${parsed.amount.toFixed(2)}\n🏷️ Fuente: ${parsed.description}` });
                    } else if (parsed.type === 'debt') {
                        await Debt.create({ user: user._id, name: parsed.description, target: parsed.amount, current: 0, date: parsed.date });
                        return sock.sendMessage(senderId, { text: `🚩 *Deuda Registrada*\n👤 Detalle: ${parsed.description}\n💰 Monto: S/. ${parsed.amount.toFixed(2)}\n\n💡 _Dime "Abonar a ${parsed.description} 10" cuando hagas un pago._` });
                    } else if (parsed.type === 'goal') {
                        let goal = await Goal.findOne({ user: user._id, name: new RegExp(parsed.description, 'i') });
                        if (!goal) goal = await Goal.findOne({ user: user._id });
                        if (goal) {
                            goal.current += parsed.amount;
                            goal.history.push({ amount: parsed.amount, date: parsed.date, note: 'WhatsApp' });
                            await goal.save();
                            return sock.sendMessage(senderId, { text: `🎯 *Ahorro Registrado*\n💰 +S/. ${parsed.amount.toFixed(2)} para *${goal.name}*\n📈 Progreso: S/. ${goal.current} / S/. ${goal.target}` });
                        }
                    }
                }
            }

            // AI Fallback
            if (process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY) {
                const aiResponse = await processAIQuery(text, user);
                await sock.sendMessage(senderId, { text: aiResponse });
            }

        } catch (err) {
            console.error('Error handling message:', err);
        }
    });
};

export const sendWhatsAppMessage = async (to, message) => {
    if (!sock) return false;
    try {
        await sock.sendMessage(to, { text: message });
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
};

async function processAIQuery(text, user) {
    try {
        const context = await getFinancialContext(user._id);
        const prompt = `[DATOS FINANCIEROS REALES]:\n${context}\n\n[USUARIO]: ${user.name}\n[MENSAJE]: "${text}"\n\n[INSTRUCCIÓN]:\n1. Responde breve y amigable.\n2. Usa los DATOS REALES.\n3. Si no hay datos, sé honesto.`;

        if (groq) {
            const comp = await groq.chat.completions.create({ messages: [{ role: "user", content: prompt }], model: "llama-3.1-8b-instant" });
            return comp.choices[0].message.content;
        } else {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
    } catch (err) {
        return "⚠️ Tuve un problema procesando tu mensaje.";
    }
}
