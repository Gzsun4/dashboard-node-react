import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import testRoutes from './routes/testRoutes.js';
import cron from 'node-cron';
import ReminderConfig from './models/ReminderConfig.js';
import { sendTelegramMessage } from './services/telegramService.js';
import { initializeBot } from './services/telegramBot.js';

dotenv.config();

console.log("Starting server..."); // Debug log for deployment
console.log("Connecting to database...");

connectDB().catch(err => {
    console.error("Database connection failed:", err.message);
    console.log("Server will continue without database connection");
});

const app = express();

console.log("Express app initialized");


app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/test', testRoutes);

const PORT = process.env.PORT || 5000;

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));

    app.get(/(.*)/, (req, res) =>
        res.sendFile(path.resolve(__dirname, '../', 'dist', 'index.html'))
    );
} else {
    app.get('/', (req, res) => res.send('Server is ready'));
}

console.log(`About to start server on port ${PORT}...`);

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

    // Initialize Telegram bot
    initializeBot();

    // Setup reminder cron job after server starts
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            // Convert to Peru time (UTC-5)
            const peruTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
            const currentTime = `${String(peruTime.getHours()).padStart(2, '0')}:${String(peruTime.getMinutes()).padStart(2, '0')}`;

            // Find all active reminders matching current time
            const reminders = await ReminderConfig.find({
                isActive: true,
                reminderTime: currentTime
            }).populate('user', 'name');

            if (reminders.length > 0) {
                console.log(`Checking reminders at Peru time: ${currentTime}, found ${reminders.length} reminder(s)`);
            }

            for (const reminder of reminders) {
                const message = `🔔 <b>Recordatorio</b>\n\n¡Hola ${reminder.user.name}!\n\nNo olvides registrar tus gastos e ingresos del día en tu dashboard financiero.\n\n💰 Mantén tus finanzas bajo control.`;

                try {
                    await sendTelegramMessage(reminder.telegramChatId, message);
                    console.log(`Reminder sent to user ${reminder.user.name} at ${currentTime} Peru time`);
                } catch (error) {
                    console.error(`Failed to send reminder to ${reminder.user.name}:`, error.message);
                }
            }
        } catch (error) {
            console.error('Error in reminder cron job:', error);
        }
    });
});
