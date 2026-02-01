import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

export const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (!user) {
            // Disconnect if user logs out
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        // Connect to WebSocket server
        const socketUrl = import.meta.env.PROD
            ? window.location.origin
            : 'http://localhost:5000';

        const newSocket = io(socketUrl, {
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            // Emit user online event
            newSocket.emit('user:online', user._id);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        // Listen for user status updates
        newSocket.on('users:status', (data) => {
            setOnlineUsers(data.onlineUsers || []);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
