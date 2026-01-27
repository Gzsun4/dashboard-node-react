import { Server } from 'socket.io';

let io;
const onlineUsers = new Map(); // Map<userId, { socketId, lastSeen }>

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? process.env.FRONTEND_URL
                : 'http://localhost:5173',
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Handle user coming online
        socket.on('user:online', (userId) => {
            if (!userId) return;

            onlineUsers.set(userId, {
                socketId: socket.id,
                lastSeen: new Date()
            });

            console.log(`User ${userId} is now online`);

            // Broadcast updated status to all admin clients
            broadcastUserStatus();
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);

            // Find and remove user from online list
            for (const [userId, data] of onlineUsers.entries()) {
                if (data.socketId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`User ${userId} is now offline`);
                    break;
                }
            }

            // Broadcast updated status
            broadcastUserStatus();
        });
    });

    console.log('Socket.IO server initialized');
    return io;
};

/**
 * Broadcast user status to all connected admin clients
 */
const broadcastUserStatus = () => {
    if (!io) return;

    const onlineUserIds = Array.from(onlineUsers.keys());

    // Emit to all connected clients
    io.emit('users:status', {
        onlineUsers: onlineUserIds,
        timestamp: new Date()
    });
};

/**
 * Get current online users
 */
export const getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};

/**
 * Check if a user is online
 */
export const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};

export default io;
