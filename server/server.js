import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';

dotenv.config();

connectDB();

const app = express();

console.log("Starting server..."); // Debug log for deployment

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/reminders', reminderRoutes);

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Setup reminder cron job
import cron from 'node-cron';
import ReminderConfig from './models/ReminderConfig.js';
import { sendTelegramMessage } from './services/telegramService.js';

// Run every minute to check for reminders
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // Find all active reminders matching current time
        const reminders = await ReminderConfig.find({
            isActive: true,
            reminderTime: currentTime
        }).populate('user', 'name');

        for (const reminder of reminders) {
            const message = `🔔 <b>Recordatorio</b>\n\n¡Hola ${reminder.user.name}!\n\nNo olvides registrar tus gastos e ingresos del día en tu dashboard financiero.\n\n💰 Mantén tus finanzas bajo control.`;

            try {
                await sendTelegramMessage(reminder.telegramChatId, message);
                console.log(`Reminder sent to user ${reminder.user.name} at ${currentTime}`);
            } catch (error) {
                console.error(`Failed to send reminder to ${reminder.user.name}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error in reminder cron job:', error);
    }
});
