import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { sendTelegramMessage } from './services/telegramService.js';
import { initializeBot } from './services/telegramBot.js';
import { initializeSocket } from './services/socketService.js';

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

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

httpServer.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);
    console.log('WebSocket server ready for connections');

    // Initialize Telegram bot
    initializeBot();

    console.log('Telegram bot service started');
});
