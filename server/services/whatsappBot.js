import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Debt from '../models/Debt.js';
import Goal from '../models/Goal.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { getFinancialContext } from './financialService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let client;
let groq;

/**
 * Envía un mensaje de WhatsApp a un ID específico
 */
export const sendWhatsAppMessage = async (to, message) => {
    if (!client || !client.info) {
        console.warn('⚠️ No se puede enviar mensaje WA: Cliente no listo');
        return false;
    }
    try {
        await client.sendMessage(to, message);
        return true;
    } catch (error) {
        console.error('Error enviando mensaje WA:', error);
        return false;
    }
};

// Reutilizamos los triggers y el mapa de categorías del bot de Telegram
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

    console.log(`🔍 WA Parser: [${text}] -> Type: ${type} (I:${hasIncomeTrigger}, D:${hasDebtTrigger}, S:${hasSavingsTrigger})`);

    const amountMatch = text.match(/(\d+(\.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

    let category = detectCategory(text);
    if (!category) category = type === 'expense' ? 'Varios' : 'Otros';

    // 4. Limpiar Descripción
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

    // 3. Detectar Fecha (Ayer/Hoy/Anteayer)
    const dateObj = new Date();
    if (normalized.includes('ayer') && !normalized.includes('anteayer')) {
        dateObj.setDate(dateObj.getDate() - 1);
    } else if (normalized.includes('anteayer') || normalized.includes('antier')) {
        dateObj.setDate(dateObj.getDate() - 2);
    }

    const dateStr = dateObj.toLocaleDateString("en-CA", { timeZone: "America/Lima" });
    console.log(`📅 WA Date Generated: ${dateStr} (UTC: ${dateObj.toISOString()})`);

    return { type, amount, category, description, date: dateStr };
};

export const initializeWhatsAppBot = () => {
    console.log('🚀 Iniciando WhatsApp Bot...');

    client = new Client({
        authStrategy: new LocalAuth({
            dataPath: path.join(__dirname, '../../.wwebjs_auth')
        }),
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        },
        puppeteer: {
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-software-rasterizer'
            ]
        }
    });

    // Inicializar Groq
    if (process.env.GROQ_API_KEY) {
        groq = new OpenAI({
            apiKey: process.env.GROQ_API_KEY,
            baseURL: "https://api.groq.com/openai/v1"
        });
    }

    client.on('qr', (qr) => {
        console.log('📲 ESCANEA ESTE CÓDIGO QR PARA CONECTAR WHATSAPP:');
        qrcode.generate(qr, { small: true });
    });

    client.on('authenticated', () => {
        console.log('🔓 WhatsApp: Autenticación exitosa!');
    });

    client.on('auth_failure', msg => {
        console.error('❌ WhatsApp: Fallo en la autenticación', msg);
    });

    client.on('loading_screen', (percent, message) => {
        console.log('⏳ WhatsApp: Cargando...', percent, '% -', message);
    });

    client.on('ready', () => {
        console.log('✅ WhatsApp Bot está listo!');
    });

    client.on('message', async (msg) => {
        try {
            const senderId = msg.from; // Formato: 51987654321@c.us

            // IGNORAR ESTADOS / HISTORIAS y GRUPOS
            if (senderId === 'status@broadcast' || senderId.endsWith('@g.us')) return;

            let text = msg.body;

            // MANEJO DE AUDIOS
            if (msg.hasMedia && (msg.type === 'audio' || msg.type === 'ptt')) {
                console.log("🎙️ Recibí un audio de WhatsApp...");
                try {
                    const media = await msg.downloadMedia();
                    if (!media) throw new Error("No se pudo descargar el medio");

                    const tempFile = path.join(__dirname, `../../voice_wa_${Date.now()}.ogg`);
                    fs.writeFileSync(tempFile, Buffer.from(media.data, 'base64'));

                    console.log("🎙️ Transcribiendo audio con Groq Whisper...");
                    const translation = await groq.audio.transcriptions.create({
                        file: fs.createReadStream(tempFile),
                        model: "whisper-large-v3",
                        language: "es",
                    });

                    text = translation.text;
                    console.log(`📝 Transcripción WA: "${text}"`);

                    // Limpiar temporal
                    fs.unlinkSync(tempFile);

                    // Avisar al usuario qué entendimos
                    await msg.reply(`🎤 _"${text}"_`);

                } catch (audioErr) {
                    console.error("Error procesando audio WA:", audioErr);
                    return msg.reply("❌ No pude procesar tu mensaje de voz.");
                }
            }

            if (!text && !msg.hasMedia) return;

            // Buscar usuario por whatsappId
            let user = await User.findOne({ whatsappId: senderId });

            if (text && text.toLowerCase() === '/start') {
                if (!user) {
                    return msg.reply(`👋 ¡Hola! Soy tu asistente de Finanzas.\n\nPara vincular tu cuenta, ingresa este ID en el panel web: ${senderId}`);
                }
                return msg.reply(`👋 ¡Hola de nuevo, ${user.name}! Estoy listo para tus gastos.`);
            }

            if (!user) {
                return msg.reply(`⛔ Cuenta no vinculada. Por favor, regístrate en la web y vincula tu WhatsApp usando este ID: ${senderId}`);
            }

            // Lógica de transacciones inteligentes (Mismo que Telegram)
            if (text && /\d/.test(text)) {
                const parsed = parseSmartMessage(text);
                if (parsed.amount) {
                    if (parsed.type === 'expense') {
                        await Expense.create({
                            user: user._id,
                            amount: parsed.amount,
                            category: parsed.category,
                            description: parsed.description,
                            date: parsed.date
                        });
                        return msg.reply(`✅ *Gasto Registrado*\n💰 Monto: S/. ${parsed.amount.toFixed(2)}\n🏷️ Categoría: ${parsed.category}\n📝 Detalle: ${parsed.description}`);
                    } else if (parsed.type === 'income') {
                        await Income.create({
                            user: user._id,
                            amount: parsed.amount,
                            category: parsed.category,
                            source: parsed.description,
                            date: parsed.date
                        });
                        return msg.reply(`✅ *Ingreso Registrado*\n💰 Monto: S/. ${parsed.amount.toFixed(2)}\n🏷️ Fuente: ${parsed.description}`);
                    } else if (parsed.type === 'debt') {
                        await Debt.create({
                            user: user._id,
                            name: parsed.description,
                            target: parsed.amount,
                            current: 0,
                            date: parsed.date
                        });
                        return msg.reply(`🚩 *Deuda Registrada*\n👤 Detalle: ${parsed.description}\n💰 Monto: S/. ${parsed.amount.toFixed(2)}\n\n💡 _Dime "Abonar a ${parsed.description} 10" cuando hagas un pago._`);
                    } else if (parsed.type === 'goal') {
                        let goal = await Goal.findOne({ user: user._id, name: new RegExp(parsed.description, 'i') });
                        if (!goal) goal = await Goal.findOne({ user: user._id });

                        if (goal) {
                            goal.current += parsed.amount;
                            goal.history.push({ amount: parsed.amount, date: parsed.date, note: 'Desde WhatsApp' });
                            await goal.save();
                            return msg.reply(`🎯 *Ahorro Registrado*\n💰 +S/. ${parsed.amount.toFixed(2)} para *${goal.name}*\n📈 Progreso: S/. ${goal.current} / S/. ${goal.target}`);
                        } else {
                            return msg.reply(`⚠️ No encontré una meta de ahorro llamada "${parsed.description}". Regístrala primero en la web.`);
                        }
                    }
                }
            }

            // IA Fallback
            if (text && (process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY)) {
                const aiResponse = await processAIQuery(text, user);
                msg.reply(aiResponse);
            }

        } catch (error) {
            console.error('Error en WhatsApp Bot:', error);
        }
    });

    client.initialize();
};

async function processAIQuery(text, user) {
    try {
        const context = await getFinancialContext(user._id);
        const prompt = `
        [DATOS FINANCIEROS REALES]:
        ${context}

        [USUARIO]: ${user.name}
        [MENSAJE]: "${text}"
        
        [INSTRUCCIÓN]: 
        1. Responde de forma breve y amigable.
        2. Usa los DATOS FINANCIEROS REALES para responder preguntas sobre balance, gastos o ingresos.
        3. SI NO hay datos para lo que pide (ej. "ayer"), dile honestamente que no hay registro. No inventes montos.
        `;

        if (groq) {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant",
            });
            return completion.choices[0].message.content;
        } else {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        }
    } catch (err) {
        console.error("Error in WA AI Query:", err);
        return "⚠️ Lo siento, tuve un problema procesando tu mensaje.";
    }
}
